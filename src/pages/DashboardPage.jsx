import { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import AppIcon from '../components/common/AppIcon.jsx';
import RoomPostForm from '../components/dashboard/RoomPostForm.jsx';

/* ============================================
   DashboardPage – Property Manager
   Flat design, amber palette
   ============================================ */
export default function DashboardPage({ user, navigate, initialData }) {
    const { showModal } = useModal();
    const [activeTab, setActiveTab] = useState(initialData?.tab || 'manage_rooms');

    useEffect(() => {
        setActiveTab(initialData?.tab || 'manage_rooms');
    }, [initialData]);

    const TAB_GROUPS = [
        {
            label: 'Quản lý',
            tabs: [
                { id: 'manage_rooms', label: 'Quản lý tin đăng', icon: 'check-square' },
                { id: 'post_room', label: 'Đăng tin', icon: 'plus' },
                // Thêm các tab khác trong tương lai như: Thống kê...
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 pt-20 pb-20 md:pb-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('home')}
                        className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-full! pl-1.5 pr-4 py-1.5 cursor-pointer text-stone-600 text-sm font-bold hover:bg-stone-50 hover:text-stone-900 transition-colors duration-200 group"
                    >
                        <div className="w-7 h-7 rounded-full! bg-stone-100 flex items-center justify-center text-stone-500 transition-colors group-hover:bg-stone-200 group-hover:text-stone-700">
                            <AppIcon name="chevronLeft" size={14} strokeWidth={3.5} />
                        </div>
                        <span>Quay lại trang chủ</span>
                    </button>
                </div>

                {/* Page title */}
                <div className="mb-8">
                    <h1
                        className="text-2xl font-extrabold text-stone-900 tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        Bảng điều khiển
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Quản lý tin đăng và thông tin thuê phòng của bạn.</p>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] items-stretch">

                        {/* Sidebar */}
                        <aside className="lg:border-r border-stone-100 bg-stone-50/30">
                            <div className="flex flex-col py-4">
                                {TAB_GROUPS.map((group) => {
                                    return (
                                        <div key={group.label} className="mb-6 last:mb-0">
                                            <div className="px-6 py-2 text-[0.68rem] font-black text-stone-400 uppercase tracking-[0.15em] mb-1">
                                                {group.label}
                                            </div>
                                            {group.tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id)}
                                                    className={`flex items-center gap-3 w-full px-6 py-3.5 text-[0.9rem] font-bold cursor-pointer transition-all duration-200 text-left border-none ${activeTab === tab.id
                                                        ? 'bg-white text-amber-600 border-r-4 border-r-amber-500 shadow-[inset_-1px_0_0_#fff]'
                                                        : 'bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                                                        }`}
                                                >
                                                    <AppIcon name={tab.icon} size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Content panel */}
                        <main className="p-6 md:p-10 min-h-[500px] bg-white">

                            {/* ---- TAB: MANAGE ROOMS ---- */}
                            {activeTab === 'manage_rooms' && (
                                <div className="animate-fade-in">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                                            <AppIcon name="check-square" size={18} />
                                        </div>
                                        <h2
                                            className="text-lg font-bold text-stone-900"
                                            style={{ fontFamily: 'var(--font-heading)' }}
                                        >
                                            Quản lý tin đăng
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-stone-300">
                                            <AppIcon name="home" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-900 mb-2">Bạn chưa có tin đăng nào</h3>
                                        <p className="text-stone-500 text-sm max-w-sm px-6 mb-6">Bắt đầu tiếp cận khách hàng tiềm năng bằng cách đăng tin cho thuê phòng của bạn.</p>
                                        <button 
                                            onClick={() => setActiveTab('post_room')}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-amber-500/20"
                                        >
                                            Đăng tin ngay
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ---- TAB: POST ROOM ---- */}
                            {activeTab === 'post_room' && (
                                <div className="animate-fade-in">
                                    <RoomPostForm 
                                        user={user} 
                                        onClear={() => setActiveTab('manage_rooms')}
                                        onSuccess={() => setActiveTab('manage_rooms')}
                                    />
                                </div>
                            )}

                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
