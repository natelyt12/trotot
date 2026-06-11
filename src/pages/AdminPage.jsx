import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TbLayoutDashboard, TbUserCheck, TbSettings, TbArrowLeft, TbBuildingWarehouse, TbRefresh, TbPlus, TbListDetails, TbUserCog } from "react-icons/tb";
import { useModal } from "../context/ModalContext";
import { useNotification } from "../context/NotificationContext";
import { supabase } from "../lib/supabase";
import { cleanMockData, runScenario } from "../../genData/coreGenerator.js";
import RoomDetailPage from "./RoomDetailPage.jsx";
import { mapSupabaseRoom } from "../utils/roomMapper.js";

// Import sub-components
import OverviewTab from "../components/admin/OverviewTab.jsx";
import RoomsTab from "../components/admin/RoomsTab.jsx";
import KycTab from "../components/admin/KycTab.jsx";
import UserManagementTab from "../components/admin/UserManagementTab.jsx";
import MockManagerTab from "../components/admin/MockManagerTab.jsx";
import SettingsTab from "../components/admin/SettingsTab.jsx";
import { INITIAL_KYC_REQUESTS } from "../components/admin/mockData.js";

const formatRules = (rules) => {
    if (!rules) return "";
    if (typeof rules === "string") return rules;
    if (typeof rules === "object") {
        const parts = [];
        if (rules.curfew) parts.push(`Giờ giấc: ${rules.curfew}`);
        if (rules.is_pet_allowed)
            parts.push(rules.is_pet_allowed === "yes" || rules.is_pet_allowed === true ? "Cho phép nuôi thú cưng" : "Không nuôi thú cưng");
        if (rules.gender_preference) {
            const genderLabel = rules.gender_preference === "all" ? "Tất cả" : rules.gender_preference === "male" ? "Nam" : "Nữ";
            parts.push(`Yêu cầu giới tính: ${genderLabel}`);
        }
        return parts.join(" | ");
    }
    return "";
};

export default function AdminPage({ navigate }) {
    const { showModal } = useModal();
    const { addNotification } = useNotification();
    const [activeSubTab, setActiveSubTab] = useState("overview"); // 'overview', 'rooms', 'kyc', 'settings'
    const [roomsSubTab, setRoomsSubTab] = useState("pending_publish"); // 'pending_publish', 'unverified', 'verified'

    // Real DB States
    const [allRooms, setAllRooms] = useState([]);
    const [pendingRooms, setPendingRooms] = useState([]);
    const [kycRequests, setKycRequests] = useState(INITIAL_KYC_REQUESTS); // Mock KYC as there is no DB table for it

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLandlords: 0,
        totalTenants: 0,
        totalRoomsCount: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // Mock manager states
    const [currentUserId, setCurrentUserId] = useState(null);
    const [mockStats, setMockStats] = useState({ mockRooms: 0 });
    const [isRunningScenario, setIsRunningScenario] = useState(false);
    const [scenarioProgress, setScenarioProgress] = useState({ step: 0, percent: 0, text: "" });

    // Preview room overlay state
    const [previewAdminRoom, setPreviewAdminRoom] = useState(null);
    const [loadingPreviewRoom, setLoadingPreviewRoom] = useState(false);

    // User management states
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");

    // Rooms filter by user states
    const [roomUserFilter, setRoomUserFilter] = useState(null); // { id, name }
    const [roomUserSearch, setRoomUserSearch] = useState("");

    // Fetch current auth user on mount
    useEffect(() => {
        const getUserId = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setCurrentUserId(data.user.id);
            }
        };
        getUserId();
    }, []);

    // Fetch Mock stats and users
    const fetchMockStats = useCallback(async () => {
        try {
            // Count rooms
            const { count: roomsCount } = await supabase.from("rooms").select("*", { count: "exact", head: true }).ilike("listing_id", "TT-MOCK-%");

            setMockStats({
                mockRooms: roomsCount || 0,
            });
        } catch (err) {
            console.error("Error fetching mock stats:", err);
        }
    }, []);

    useEffect(() => {
        if (activeSubTab === "mock_manager") {
            fetchMockStats();
        }
    }, [activeSubTab, fetchMockStats]);

    // Fetch Real Stats & All Active Rooms from Supabase
    const fetchAdminData = useCallback(async () => {
        setLoadingStats(true);
        try {
            // 1. Fetch counts
            const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });

            const { count: landlordsCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "landlord");

            const { count: tenantsCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tenant");

            const { count: roomsCount } = await supabase.from("rooms").select("*", { count: "exact", head: true });

            setStats({
                totalUsers: usersCount || 0,
                totalLandlords: landlordsCount || 0,
                totalTenants: tenantsCount || 0,
                totalRoomsCount: roomsCount || 0,
            });

            // 2. Fetch all available rooms (both verified and unverified)
            const { data: roomsData, error: roomsError } = await supabase
                .from("rooms")
                .select("*, profiles(*)")
                .in("status", ["available", "pending"])
                .order("created_at", { ascending: false });

            if (roomsError) throw roomsError;

            // Map all rooms for UI
            const mappedRooms = (roomsData || []).map((room) => {
                const profile = room.profiles;
                return {
                    id: room.id,
                    title: room.title,
                    owner: profile?.full_name || room.media_contact?.contact?.name || "Bên cho thuê",
                    owner_phone: profile?.phone || room.media_contact?.contact?.phone || "Chưa cập nhật",
                    owner_avatar: profile?.avatar_url,
                    price_monthly: room.price_monthly,
                    area_sqm: room.area_sqm,
                    address: [room.address, room.ward, room.district, room.city].filter(Boolean).join(", "),
                    date: new Date(room.created_at).toLocaleDateString("vi-VN"),
                    image: room.media_contact?.images?.[0]?.url || "/images/placeholder.png",
                    description: room.description || formatRules(room.rules_utilities) || "Không có mô tả.",
                    is_verified: room.is_verified,
                    room_type: room.room_type,
                    status: room.status,
                    available_until: room.available_until,
                };
            });

            setAllRooms(mappedRooms);
            setPendingRooms(mappedRooms.filter((r) => r.status === "pending"));
        } catch (err) {
            console.error("Error fetching admin dashboard data:", err);
            addNotification("Lỗi khi tải dữ liệu từ cơ sở dữ liệu!", "error");
        } finally {
            setLoadingStats(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Approve Room Handler
    const handleApproveRoom = (roomId, title) => {
        showModal({
            title: "Phê duyệt tin đăng",
            message: `Bạn có chắc chắn muốn PHÊ DUYỆT tin đăng "${title}"? Tin trọ này sẽ xuất hiện công khai trên trang chủ lập tức.`,
            type: "warning",
            confirmText: "Phê duyệt",
            cancelText: "Hủy bộ",
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("rooms").update({ is_verified: true }).eq("id", roomId);

                    if (error) throw error;

                    addNotification("Đã phê duyệt tin đăng phòng trọ thành công!", "success");
                    fetchAdminData(); // Refresh counts
                } catch (err) {
                    console.error("Error approving room:", err);
                    addNotification("Có lỗi xảy ra khi phê duyệt phòng.", "error");
                }
            },
        });
    };

    // Approve Room Publish Handler (moves status to 'available')
    const handleApprovePublish = (roomId, title) => {
        showModal({
            title: "Duyệt tin đăng",
            message: `Bạn có chắc chắn muốn Duyệt tin đăng "${title}"? Tin trọ này sẽ xuất hiện công khai trên trang chủ nhưng CHƯA XÁC THỰC.`,
            type: "warning",
            confirmText: "Duyệt",
            cancelText: "Hủy bộ",
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("rooms").update({ status: "available" }).eq("id", roomId);

                    if (error) throw error;

                    addNotification("Đã Duyệt tin đăng phòng trọ thành công!", "success");
                    fetchAdminData(); // Refresh list and counts
                } catch (err) {
                    console.error("Error approving room publication:", err);
                    addNotification("Có lỗi xảy ra khi Duyệt phòng.", "error");
                }
            },
        });
    };

    // Cancel Room Verification Handler (move is_verified = false)
    const handleCancelVerification = (roomId, title) => {
        showModal({
            title: "Hủy xác thực tin đăng",
            message: `Bạn có chắc chắn muốn HỦY XÁC THỰC tin đăng "${title}" không? Tin này sẽ chuyển về hàng chờ kiểm duyệt.`,
            type: "warning",
            confirmText: "Hủy xác thực",
            cancelText: "Hủy bỏ",
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("rooms").update({ is_verified: false }).eq("id", roomId);

                    if (error) throw error;

                    addNotification("Đã hủy xác thực tin đăng thành công!", "success");
                    fetchAdminData(); // Refresh list and counts
                } catch (err) {
                    console.error("Error cancelling room verification:", err);
                    addNotification("Có lỗi xảy ra khi hủy xác thực phòng.", "error");
                }
            },
        });
    };

    // Reject Room Handler
    const handleRejectRoom = (roomId, title) => {
        showModal({
            title: "Từ chối tin đăng",
            message: `Bạn có chắc chắn muốn TỪ CHỐI tin đăng "${title}" không? Tin sẽ bị gỡ về bản nháp và thông báo cho người đăng.`,
            type: "error",
            confirmText: "Từ chối",
            cancelText: "Hủy bộ",
            onConfirm: async () => {
                try {
                    const { error } = await supabase.from("rooms").update({ status: "draft", is_verified: false }).eq("id", roomId);

                    if (error) throw error;

                    addNotification("Đã từ chối tin đăng và chuyển về bản nháp.", "warning");
                    fetchAdminData(); // Refresh counts
                } catch (err) {
                    console.error("Error rejecting room:", err);
                    addNotification("Có lỗi xảy ra khi từ chối tin đăng.", "error");
                }
            },
        });
    };

    // Approve KYC Handler
    const handleApproveKYC = (kycId, fullName) => {
        showModal({
            title: "Phê duyệt hồ sơ KYC",
            message: `Bạn có chắc chắn muốn PHÊ DUYỆT hồ sơ nâng cấp Chủ nhà của "${fullName}"? Tài khoản này sẽ được nâng cấp vai trò Bên cho thuê (Chủ nhà).`,
            type: "warning",
            confirmText: "Duyệt KYC",
            cancelText: "Hủy bỏ",
            onConfirm: () => {
                setKycRequests((prev) => prev.filter((req) => req.id !== kycId));
                addNotification(`Đã nâng cấp tài khoản của ${fullName} thành chủ nhà thành công!`, "success");
            },
        });
    };

    // Reject KYC Handler
    const handleRejectKYC = (kycId, fullName) => {
        showModal({
            title: "Từ chối hồ sơ KYC",
            message: `Bạn có chắc chắn muốn TỪ CHỐI hồ sơ xác thực của "${fullName}"? Hồ sơ này sẽ bị từ chối và chủ tài khoản sẽ được thông báo làm lại.`,
            type: "error",
            confirmText: "Từ chối",
            cancelText: "Hủy bỏ",
            onConfirm: () => {
                setKycRequests((prev) => prev.filter((req) => req.id !== kycId));
                addNotification(`Đã từ chối hồ sơ KYC của ${fullName}.`, "warning");
            },
        });
    };

    // Launch preset scenario
    const handleLaunchScenario = async (scenarioId) => {
        setIsRunningScenario(true);
        setScenarioProgress({ step: 0, percent: 5, text: "Đang kết nối hệ thống..." });

        const result = await runScenario(
            scenarioId,
            currentUserId || "d88d12e3-68d2-400d-a5df-a9b55153c342", // Fallback nếu chưa đăng nhập
            supabase,
            (step, percent, text) => {
                setScenarioProgress({ step, percent, text });
            },
        );

        if (result.success) {
            addNotification("Chạy kịch bản dữ liệu thành công!", "success");
            fetchMockStats();
            fetchAdminData(); // Refresh counts
        } else {
            addNotification(`Lỗi: ${result.error}`, "error");
        }

        setTimeout(() => {
            setIsRunningScenario(false);
        }, 1500);
    };

    // Clean all mock data
    const handleCleanAllMock = () => {
        showModal({
            title: "Dọn dẹp Mock Data an toàn",
            message:
                "Hành động này sẽ xóa sạch toàn bộ chủ nhà giả lập, tin trọ mock (TT-MOCK) và bình luận đi kèm. Dữ liệu thật sẽ được giữ lại nguyên vẹn 100%. Bạn có chắc chắn muốn dọn dẹp?",
            type: "warning",
            confirmText: "Dọn dẹp ngay",
            cancelText: "Hủy bỏ",
            onConfirm: async () => {
                setIsRunningScenario(true);
                setScenarioProgress({ step: 0, percent: 5, text: "Đang dọn dẹp..." });

                const result = await cleanMockData(supabase, (step, percent, text) => {
                    setScenarioProgress({ step, percent, text });
                });

                if (result.success) {
                    addNotification("Đã dọn dẹp sạch toàn bộ Mock Data an toàn!", "success");
                    fetchMockStats();
                    fetchAdminData();
                } else {
                    addNotification(`Lỗi: ${result.error}`, "error");
                }

                setTimeout(() => {
                    setIsRunningScenario(false);
                }, 1500);
            },
        });
    };

    // Open room detail overlay for admin
    const handleOpenRoomPreview = useCallback(
        async (roomId) => {
            setLoadingPreviewRoom(true);
            try {
                const { data, error } = await supabase.from("rooms").select("*, profiles(*)").eq("id", roomId).single();
                if (error) throw error;
                setPreviewAdminRoom(mapSupabaseRoom(data));
            } catch (err) {
                console.error("Error fetching room detail:", err);
                addNotification("Không thể tải chi tiết phòng.", "error");
            } finally {
                setLoadingPreviewRoom(false);
            }
        },
        [addNotification],
    );

    // Fetch all profiles for user management tab
    const fetchAllUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const { data: profilesData, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

            if (error) throw error;

            // Fetch room counts per user
            const { data: roomCounts } = await supabase.from("rooms").select("user_id");

            const countMap = {};
            (roomCounts || []).forEach((r) => {
                countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
            });

            const mapped = (profilesData || []).map((u) => ({
                ...u,
                roomsCount: countMap[u.id] || 0,
            }));

            setAllUsers(mapped);
        } catch (err) {
            console.error("Error fetching all users:", err);
            addNotification("Không thể tải danh sách người dùng.", "error");
        } finally {
            setLoadingUsers(false);
        }
    }, [addNotification]);

    useEffect(() => {
        if (activeSubTab === "user_management") {
            fetchAllUsers();
        }
    }, [activeSubTab, fetchAllUsers]);

    // Delete user from user management tab
    const handleDeleteUserFull = (userId, name, role) => {
        if (role === "admin") {
            addNotification("Không thể xóa tài khoản Admin!", "error");
            return;
        }
        showModal({
            title: "Xóa tài khoản người dùng",
            message: `Bạn có chắc chắn muốn XÓA tài khoản "${name}"? Toàn bộ tin đăng của người dùng này cũng sẽ bị xóa. Hành động này không thể hoàn tác.`,
            type: "error",
            confirmText: "Xóa vĩnh viễn",
            cancelText: "Hủy bỏ",
            onConfirm: async () => {
                try {
                    await supabase.from("rooms").delete().eq("user_id", userId);
                    await supabase.from("profiles").delete().eq("id", userId);
                    addNotification(`Đã xóa tài khoản ${name} thành công!`, "success");
                    fetchAllUsers();
                    fetchAdminData();
                } catch (err) {
                    console.error("Error deleting user:", err);
                    addNotification("Có lỗi xảy ra khi xóa tài khoản.", "error");
                }
            },
        });
    };

    const MotionDiv = motion.div;

    return (
        <div className="min-h-screen bg-stone-50 pt-28 pb-16">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
                {/* Upper bar with Back to homepage */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate("home")}
                        className="flex items-center gap-2 bg-white border border-stone-200 rounded-full pl-2 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-medium hover:bg-stone-50 hover:text-stone-900 transition-all duration-200 group"
                    >
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200">
                            <TbArrowLeft size={14} strokeWidth={2.5} />
                        </div>
                        <span>Quay lại trang chủ</span>
                    </button>

                    <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 px-4 py-1.5 rounded-full text-xs font-medium border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Admin Workspace
                    </div>
                </div>

                {/* Main Admin Section Grid */}
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-[260px] shrink-0 bg-white border border-stone-200 rounded-xl p-6 flex flex-col justify-between h-auto shadow-sm">
                        <div>
                            {/* Logo Admin header */}
                            <div className="mb-8 border-b border-stone-100 pb-5">
                                <h2 className="text-stone-900 text-lg font-bold tracking-tight font-heading flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                                    TroTot Admin
                                </h2>
                                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-1">Hệ thống kiểm duyệt</p>
                            </div>

                            {/* Sidebar Tab List */}
                            <div className="space-y-1.5">
                                {[
                                    { id: "overview", label: "Thống kê tổng quan", icon: TbLayoutDashboard },
                                    { id: "rooms", label: "Duyệt tin trọ", icon: TbBuildingWarehouse, badge: pendingRooms.length },
                                    { id: "kyc", label: "Xác thực KYC", icon: TbUserCheck, badge: kycRequests.length },
                                    { id: "user_management", label: "Quản lý người dùng", icon: TbUserCog },
                                    { id: "mock_manager", label: "Quản lý Mock Data", icon: TbRefresh },
                                    { id: "settings", label: "Cài đặt hệ thống", icon: TbSettings },
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeSubTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveSubTab(tab.id)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left font-medium text-sm border cursor-pointer transition-all duration-200 ${
                                                isActive
                                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                                    : "bg-transparent border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                                <span>{tab.label}</span>
                                            </div>
                                            {tab.badge !== undefined && tab.badge > 0 && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                        isActive ? "bg-white text-amber-600" : "bg-red-500 text-white"
                                                    }`}
                                                >
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}

                                <div className="h-px bg-stone-200 my-4" />
                                <div className="px-3 py-1 text-[10px] font-medium text-stone-400 uppercase tracking-widest mb-1">Tiện ích chủ nhà</div>
                                <button
                                    onClick={() => navigate("dashboard", { tab: "post_room" })}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm border-none cursor-pointer bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all duration-200"
                                >
                                    <TbPlus size={18} />
                                    <span>Đăng tin mới</span>
                                </button>
                                <button
                                    onClick={() => navigate("dashboard")}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm border-none cursor-pointer bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-all duration-200"
                                >
                                    <TbListDetails size={18} />
                                    <span>Quản lý tin đăng</span>
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Footer info */}
                        <div className="border-t border-stone-100 pt-5 mt-8 text-[11px] text-stone-400 font-normal">
                            <p>© 2026 TroTot Administration.</p>
                            <p className="mt-1">Version 1.0.0 Stable</p>
                        </div>
                    </aside>

                    {/* Content Panel Area */}
                    <main className="flex-1 w-full bg-white border border-stone-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col min-h-[650px]">
                        {/* --- TAB: OVERVIEW --- */}
                        {activeSubTab === "overview" && (
                            <OverviewTab
                                stats={stats}
                                loadingStats={loadingStats}
                                pendingRooms={pendingRooms}
                                onRejectRoom={handleRejectRoom}
                                onApprovePublish={handleApprovePublish}
                                onOpenRoomPreview={handleOpenRoomPreview}
                                loadingPreviewRoom={loadingPreviewRoom}
                                onViewAllPending={() => {
                                    setActiveSubTab("rooms");
                                    setRoomsSubTab("pending_publish");
                                }}
                                onRefresh={async () => {
                                    await fetchAdminData();
                                    addNotification("Đã làm mới thành công!", "success");
                                }}
                            />
                        )}

                        {/* --- TAB: ROOMS MODERATION --- */}
                        {activeSubTab === "rooms" && (
                            <RoomsTab
                                allRooms={allRooms}
                                pendingRooms={pendingRooms}
                                roomsSubTab={roomsSubTab}
                                setRoomsSubTab={setRoomsSubTab}
                                roomUserFilter={roomUserFilter}
                                setRoomUserFilter={setRoomUserFilter}
                                roomUserSearch={roomUserSearch}
                                setRoomUserSearch={setRoomUserSearch}
                                onRefresh={async () => {
                                    await fetchAdminData();
                                    addNotification("Đã làm mới thành công!", "success");
                                }}
                                onOpenRoomPreview={handleOpenRoomPreview}
                                onCancelVerification={handleCancelVerification}
                                onRejectRoom={handleRejectRoom}
                                onApproveRoom={handleApproveRoom}
                                onApprovePublish={handleApprovePublish}
                                loadingPreviewRoom={loadingPreviewRoom}
                            />
                        )}

                        {/* --- TAB: KYC REQUESTS --- */}
                        {activeSubTab === "kyc" && <KycTab kycRequests={kycRequests} onApproveKYC={handleApproveKYC} onRejectKYC={handleRejectKYC} />}

                        {/* --- TAB: MOCK DATA MANAGER --- */}
                        {activeSubTab === "mock_manager" && (
                            <MockManagerTab
                                mockStats={mockStats}
                                onRefreshMockStats={async () => {
                                    await fetchMockStats();
                                    await fetchAdminData();
                                    addNotification("Đã làm mới thành công!", "success");
                                }}
                                onCleanAllMock={handleCleanAllMock}
                                onLaunchScenario={handleLaunchScenario}
                            />
                        )}

                        {/* --- TAB: USER MANAGEMENT --- */}
                        {activeSubTab === "user_management" && (
                            <UserManagementTab
                                allUsers={allUsers}
                                loadingUsers={loadingUsers}
                                onRefresh={async () => {
                                    await fetchAllUsers();
                                    addNotification("Đã làm mới thành công!", "success");
                                }}
                                userSearchQuery={userSearchQuery}
                                setUserSearchQuery={setUserSearchQuery}
                                onDeleteUser={handleDeleteUserFull}
                            />
                        )}

                        {/* --- TAB: SETTINGS --- */}
                        {activeSubTab === "settings" && <SettingsTab />}
                    </main>
                </div>
            </div>

            {/* Modal Tiến trình chạy kịch bản */}
            <AnimatePresence>
                {isRunningScenario && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white border border-stone-200 shadow-2xl rounded-2xl p-6 w-full max-w-md space-y-5 text-center"
                        >
                            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 mx-auto animate-bounce">
                                <TbRefresh size={26} className="animate-spin" />
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-base font-semibold text-stone-950 font-heading">
                                    {scenarioProgress.percent === 100 ? "Hoàn tất!" : "Đang thực thi tác vụ..."}
                                </h3>
                                <p className="text-xs text-stone-500 font-normal">{scenarioProgress.text}</p>
                            </div>

                            {/* Thanh phần trăm tiến trình */}
                            <div className="space-y-1">
                                <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${scenarioProgress.percent}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] font-bold text-amber-600 text-right">{scenarioProgress.percent}%</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Room Detail Preview Overlay */}
            {previewAdminRoom && (
                <div className="fixed inset-0 z-[100] overflow-y-auto bg-white">
                    <RoomDetailPage room={previewAdminRoom} navigate={navigate} user={null} onClose={() => setPreviewAdminRoom(null)} previewMode={true} />
                </div>
            )}
        </div>
    );
}
