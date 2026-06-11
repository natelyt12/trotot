import React from 'react';
import { 
    TbRefresh, 
    TbSearch, 
    TbUsers, 
    TbPhone, 
    TbTrash 
} from 'react-icons/tb';

export default function UserManagementTab({
    allUsers,
    loadingUsers,
    onRefresh,
    userSearchQuery,
    setUserSearchQuery,
    onDeleteUser
}) {
    const filteredUsers = allUsers.filter(u =>
        (u.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u.phone || '').includes(userSearchQuery)
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-stone-900 font-heading">Quản lý người dùng</h3>
                    <p className="text-stone-500 text-xs mt-1">Danh sách toàn bộ người dùng đã đăng ký trên hệ thống TroTot.</p>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={loadingUsers}
                    className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-800 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                >
                    <TbRefresh size={14} className={loadingUsers ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            </div>

            {/* Search bar */}
            <div className="relative">
                <TbSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc số điện thoại..."
                    value={userSearchQuery}
                    onChange={e => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white outline-none focus:border-amber-400 font-normal text-stone-700"
                />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-stone-400 inline-block"></span>Tổng: {allUsers.length} người dùng</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Chủ nhà: {allUsers.filter(u => u.role === 'landlord').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>Người thuê: {allUsers.filter(u => u.role === 'tenant').length}</span>
            </div>

            {loadingUsers ? (
                <div className="text-center py-16 text-stone-400 text-sm font-medium">Đang tải danh sách người dùng...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-stone-300 shadow-sm border border-stone-100">
                        <TbUsers size={28} />
                    </div>
                    <p className="text-stone-500 font-medium text-sm">Không tìm thấy người dùng nào</p>
                    <p className="text-stone-400 text-xs mt-1">Thử thay đổi từ khóa tìm kiếm.</p>
                </div>
            ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
                    <div className="max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-stone-50 text-stone-400 font-medium border-b border-stone-100 uppercase tracking-wider text-[10px]">
                                    <th className="p-4">Người dùng</th>
                                    <th className="p-4 hidden sm:table-cell">Liên hệ</th>
                                    <th className="p-4">Vai trò</th>
                                    <th className="p-4 text-center">Tin đăng</th>
                                    <th className="p-4 hidden md:table-cell">Gia nhập</th>
                                    <th className="p-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {filteredUsers.map(usr => {
                                    const roleBadge = usr.role === 'admin'
                                        ? { label: 'Admin', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
                                        : usr.role === 'landlord'
                                            ? { label: 'Chủ nhà', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                                            : { label: 'Người thuê', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
                                    const joinDate = usr.created_at
                                        ? new Date(usr.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : '—';
                                    return (
                                        <tr key={usr.id} className="hover:bg-stone-50/60 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    {usr.avatar_url ? (
                                                        <img src={usr.avatar_url} className="w-8 h-8 rounded-full object-cover border border-stone-200 shrink-0" alt="avatar" onError={e => { e.currentTarget.src = '/images/placeholder.png'; }} />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-medium text-sm shrink-0">
                                                            {(usr.full_name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-stone-800 truncate max-w-[140px]">{usr.full_name || 'Chưa cập nhật'}</div>
                                                        <div className="text-[9px] text-stone-400 font-mono truncate max-w-[140px]">ID: {usr.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell">
                                                <div className="font-medium text-stone-600 flex items-center gap-1">
                                                    <TbPhone size={11} />
                                                    {usr.phone || '—'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${roleBadge.cls}`}>
                                                    {roleBadge.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-bold text-stone-700">{usr.roomsCount}</td>
                                            <td className="p-4 hidden md:table-cell font-normal text-stone-500">{joinDate}</td>
                                            <td className="p-4 text-right">
                                                {usr.role !== 'admin' ? (
                                                    <button
                                                        onClick={() => onDeleteUser(usr.id, usr.full_name || 'Người dùng', usr.role)}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg cursor-pointer transition-colors border-none"
                                                        title="Xóa tài khoản"
                                                    >
                                                        <TbTrash size={14} />
                                                    </button>
                                                ) : (
                                                    <span className="text-[9px] text-stone-300 font-medium px-2">Protected</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 text-[10px] font-medium text-stone-400">
                        Hiển thị {filteredUsers.length} / {allUsers.length} người dùng
                    </div>
                </div>
            )}
        </div>
    );
}
