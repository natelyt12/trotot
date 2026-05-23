import { useState, useEffect, useRef } from "react";
import { createRoom, updateRoom, uploadRoomMedia, deleteRoomMedia, getRoomMediaPublicUrl } from "../../services/roomService";
import { useModal } from "../../context/ModalContext";
import { useNotification } from "../../context/NotificationContext";
import AppIcon from "../common/AppIcon";
import { AMENITIES, ROOM_TYPES, BATHROOM_TYPES, LAUNDRY_TYPES, CURFEW_LABELS, KITCHEN_TYPES, GENDER_PREFERENCES } from "../../constants/constants";
import { PROVINCE } from "../../constants/province";
import { UNIVERSITIES } from "../../constants/universities";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage, deleteFromCloudinary } from "../../utils/imageUtils";

/**
 * RoomPostForm - Chức năng đăng tin mới (Single Form)
 * Thiết kế hiện đại, tinh tế, tối ưu cho môi giới và chủ nhà.
 */
export default function RoomPostForm({ user, onClear, onSuccess, roomToEdit }) {
    const { showModal, showProgress, updateProgress, hideProgress } = useModal();
    const { addNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialFormState, setInitialFormState] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // --- STATE CHO FORM ---
    const [formData, setFormData] = useState({
        // Cơ bản
        title: "",
        room_type: "room",
        status: "draft",
        price_monthly: "",
        area_sqm: "",

        // Vị trí
        city: "Thành phố Hà Nội",
        district: "",
        ward: "",
        address: "",

        // Chi phí (JSONB)
        monthly_costs: {
            deposit_amount: "",
            electricity: { price: 3800, unit: "kWh" },
            water: { price: 30000, unit: "m3" },
            internet: 100000,
            parking_fee: 0,
            extra_services: [],
        },

        // Tiện ích & Số lượng (JSONB)
        room_features: {
            counts: {
                bedrooms: 1,
                bathrooms: 1,
                beds: 1,
                capacity: 2,
            },
            bathroom_type: "private",
            kitchen_type: "private",
            amenities: [],
        },

        // Nội quy & Ưu tiên (JSONB)
        rules_utilities: {
            is_shared_with_host: false,
            curfew: "none",
            gender_preference: "all",
            is_pet_allowed: true,
            laundry_type: "private",
        },

        // Truyền thông (JSONB)
        media_contact: {
            images: [],
            video_urls: [],
            description: "",
            google_map_url: "",
        },
    });

    // --- XỬ LÝ ĐỊA DANH ---
    const [previewImages, setPreviewImages] = useState([]);
    const currentProvince = PROVINCE.find((p) => p.name === formData.city);
    const districts = currentProvince?.districts || [];
    const currentDistrict = districts.find((d) => d.name === formData.district);
    const wards = currentDistrict?.wards || [];
    const MotionDiv = motion.div;

    // --- EFFECT HOẶC INITIAL STATE CHO EDIT MODE ---
    useEffect(() => {
        if (!roomToEdit) {
            return;
        }

        const initialForm = {
            title: roomToEdit.title || "",
            status: "draft",
            room_type: roomToEdit.room_type || "room",
            price_monthly: roomToEdit.price_monthly?.toString() || "",
            area_sqm: roomToEdit.area_sqm?.toString() || "",
            city: roomToEdit.city || "Thành phố Hà Nội",
            district: roomToEdit.district || "",
            ward: roomToEdit.ward || "",
            address: roomToEdit.address || "",
            monthly_costs: roomToEdit.monthly_costs || {
                deposit_amount: "",
                electricity: { price: 3800, unit: "kWh" },
                water: { price: 30000, unit: "m3" },
                internet: 100000,
                parking_fee: 0,
                extra_services: [],
            },
            room_features: roomToEdit.room_features || {
                counts: { bedrooms: 1, bathrooms: 1, beds: 1, capacity: 2 },
                bathroom_type: "private",
                kitchen_type: "private",
                amenities: [],
            },
            rules_utilities: roomToEdit.rules_utilities || {
                is_shared_with_host: false,
                curfew: "none",
                gender_preference: "all",
                is_pet_allowed: true,
                laundry_type: "private",
            },
            media_contact: {
                images: roomToEdit.media_contact?.images || [],
                video_urls: roomToEdit.media_contact?.video_urls || [],
                description: roomToEdit.media_contact?.description || "",
                google_map_url: roomToEdit.media_contact?.google_map_url || "",
            },
        };

        const initialImgs = roomToEdit.media_contact?.images
            ? roomToEdit.media_contact.images.map((img) => ({
                  url: img.url,
                  file: null,
              }))
            : [];

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(initialForm);

        if (roomToEdit.media_contact?.images) {
            setPreviewImages(initialImgs);
        }

        setInitialFormState({
            form: JSON.stringify(initialForm),
            images: JSON.stringify(initialImgs.map(img => img.url))
        });
    }, [roomToEdit]);

    useEffect(() => {
        if (!roomToEdit && !initialFormState) {
            setInitialFormState({
                form: JSON.stringify(formData),
                images: JSON.stringify([])
            });
        }
    }, [roomToEdit, initialFormState]);

    const isDirty = (() => {
        if (!initialFormState) return false;
        const currentForm = JSON.stringify(formData);
        const currentImages = JSON.stringify(previewImages.map(img => img.url));
        return initialFormState.form !== currentForm || initialFormState.images !== currentImages;
    })();

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && !isSubmitted) {
                e.preventDefault();
                e.returnValue = "Bạn có chắc chắn muốn rời đi? Các thay đổi chưa lưu sẽ bị mất.";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDirty, isSubmitted]);

    const handleClear = () => {
        if (isDirty) {
            showModal({
                title: "Xác nhận hủy",
                message: "Bạn có chắc chắn muốn hủy bỏ? Mọi thay đổi chưa lưu sẽ bị mất.",
                type: "warning",
                confirmText: "Hủy bỏ và rời đi",
                cancelText: "Ở lại tiếp tục",
                onConfirm: () => {
                    onClear();
                },
            });
        } else {
            onClear();
        }
    };

    // --- XỬ LÝ ẢNH ---
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Giới hạn tối đa 6 ảnh
        if (previewImages.length + files.length > 6) {
            showModal({
                title: "Quá số lượng ảnh",
                message: `Bạn chỉ được đăng tối đa 6 ảnh cho mỗi phòng trọ. Hiện tại đã có ${previewImages.length} ảnh, bạn không thể thêm ${files.length} ảnh nữa.`,
                type: "warning",
            });
            return;
        }

        // Kiểm tra định dạng file (Chỉ chấp nhận ảnh)
        const invalidFiles = files.filter((file) => !file.type.startsWith("image/"));
        if (invalidFiles.length > 0) {
            showModal({
                title: "Định dạng không hợp lệ",
                message: `Có ${invalidFiles.length} tệp không phải là hình ảnh. Vui lòng chỉ chọn các tệp hình ảnh (PNG, JPG, JPEG, WEBP, GIF, v.v.).`,
                type: "error",
            });
            return;
        }

        // Giới hạn dung lượng file (VD: 10MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        const oversizedFiles = files.filter((file) => file.size > MAX_SIZE);

        if (oversizedFiles.length > 0) {
            showModal({
                title: "File quá lớn",
                message: `Có ${oversizedFiles.length} file vượt quá giới hạn 10MB. Vui lòng chọn file nhẹ hơn.`,
                type: "warning",
            });
            return;
        }

        const newPreviews = files.map((file) => ({
            url: URL.createObjectURL(file),
            file,
        }));

        setPreviewImages((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    };

    // --- TỰ ĐỘNG MAP TRƯỜNG ĐẠI HỌC ---
    const nearbyUniversities = UNIVERSITIES.filter((uni) => 
        uni.city === formData.city && 
        uni.district === formData.district &&
        (!formData.ward || uni.ward === formData.ward)
    );

    // --- XỬ LÝ TIỆN ÍCH ---
    const sanitizeFilename = (filename) => {
        // Loại bỏ dấu tiếng Việt
        const str = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        // Thay thế ký tự không phải chữ cái/số bằng dấu gạch dưới, giữ lại dấu chấm cho định dạng file
        return str.replace(/[^a-zA-Z0-9.]/g, "_").replace(/_+/g, "_");
    };

    const extractMapSrc = (input) => {
        if (!input) return '';
        if (input.includes('src=')) {
            const match = input.match(/src=["'](https:\/\/www\.google\.com\/maps\/embed[^"']+)["']/);
            if (match && match[1]) {
                return match[1];
            }
        }
        return input.trim();
    };

    const toggleAmenity = (key) => {
        setFormData((prev) => {
            const amenities = prev.room_features.amenities.includes(key)
                ? prev.room_features.amenities.filter((a) => a !== key)
                : [...prev.room_features.amenities, key];
            return {
                ...prev,
                room_features: { ...prev.room_features, amenities },
            };
        });
    };

    // --- XỬ LÝ DỊCH VỤ BỔ SUNG ---
    const addExtraService = () => {
        setFormData((prev) => ({
            ...prev,
            monthly_costs: {
                ...prev.monthly_costs,
                extra_services: [...prev.monthly_costs.extra_services, { name: "", price: "", unit: "tháng" }],
            },
        }));
    };

    const updateExtraService = (index, field, value) => {
        const updated = [...formData.monthly_costs.extra_services];
        updated[index][field] = value;
        setFormData({
            ...formData,
            monthly_costs: { ...formData.monthly_costs, extra_services: updated },
        });
    };

    const removeExtraService = (index) => {
        setFormData((prev) => ({
            ...prev,
            monthly_costs: {
                ...prev.monthly_costs,
                extra_services: prev.monthly_costs.extra_services.filter((_, i) => i !== index),
            },
        }));
    };

    const addVideoUrl = () => {
        const currentUrls = formData.media_contact?.video_urls || [];
        if (currentUrls.length >= 3) {
            addNotification('Tối đa chỉ được nhập 3 đường dẫn video.', 'warning');
            return;
        }
        setFormData(prev => ({
            ...prev,
            media_contact: {
                ...prev.media_contact,
                video_urls: [...currentUrls, '']
            }
        }));
    };

    const updateVideoUrl = (index, value) => {
        const currentUrls = [...(formData.media_contact?.video_urls || [])];
        currentUrls[index] = value;
        setFormData(prev => ({
            ...prev,
            media_contact: {
                ...prev.media_contact,
                video_urls: currentUrls
            }
        }));
    };

    const removeVideoUrl = (index) => {
        const currentUrls = (formData.media_contact?.video_urls || []).filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            media_contact: {
                ...prev.media_contact,
                video_urls: currentUrls
            }
        }));
    };

    // --- XỬ LÝ SUBMIT ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        const normalizedFormData = {
            ...formData,
            title: formData.title.trim() || "Tin đăng không có tiêu đề",
            price_monthly:
                formData.price_monthly === null || formData.price_monthly === undefined || formData.price_monthly === "" ? 0 : formData.price_monthly,
            area_sqm: formData.area_sqm === null || formData.area_sqm === undefined || formData.area_sqm === "" ? 0 : formData.area_sqm,
        };

        // Bỏ qua kiểm tra tính hợp lệ đầy đủ của tin (Validation) khi đăng/sửa tin.
        // Quy trình kiểm duyệt đầy đủ sẽ chỉ chạy khi người dùng bấm "Công khai" từ Dashboard.

        const executeSubmit = async () => {
            setIsSubmitting(true);
            
            // Tính toán tổng số bước xử lý
            const newImages = previewImages.filter(img => img.file);
            const totalSteps = newImages.length * 2 + 1; // 1 bước nén + 1 bước tải lên cho mỗi ảnh mới, + 1 bước lưu DB
            let currentStep = 0;

            showProgress("Bắt đầu chuẩn bị dữ liệu...", 0);

            try {
                const uploadFolder = `${user.id}/${Date.now()}`;
                const finalImages = [];

                // Upload từng ảnh
                for (let i = 0; i < previewImages.length; i++) {
                    const item = previewImages[i];

                    // Nếu là ảnh cũ (không có file), giữ nguyên URL
                    if (!item.file) {
                        finalImages.push({
                            url: item.url,
                            is_cover: i === 0,
                        });
                        continue;
                    }

                    // Bước A: Nén ảnh
                    updateProgress(
                        Math.round((currentStep / totalSteps) * 100),
                        `Đang tối ưu dung lượng ảnh ${i + 1}/${previewImages.length}...`
                    );

                    let fileToUpload = item.file;

                    // Nếu là ảnh mới, thực hiện nén
                    if (fileToUpload.type.startsWith("image/")) {
                        fileToUpload = await compressImage(fileToUpload);
                    }
                    currentStep += 1;

                    // Bước B: Tải ảnh lên
                    updateProgress(
                        Math.round((currentStep / totalSteps) * 100),
                        `Đang tải ảnh ${i + 1}/${previewImages.length} lên máy chủ...`
                    );

                    let publicUrl = "";
                    const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                    const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                    if (cloudinaryCloudName && cloudinaryUploadPreset) {
                        // Tải lên Cloudinary
                        const formDataCloudinary = new FormData();
                        formDataCloudinary.append("file", fileToUpload);
                        formDataCloudinary.append("upload_preset", cloudinaryUploadPreset);

                        const response = await fetch(
                            `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
                            {
                                method: "POST",
                                body: formDataCloudinary,
                            }
                        );

                        if (!response.ok) {
                            const errData = await response.json().catch(() => ({}));
                            throw new Error(errData.error?.message || "Tải ảnh lên Cloudinary thất bại");
                        }

                        const data = await response.json();
                        publicUrl = data.secure_url;
                    } else {
                        // Làm sạch tên file để tránh lỗi Invalid Key (tiếng Việt có dấu)
                        const safeName = sanitizeFilename(fileToUpload.name);
                        const fileName = `${Date.now()}_${i}_${safeName}`;
                        const filePath = `${uploadFolder}/${fileName}`;

                        const { data: _uploadData, error: uploadError } = await uploadRoomMedia(filePath, fileToUpload);

                        if (uploadError) throw uploadError;

                        // Lấy Public URL
                        const supabaseUrl = getRoomMediaPublicUrl(filePath);

                        publicUrl = supabaseUrl;
                    }

                    finalImages.push({
                        url: publicUrl,
                        is_cover: i === 0,
                    });
                    currentStep += 1;
                }

                // Bước C: Lưu thông tin vào Database
                updateProgress(
                    Math.round((currentStep / totalSteps) * 100),
                    "Đang ghi nhận thông tin phòng trọ vào hệ thống..."
                );

                const availableUntil = new Date();
                availableUntil.setDate(availableUntil.getDate() + 7);

                const payload = {
                    user_id: user.id,
                    title: normalizedFormData.title,
                    room_type: normalizedFormData.room_type,
                    price_monthly: parseInt(normalizedFormData.price_monthly, 10) || 0,
                    area_sqm: parseFloat(normalizedFormData.area_sqm) || 0,
                    city: normalizedFormData.city,
                    district: normalizedFormData.district,
                    ward: normalizedFormData.ward,
                    address: normalizedFormData.address,
                    monthly_costs: normalizedFormData.monthly_costs,
                    room_features: normalizedFormData.room_features,
                    rules_utilities: normalizedFormData.rules_utilities,
                    media_contact: {
                        ...normalizedFormData.media_contact,
                        images: finalImages,
                        video_urls: (normalizedFormData.media_contact?.video_urls || [])
                            .map(url => url.trim())
                            .filter(url => url.length > 0),
                        google_map_url: extractMapSrc(normalizedFormData.media_contact.google_map_url),
                    },
                    available_until: availableUntil.toISOString(),
                    status: "draft", // Luôn lưu dưới dạng bản nháp
                    is_verified: false, // Chỉnh sửa/Đăng mới luôn yêu cầu duyệt lại khi công khai
                    total_views: roomToEdit ? roomToEdit.total_views : 0,
                    total_favorites: roomToEdit ? roomToEdit.total_favorites : 0,
                };

                let result;
                if (roomToEdit) {
                    result = await updateRoom(roomToEdit.id, payload);
                } else {
                    result = await createRoom(payload);
                }

                const { error } = result;
                if (error) throw error;

                // Xử lý xóa ảnh thừa trên Cloudinary hoặc Supabase storage khi sửa tin
                if (roomToEdit && roomToEdit.media_contact?.images) {
                    const oldImages = roomToEdit.media_contact.images;
                    const newUrls = finalImages.map(img => img.url);
                    
                    const pathsToDelete = [];
                    for (const oldImg of oldImages) {
                        if (!newUrls.includes(oldImg.url)) {
                            if (oldImg.url.includes("res.cloudinary.com")) {
                                await deleteFromCloudinary(oldImg.url);
                            } else {
                                const parts = oldImg.url.split('/room_media/');
                                if (parts.length > 1) {
                                    const path = parts[1].split('?')[0];
                                    if (path.startsWith(`${user.id}/`)) {
                                        pathsToDelete.push(path);
                                    }
                                }
                            }
                        }
                    }

                    if (pathsToDelete.length > 0) {
                        const { error: storageError } = await deleteRoomMedia(pathsToDelete);
                        
                        if (storageError) {
                            console.error('Lỗi khi xóa ảnh thừa từ storage:', storageError);
                        }
                    }
                }

                currentStep += 1;
                updateProgress(100, "Lưu tin thành công!");

                const successMessage = roomToEdit 
                    ? "Đã cập nhật tin đăng và lưu dưới dạng bản nháp thành công! Bạn có thể công khai tin trọ này từ Dashboard bất cứ lúc nào." 
                    : "Đã lưu bản nháp thành công! Bạn có thể công khai tin trọ này từ Dashboard bất cứ lúc nào.";
                
                addNotification(successMessage, "success");
                setIsSubmitted(true);

                // Giữ trạng thái hoàn thành 100% trong 600ms để tối ưu hóa trải nghiệm thị giác
                setTimeout(() => {
                    hideProgress();
                    if (onSuccess) onSuccess();
                }, 600);

            } catch (err) {
                console.error("Lỗi khi lưu tin:", err);
                hideProgress();
                showModal({ title: "Lỗi", message: "Không thể lưu tin đăng.", type: "error" });
            } finally {
                setIsSubmitting(false);
            }
        };

        executeSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            {/* Header Form */}
            <div className="border-b border-stone-100 pb-6 space-y-4">
                <h3 className="text-xl font-bold text-stone-900 font-heading">
                    {roomToEdit ? `Bạn đang sửa tin "${roomToEdit.title}"` : "Bạn đang đăng tin mới"}
                </h3>

                {/* Top Action Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 rounded-full border border-stone-300 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all cursor-pointer bg-white"
                    >
                        Hủy bỏ
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu bản nháp"}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                {/* SECTION: HÌNH ẢNH (Minimalist) */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-stone-50 bg-stone-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
                            <AppIcon name="photo" color="#d97706" size={16} />
                            <span>Hình ảnh</span>
                        </div>
                        <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider">{previewImages.length} / 6</span>
                    </div>
                    <div className="p-3 pt-1">
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border border-dashed border-stone-200 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-stone-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 group-hover:text-amber-500 transition-colors mb-2">
                                <AppIcon name="plus" size={20} />
                            </div>
                            <p className="text-sm font-semibold text-stone-700">Tải ảnh lên</p>
                            <p className="text-[0.7rem] text-stone-400 mt-1">Ảnh đầu tiên sẽ là ảnh bìa tin đăng</p>
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                        </div>

                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                                <AnimatePresence>
                                    {previewImages.map((img, idx) => (
                                        <MotionDiv
                                            key={img.url}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className={`relative aspect-square rounded-lg overflow-hidden border ${idx === 0 ? "border-amber-500 shadow-md ring-2 ring-amber-500/20" : "border-stone-100"}`}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover" />
                                            
                                            {/* Controls Overlay (Always Visible, Mobile Friendly) */}
                                            <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none z-10">
                                                <div className="flex justify-end pointer-events-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="w-6 h-6 rounded-full bg-red-500/90 text-white flex items-center justify-center cursor-pointer border-none shadow-md hover:bg-red-600 transition-colors active:scale-90"
                                                    >
                                                        <AppIcon name="trash" size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[0.55rem] font-black uppercase px-2 py-0.5 rounded-md shadow-md z-10">
                                                    Ảnh Bìa
                                                </div>
                                            )}
                                        </MotionDiv>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>

                {/* SECTION: VIDEO (YouTube / TikTok) */}
                <section className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-stone-50 bg-stone-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
                            <AppIcon name="play" color="#d97706" size={16} />
                            <span>Video giới thiệu (YouTube / TikTok)</span>
                        </div>
                        <span className="text-[0.65rem] font-bold text-stone-400 uppercase tracking-wider">
                            {(formData.media_contact?.video_urls || []).length} / 3
                        </span>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-xs text-stone-500">
                            Thêm liên kết video YouTube hoặc TikTok giới thiệu chi tiết về phòng trọ để thu hút nhiều người thuê hơn.
                        </p>

                        <div className="space-y-3">
                            {(formData.media_contact?.video_urls || []).map((url, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <input
                                            type="url"
                                            required
                                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 transition-all text-sm font-medium pr-22"
                                            placeholder="VD: https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/@... *"
                                            value={url}
                                            onChange={(e) => updateVideoUrl(idx, e.target.value)}
                                        />
                                        <div className="absolute right-3 top-2.5">
                                            {url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be') ? (
                                                <span className="bg-red-50 text-red-600 text-[0.65rem] font-black uppercase px-2 py-0.5 rounded border border-red-100">YouTube</span>
                                            ) : url.toLowerCase().includes('tiktok.com') ? (
                                                <span className="bg-stone-900 text-white text-[0.65rem] font-black uppercase px-2 py-0.5 rounded">TikTok</span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVideoUrl(idx)}
                                        className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center cursor-pointer hover:bg-red-100 hover:text-red-700 transition-all"
                                        title="Xóa video này"
                                    >
                                        <AppIcon name="trash" size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {(formData.media_contact?.video_urls || []).length < 3 && (
                            <button
                                type="button"
                                onClick={addVideoUrl}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                            >
                                <AppIcon name="plus" size={14} />
                                <span>Thêm link video</span>
                            </button>
                        )}
                    </div>
                </section>

                {/* SECTION 1: THÔNG TIN CƠ BẢN */}
                <FormSection title="Thông tin cơ bản" icon="home">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[0.7rem] font-bold text-stone-400 uppercase mb-1.5 tracking-tight">Tiêu đề tin đăng *</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: Phòng trọ ban công, gần ĐH Bách Khoa..."
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 transition-all text-sm font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[0.7rem] font-bold text-stone-400 uppercase mb-1.5 tracking-tight">Loại hình</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 appearance-none text-sm font-medium"
                                    value={formData.room_type}
                                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                                >
                                    {Object.entries(ROOM_TYPES).map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[0.7rem] font-bold text-stone-400 uppercase mb-1.5 tracking-tight">Giá thuê (đ) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="100000"
                                        max="100000000"
                                        placeholder="3500000"
                                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-bold text-amber-600"
                                        value={formData.price_monthly}
                                        onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[0.7rem] font-bold text-stone-400 uppercase mb-1.5 tracking-tight">Diện tích (m²) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="25"
                                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm font-bold"
                                        value={formData.area_sqm}
                                        onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </FormSection>

                {/* SECTION 2: VỊ TRÍ */}
                <FormSection title="Vị trí & Địa chỉ" icon="location">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Tỉnh/Thành phố *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                                    value={formData.city}
                                    onChange={(e) => {
                                        const nextCity = e.target.value;
                                        const nextProvince = PROVINCE.find((p) => p.name === nextCity);
                                        const hasCurrentDistrict = nextProvince?.districts.some((d) => d.name === formData.district);
                                        const nextDistrict = hasCurrentDistrict ? formData.district : "";
                                        const nextWard =
                                            hasCurrentDistrict &&
                                            nextProvince?.districts.find((d) => d.name === nextDistrict)?.wards.some((w) => w.name === formData.ward)
                                                ? formData.ward
                                                : "";
                                        setFormData((prev) => ({ ...prev, city: nextCity, district: nextDistrict, ward: nextWard }));
                                    }}
                                >
                                    <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                                    {PROVINCE.map((p) => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Quận/Huyện *</label>
                                <select
                                    required
                                    disabled={!formData.city}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    value={formData.district}
                                    onChange={(e) => {
                                        const nextDistrict = e.target.value;
                                        const selectedDistrict = districts.find((d) => d.name === nextDistrict);
                                        const nextWard = selectedDistrict?.wards.some((w) => w.name === formData.ward) ? formData.ward : "";
                                        setFormData((prev) => ({ ...prev, district: nextDistrict, ward: nextWard }));
                                    }}
                                >
                                    <option value="" disabled>Chọn Quận/Huyện</option>
                                    {districts.map((d) => (
                                        <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-1">Phường/Xã *</label>
                                <select
                                    required
                                    disabled={!formData.district}
                                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    value={formData.ward}
                                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                >
                                    <option value="" disabled>Chọn Phường/Xã</option>
                                    {wards.map((w) => (
                                        <option key={w.name} value={w.name}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-1">Địa chỉ cụ thể *</label>
                            <input
                                type="text"
                                required
                                placeholder="Số nhà, tên đường..."
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        {/* Google Maps Embed Field */}
                        <div className="mt-4 relative group/map">
                            <label className="block text-xs font-bold text-stone-500 mb-1 flex items-center gap-1.5">
                                <AppIcon name="map" size={14} className="text-amber-500" />
                                <span>Bản đồ Google Maps (Iframe hoặc Link chia sẻ)</span>
                                <div className="relative inline-block cursor-help group/tooltip">
                                    <span className="text-amber-500 text-xs font-bold flex items-center justify-center w-4 h-4 rounded-full bg-amber-50 border border-amber-200">💡</span>
                                    <div className="absolute left-6 bottom-0 hidden group-hover/tooltip:block w-72 p-3 bg-stone-900 text-white text-[0.7rem] rounded-xl shadow-xl z-35 leading-relaxed font-normal">
                                        <p className="font-bold text-amber-400 mb-1">💡 Hướng dẫn lấy bản đồ:</p>
                                        1. Truy cập <span className="underline">google.com/maps</span> và tìm kiếm địa chỉ của bạn.<br />
                                        2. Chọn nút <span className="font-bold text-amber-400">Chia sẻ</span>.<br />
                                        3. Chọn tab <span className="font-bold text-amber-400">Nhúng bản đồ (Embed a map)</span>.<br />
                                        4. Sao chép đường dẫn trong thuộc tính <span className="font-bold text-amber-400">src="..."</span> (hoặc sao chép toàn bộ thẻ Iframe) và dán vào đây.
                                    </div>
                                </div>
                            </label>
                            <input
                                type="text"
                                placeholder="Dán mã nhúng iframe hoặc link chia sẻ Google Maps vào đây..."
                                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                                value={formData.media_contact.google_map_url || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        media_contact: {
                                            ...formData.media_contact,
                                            google_map_url: e.target.value
                                        }
                                    })
                                }
                            />
                        </div>

                        {/* Tự động gợi ý trường đại học */}
                        {formData.city && formData.district && formData.ward && nearbyUniversities.length > 0 && (
                            <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                                <div className="flex gap-2 items-start text-amber-600">
                                    <AppIcon name="verified" size={14} className="mt-0.5" />
                                    <div>
                                        <p className="text-[0.65rem] font-bold uppercase tracking-wider mb-1">Gần các trường đại học:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {nearbyUniversities.map((u) => (
                                                <span key={u.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[0.75rem] font-bold border border-amber-100">
                                                    Gần {u.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </FormSection>

                {/* SECTION 3: MÔ TẢ */}
                <FormSection title="Mô tả chi tiết" icon="file-text">
                    <div className="space-y-2">
                        <textarea
                            required
                            rows={6}
                            placeholder="Mô tả đặc điểm phòng, tiện ích xung quanh, giờ giấc, an ninh... *"
                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors text-sm leading-relaxed"
                            value={formData.media_contact.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    media_contact: { ...formData.media_contact, description: e.target.value },
                                })
                            }
                        />
                        <div className="flex justify-end text-[0.6rem] text-stone-400 font-bold uppercase tracking-tighter">
                            {formData.media_contact.description.length} ký tự
                        </div>
                    </div>
                </FormSection>

                {/* SECTION 4: CHI PHÍ & THÔNG SỐ (Minimal Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 font-bold text-stone-800 text-sm">
                                    <AppIcon name="credit-card" color="#d97706" size={16} />
                                    <span>Chi phí hàng tháng (đ)</span>
                                </div>
                            </div>
                            <p className="text-[0.65rem] text-stone-400 italic mb-4">Ghi chú: Nhập 0 sẽ hiển thị "Miễn phí / Đã bao gồm" với người xem</p>

                            {/* Tiền cọc - Row riêng */}
                            <div>
                                <label className="block text-[0.6rem] font-bold text-stone-400 mb-1">Tiền cọc * (Tối thiểu 500k)</label>
                                <input
                                    type="number"
                                    required
                                    min="500000"
                                    max="500000000"
                                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 focus:border-amber-500 outline-none transition-colors"
                                    value={formData.monthly_costs.deposit_amount}
                                    onChange={(e) => setFormData({ ...formData, monthly_costs: { ...formData.monthly_costs, deposit_amount: e.target.value } })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[0.6rem] font-bold text-stone-400 mb-1">Phí gửi xe *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="1000000"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        value={formData.monthly_costs.parking_fee}
                                        onChange={(e) =>
                                            setFormData({ ...formData, monthly_costs: { ...formData.monthly_costs, parking_fee: e.target.value } })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-[0.6rem] font-bold text-stone-400 mb-1">Internet *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="1000000"
                                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                                        value={formData.monthly_costs.internet}
                                        onChange={(e) => setFormData({ ...formData, monthly_costs: { ...formData.monthly_costs, internet: e.target.value } })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex gap-1.5 items-end">
                                    <div className="flex-1">
                                        <label className="block text-[0.6rem] font-bold text-stone-400 mb-1">Tiền điện *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="1000000"
                                            className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium"
                                            value={formData.monthly_costs.electricity.price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_costs: {
                                                        ...formData.monthly_costs,
                                                        electricity: { ...formData.monthly_costs.electricity, price: e.target.value },
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <select
                                        className="bg-stone-50 border border-stone-200 rounded-lg text-[0.6rem] h-8.5 px-1 font-bold text-stone-600 outline-none"
                                        value={formData.monthly_costs.electricity.unit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                monthly_costs: {
                                                    ...formData.monthly_costs,
                                                    electricity: { ...formData.monthly_costs.electricity, unit: e.target.value },
                                                },
                                            })
                                        }
                                    >
                                        <option value="kWh">kWh</option>
                                        <option value="người">người</option>
                                    </select>
                                </div>
                                <div className="flex gap-1.5 items-end">
                                    <div className="flex-1">
                                        <label className="block text-[0.6rem] font-bold text-stone-400 mb-1">Tiền nước *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max="1000000"
                                            className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium"
                                            value={formData.monthly_costs.water.price}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_costs: {
                                                        ...formData.monthly_costs,
                                                        water: { ...formData.monthly_costs.water, price: e.target.value },
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                    <select
                                        className="bg-stone-50 border border-stone-200 rounded-lg text-[0.6rem] h-8.5 px-1 font-bold text-stone-600 outline-none"
                                        value={formData.monthly_costs.water.unit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                monthly_costs: { ...formData.monthly_costs, water: { ...formData.monthly_costs.water, unit: e.target.value } },
                                            })
                                        }
                                    >
                                        <option value="m3">m3</option>
                                        <option value="người">người</option>
                                    </select>
                                </div>
                            </div>

                            {/* Extra Services UI */}
                            <div className="pt-2">
                                <label className="block text-[0.6rem] font-bold text-stone-400 mb-2 uppercase tracking-widest">Phí dịch vụ khác</label>
                                <div className="space-y-2">
                                    {formData.monthly_costs.extra_services.map((service, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                placeholder="Tên phí (VD: Vệ sinh)"
                                                className="flex-1 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-[0.7rem]"
                                                value={service.name}
                                                onChange={(e) => updateExtraService(idx, "name", e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                max="10000000"
                                                placeholder="Giá"
                                                className="w-28 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded text-[0.7rem]"
                                                value={service.price}
                                                onChange={(e) => updateExtraService(idx, "price", e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeExtraService(idx)} className="text-red-400 p-1 hover:bg-red-50 rounded">
                                                <AppIcon name="trash" size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addExtraService}
                                        className="w-full py-1.5 border border-dashed border-stone-200 rounded text-[0.6rem] font-bold text-stone-400 hover:border-amber-300 hover:text-amber-500 transition-colors"
                                    >
                                        + THÊM PHÍ DỊCH VỤ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-stone-800 text-sm mb-2">
                            <AppIcon name="shield" color="#d97706" size={16} />
                            <span>Thông số & Nội quy</span>
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[0.8rem] text-stone-600 font-medium">Sức chứa (người)</span>
                                <div className="flex items-center gap-2">
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: {
                                                        ...formData.room_features.counts,
                                                        capacity: Math.max(1, formData.room_features.counts.capacity - 1),
                                                    },
                                                },
                                            })
                                        }
                                        icon="minus"
                                    />
                                    <span className="w-4 text-center font-bold text-sm">{formData.room_features.counts.capacity}</span>
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: {
                                                        ...formData.room_features.counts,
                                                        capacity: Math.min(6, formData.room_features.counts.capacity + 1),
                                                    },
                                                },
                                            })
                                        }
                                        icon="plus"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.8rem] text-stone-600 font-medium">Phòng ngủ</span>
                                <div className="flex items-center gap-2">
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: {
                                                        ...formData.room_features.counts,
                                                        bedrooms: Math.max(1, formData.room_features.counts.bedrooms - 1),
                                                    },
                                                },
                                            })
                                        }
                                        icon="minus"
                                    />
                                    <span className="w-4 text-center font-bold text-sm">{formData.room_features.counts.bedrooms}</span>
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: {
                                                        ...formData.room_features.counts,
                                                        bedrooms: Math.min(4, formData.room_features.counts.bedrooms + 1),
                                                    },
                                                },
                                            })
                                        }
                                        icon="plus"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.8rem] text-stone-600 font-medium">Số giường</span>
                                <div className="flex items-center gap-2">
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: { ...formData.room_features.counts, beds: Math.max(1, formData.room_features.counts.beds - 1) },
                                                },
                                            })
                                        }
                                        icon="minus"
                                    />
                                    <span className="w-4 text-center font-bold text-sm">{formData.room_features.counts.beds}</span>
                                    <CounterBtn
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                room_features: {
                                                    ...formData.room_features,
                                                    counts: { ...formData.room_features.counts, beds: Math.min(4, formData.room_features.counts.beds + 1) },
                                                },
                                            })
                                        }
                                        icon="plus"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.8rem] text-stone-600 font-medium">Nhà vệ sinh</span>
                                <select
                                    className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[0.7rem] font-bold focus:outline-none"
                                    value={formData.room_features.bathroom_type}
                                    onChange={(e) => setFormData({ ...formData, room_features: { ...formData.room_features, bathroom_type: e.target.value } })}
                                >
                                    {Object.entries(BATHROOM_TYPES).map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[0.8rem] text-stone-600 font-medium">Phòng bếp</span>
                                <select
                                    className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[0.7rem] font-bold focus:outline-none"
                                    value={formData.room_features.kitchen_type}
                                    onChange={(e) => setFormData({ ...formData, room_features: { ...formData.room_features, kitchen_type: e.target.value } })}
                                >
                                    {Object.entries(KITCHEN_TYPES).map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-2 border-t border-stone-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[0.8rem] text-stone-600 font-medium">Giờ giấc</span>
                                    <select
                                        className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[0.7rem] font-bold focus:outline-none"
                                        value={formData.rules_utilities.curfew}
                                        onChange={(e) => setFormData({ ...formData, rules_utilities: { ...formData.rules_utilities, curfew: e.target.value } })}
                                    >
                                        {Object.entries(CURFEW_LABELS).map(([val, label]) => (
                                            <option key={val} value={val}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[0.8rem] text-stone-600 font-medium">Ưu tiên giới tính</span>
                                    <select
                                        className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[0.7rem] font-bold focus:outline-none"
                                        value={formData.rules_utilities.gender_preference}
                                        onChange={(e) =>
                                            setFormData({ ...formData, rules_utilities: { ...formData.rules_utilities, gender_preference: e.target.value } })
                                        }
                                    >
                                        {Object.entries(GENDER_PREFERENCES).map(([val, label]) => (
                                            <option key={val} value={val}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[0.8rem] text-stone-600 font-medium">Giặt giũ</span>
                                    <select
                                        className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-[0.7rem] font-bold focus:outline-none"
                                        value={formData.rules_utilities.laundry_type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, rules_utilities: { ...formData.rules_utilities, laundry_type: e.target.value } })
                                        }
                                    >
                                        {Object.entries(LAUNDRY_TYPES).map(([val, label]) => (
                                            <option key={val} value={val}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[0.8rem] text-stone-600 font-medium">Cho nuôi thú cưng?</span>
                                    <Toggle
                                        active={formData.rules_utilities.is_pet_allowed}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                rules_utilities: { ...formData.rules_utilities, is_pet_allowed: !formData.rules_utilities.is_pet_allowed },
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.8rem] text-stone-600 font-medium">Chung chủ?</span>
                                    <Toggle
                                        active={formData.rules_utilities.is_shared_with_host}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                rules_utilities: {
                                                    ...formData.rules_utilities,
                                                    is_shared_with_host: !formData.rules_utilities.is_shared_with_host,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 5: TIỆN NGHI (Minimal) */}
                <FormSection title="Tiện nghi phòng" icon="check-square">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(AMENITIES).map(([key, item]) => {
                            const isSelected = formData.room_features.amenities.includes(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleAmenity(key)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all gap-1.5 cursor-pointer ${isSelected ? "bg-amber-50 border-amber-500 text-amber-600" : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"}`}
                                >
                                    <AppIcon name={item.icon} size={18} />
                                    <span className="text-[0.6rem] font-bold text-center leading-tight">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </FormSection>

                {/* SUBMIT AREA (Minimalist) */}
                {/* SUBMIT AREA (Minimalist) */}
                <div className="pt-6 border-t border-stone-100 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-16 py-3 rounded-full bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu bản nháp"}
                    </button>
                    <div className="mt-4 text-center max-w-sm">
                                        <p className="text-[0.7rem] text-stone-400 leading-relaxed font-medium">
                                            Mọi thông tin sẽ được lưu lại dưới dạng bản nháp.
                                            <br />
                                            Bạn có thể kiểm tra kỹ lại và công khai tin đăng từ danh sách quản lý.
                                        </p>
                                    </div>
                                </div>
                            </div>


        </form>
    );
}

// --- SUB-COMPONENTS ---

function FormSection({ title, icon, children }) {
    return (
        <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-50 bg-stone-50/30 flex items-center gap-2.5 font-bold text-stone-900 font-heading">
                <AppIcon name={icon} color="#d97706" size={18} />
                <span>{title}</span>
            </div>
            <div className="p-4 md:p-6 pt-2 md:pt-3">{children}</div>
        </section>
    );
}

function CounterBtn({ onClick, icon }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors border-none cursor-pointer"
        >
            <AppIcon name={icon} size={14} />
        </button>
    );
}

function Toggle({ active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 border-none cursor-pointer ${active ? "bg-amber-500" : "bg-stone-200"}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${active ? "left-6" : "left-1"}`} />
        </button>
    );
}
