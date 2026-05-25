import React from 'react';
import { 
    TbRefresh, 
    TbTrash, 
    TbHomeCheck, 
    TbTrendingUp, 
    TbBuildingWarehouse 
} from 'react-icons/tb';

export default function MockManagerTab({
    mockStats,
    onRefreshMockStats,
    onCleanAllMock,
    onLaunchScenario
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-extrabold text-stone-900 font-heading">Quản lý Mock Data</h3>
                    <p className="text-stone-500 text-xs mt-1">Cấu hình kịch bản dữ liệu và quản trị các tài khoản giả lập trong hệ thống.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onRefreshMockStats}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-800 cursor-pointer transition-colors"
                    >
                        <TbRefresh size={14} />
                        <span>Làm mới</span>
                    </button>
                    <button
                        onClick={onCleanAllMock}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-100 cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                        <TbTrash size={16} />
                        <span>Xóa sạch Mock Data</span>
                    </button>
                </div>
            </div>

            {/* Mock Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                    <div className="text-stone-400 text-xs font-bold uppercase mb-2">Dummy Rooms</div>
                    <div className="text-2xl font-black text-stone-900 font-heading">{mockStats.mockRooms}</div>
                    <div className="text-[10px] text-stone-400 font-medium mt-1">Tin đăng trọ giả lập (chứa mã TT-MOCK) được gán cho Admin</div>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                    <div className="text-stone-400 text-xs font-bold uppercase mb-2">Trạng thái Mock Data</div>
                    <div className="text-sm font-extrabold text-amber-600 font-heading flex items-center gap-1.5 mt-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${mockStats.mockRooms > 0 ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'}`}></span>
                        {mockStats.mockRooms > 0 ? "Đang có dữ liệu giả lập" : "Hệ thống sạch (Chỉ có dữ liệu thật)"}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium mt-1">Hỗ trợ dọn dẹp mock data tự động không ảnh hưởng dữ liệu thật</div>
                </div>
            </div>

            {/* Scenario Selection Grid */}
            <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">Kịch bản Test (Cộng dồn)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { id: 1, title: "1. Kiểm duyệt & Quy mô lớn", icon: TbHomeCheck, color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20", desc: "Sinh 80 phòng trọ phân bố ở mọi giai đoạn vòng đời tin đăng (20 chờ duyệt, 20 công khai chưa xác thực, 20 đã xác thực, 10 bản nháp, 10 đã hết hạn) để kiểm tra đồng thời cả Dashboard chủ nhà lẫn bảng điều khiển Admin." },
                        { id: 2, title: "2. Tâm điểm trường Đại học", icon: TbBuildingWarehouse, color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20", desc: "Sinh 40 phòng trọ tập trung 100% tại các khu vực cổng trường Đại học lớn (Bách Khoa, HUTECH, Ngoại Thương, ĐHQG) với mức giá cực rẻ và tiêu đề thân thiện riêng cho sinh viên." },
                        { id: 3, title: "3. 100 phòng trọ tiêu chuẩn", icon: TbTrendingUp, color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20", desc: "Sinh 100 phòng trọ tiêu chuẩn ngẫu nhiên có mức giá trung bình từ 1.8M đến 7.5M VND phân bố đều khắp Hà Nội & TP.HCM để stress-test các bộ lọc, thanh tìm kiếm và tải phân trang." },
                        { id: 4, title: "4. Thiên đường Tiện ích & Ẩm thực", icon: TbRefresh, color: "from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-500/20", desc: "KỊCH BẢN SÁNG TẠO: Sinh 30 phòng trọ VIP nằm sát các tổ hợp ăn uống giải trí cực hot (Hồ Tây, Phố đi bộ Bùi Viện, Thảo Điền) với tiện ích cực chill (hồ bơi, ngắm pháo hoa, nuôi thú cưng, tự do 24/7)." }
                    ].map((scenario) => {
                        const Icon = scenario.icon;
                        return (
                            <div key={scenario.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${scenario.color} flex items-center justify-center border shrink-0`}>
                                            <Icon size={16} />
                                        </div>
                                        <h5 className="font-extrabold text-stone-900 text-sm font-heading">{scenario.title}</h5>
                                    </div>
                                    <p className="text-stone-500 text-[11px] leading-relaxed font-medium">
                                        {scenario.desc}
                                    </p>
                                </div>
                                <button
                                    onClick={() => onLaunchScenario(scenario.id)}
                                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2 rounded-xl border-none cursor-pointer transition-colors"
                                >
                                    Kích hoạt kịch bản
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
