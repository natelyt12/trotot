# 🏠 TroTot – Tổng Quan Dự Án

> **TroTot** là ứng dụng web giúp người dùng tìm phòng trọ tại Việt Nam.  
> Kết nối người thuê phòng với chủ nhà và môi giới một cách nhanh chóng, minh bạch và tiện lợi.

---

## 📋 Mục lục tài liệu

| File | Nội dung |
|------|----------|
| `00_project_overview.md` | Tổng quan dự án, công nghệ sử dụng, cấu trúc hệ thống |
| `01_auth_workflow.md` | Đăng ký, đăng nhập, quên mật khẩu |
| `02_home_search_workflow.md` | Tìm kiếm & lọc phòng trên trang chủ |
| `03_room_detail_workflow.md` | Xem chi tiết phòng, yêu thích, liên hệ, bình luận |
| `04_dashboard_workflow.md` | Quản lý tin đăng — dành cho chủ nhà và môi giới |
| `05_profile_workflow.md` | Quản lý hồ sơ cá nhân |

---

## 🎯 Mục tiêu sản phẩm

- Cung cấp **hàng trăm phòng trọ đã được xác minh** trên cả nước
- **Miễn phí tìm kiếm** — không thu phí trung gian từ người thuê
- Giao diện thân thiện, chạy được trên cả máy tính và điện thoại
- Ba loại tài khoản: **Người thuê** · **Môi giới** · **Bên cho thuê**

---

## 🛠️ Công nghệ sử dụng (Detailed Tech Stack)

Dưới đây là mô tả chi tiết toàn bộ các công nghệ, thư viện và công cụ được điều phối hoạt động trong dự án TroTot:

### 1. Giao diện người dùng (`Frontend Core & Styling`)

| Công nghệ / Thư viện | Phiên bản | Vai trò & Mô tả chi tiết |
|:---|:---|:---|
| **React** | `^19.2.4` | Thư viện cốt lõi để xây dựng giao diện người dùng theo kiến trúc Component (Thành phần). Phiên bản React 19 mang lại hiệu năng tối ưu, quản lý State mượt mà và tận dụng tối đa hook hiện đại. |
| **Vite** | `^8.0.4` | Build tool và Development server siêu nhanh thế hệ mới thay thế cho CRA. Đảm bảo Hot Module Replacement (HMR) tức thì trong quá trình phát triển và đóng gói bundle cực kỳ gọn nhẹ khi deploy. |
| **TailwindCSS** | `^4.2.2` | Framework utility-first CSS để xây dựng giao diện nhanh chóng, đồng bộ hệ thống design token (colors, spacing, shadows). Phiên bản 4.x mang lại hiệu năng biên dịch tối ưu vượt trội. |
| **@tailwindcss/vite** | `^4.2.2` | Plugin tích hợp sâu TailwindCSS trực tiếp vào luồng xử lý của Vite, giúp quá trình hot-reload và build CSS diễn ra nhanh chóng, trơn tru. |
| **Framer Motion** | `^12.38.0` | Thư viện diễn hoạt (animation) cao cấp. Được sử dụng để xây dựng hiệu ứng "cửa trượt" chuyển trang mượt mà, hiệu ứng mở rộng chi tiết tin đăng (overlay modal slide-up/down) và hiệu ứng chuyển động vi mô (micro-interactions). |
| **React Icons** | `^5.6.0` | Bộ thư viện tích hợp hàng ngàn icon từ các nguồn nổi tiếng (như Lucide, Tabler, Heroicons). Trong dự án, hệ thống icon được gói gọn và phân phối tập trung qua component `AppIcon`. |

### 2. Dữ liệu, Xác thực & Lưu trữ (`Backend & Infrastructure`)

| Thành phần Dịch vụ | Công nghệ sử dụng | Vai trò & Mô tả chi tiết |
|:---|:---|:---|
| **Dịch vụ Backend (BaaS)** | **Supabase** | Nền tảng Cloud BaaS mã nguồn mở mạnh mẽ, đóng vai trò là xương sống phía Backend cho ứng dụng, cung cấp sẵn các API RESTful bảo mật cao thông qua cơ chế RLS (Row Level Security). |
| **Thư viện Client SDK** | **@supabase/supabase-js** `^2.104.0` | SDK chính thức để kết nối Frontend trực tiếp với dịch vụ Supabase để truy vấn DB, lắng nghe Auth State và thao tác Storage. |
| **Cơ sở dữ liệu** | **PostgreSQL (v15+)** | Lưu trữ toàn bộ dữ liệu có cấu trúc của ứng dụng (`profiles`, `rooms`, `comments`, `favorites`). Sử dụng các tính năng nâng cao như **Database Views** (`rooms_view` tự động tính toán hết hạn tin đăng theo thời gian thực) và RLS bảo mật ở mức dòng. |
| **Xác thực người dùng** | **Supabase Auth** | Quản lý đăng ký, đăng nhập bảo mật bằng Email/Password, cấp phát phiên làm việc (Session) JWT, quản lý phân quyền User Metadata (Tenant / Landlord / Admin). |
| **Kho lưu trữ tệp tin** | **Supabase Storage / Cloudinary** | Lưu trữ tệp tin tĩnh. Ảnh đại diện và ảnh phòng trọ được tải lên và phân phối thông qua Supabase Storage bucket (`room_media`, `user_avatar`) làm phương án dự phòng. |
| **Tối ưu hóa hình ảnh** | **Cloudinary Service** | Dịch vụ đám mây tối ưu ảnh hàng đầu. Được tích hợp để nén, tự động căn chỉnh và phân phối hình ảnh phòng trọ/avatar chất lượng cao với băng thông tiết kiệm nhất thông qua API Edge Function. |

### 3. Công cụ kiểm soát mã nguồn & Triển khai (`DevOps & Tooling`)

| Công cụ / Nền tảng | Vai trò & Mô tả chi tiết |
|:---|:---|:---|
| **Vercel** | Nền tảng lưu trữ và triển khai Frontend tự động (CI/CD) đồng bộ trực tiếp với kho mã nguồn Git. |
| **ESLint** (`^9.39.4`) | Công cụ phân tích mã tĩnh để tự động kiểm tra cú pháp, chuẩn hóa code style và cảnh báo lỗi logic trong quá trình code. |
| **Dotenv** (`^17.4.2`) | Thư viện quản lý các biến môi trường bí mật (`VITE_SUPABASE_URL`, `VITE_CLOUDINARY_CLOUD_NAME`...) an toàn trong file `.env`. |
| **Autoprefixer & PostCSS** | Các thư viện tiền xử lý CSS giúp tự động thêm các vendor prefix (như `-webkit-`, `-moz-`) để đảm bảo giao diện hiển thị tương thích hoàn hảo trên mọi trình duyệt (Safari, Chrome, Firefox). |

---

## 🗂️ Cấu trúc thư mục mã nguồn

> Đây là cách các file code được tổ chức trong dự án.  
> Bạn không cần nhớ hết — chỉ cần biết mỗi nhóm phụ trách việc gì.

```
src/
│
├── pages/                     ← Các trang chính của ứng dụng
│   ├── HomePage.jsx           │  Trang chủ: danh sách và tìm kiếm phòng
│   ├── RoomDetailPage.jsx     │  Trang chi tiết một phòng (hiện ra như cửa sổ pop-up)
│   ├── LoginPage.jsx          │  Trang đăng nhập
│   ├── RegisterPage.jsx       │  Trang đăng ký (nhiều bước)
│   ├── ProfilePage.jsx        │  Trang hồ sơ cá nhân
│   └── DashboardPage.jsx      │  Trang quản lý tin đăng (dành cho chủ nhà/môi giới)
│
├── components/                ← Các thành phần giao diện tái sử dụng
│   ├── auth/                  │  Giao diện quên mật khẩu, xác minh danh tính
│   ├── common/                │  Hộp thoại thông báo, icon, toast notification
│   ├── dashboard/             │  Form đăng/sửa tin phòng
│   ├── layout/                │  Thanh điều hướng trên/dưới, footer
│   ├── rooms/                 │  Thẻ phòng, lưới phòng, bộ lọc, bình luận
│   └── search/                │  Ô tìm kiếm, hộp thoại chọn vị trí
│
├── context/                   ← Dữ liệu dùng chung toàn ứng dụng
│   ├── FavoritesContext.jsx   │  Danh sách phòng yêu thích
│   ├── ModalContext.jsx       │  Hộp thoại xác nhận (modal) dùng chung
│   └── NotificationContext.jsx│  Thông báo nhỏ góc màn hình (toast)
│
├── hooks/                     ← Logic xử lý tái sử dụng
│   └── useRoomFilter.js       │  Toàn bộ logic tìm kiếm và lọc phòng
│
├── lib/
│   └── supabase.js            ← Kết nối đến dịch vụ Supabase
│
└── utils/                     ← Các hàm tiện ích nhỏ
    ├── formatters.js          │  Định dạng giá tiền, diện tích, ngày tháng
    ├── imageUtils.js          │  Nén ảnh, cắt avatar, xóa ảnh cũ
    ├── roomMapper.js          │  Chuyển dữ liệu từ database sang định dạng hiển thị
    └── roomUtils.js           │  Ẩn tin đăng, chuyển về bản nháp
```

---

## 🗃️ Cơ sở dữ liệu — Các bảng chính

> Dữ liệu của ứng dụng được lưu trong các "bảng" như bảng tính Excel,  
> mỗi bảng chứa một loại thông tin.

| Bảng | Lưu gì |
|------|--------|
| `profiles` | Thông tin người dùng: tên, số điện thoại, vai trò, ảnh đại diện |
| `rooms` | Tin đăng phòng: tiêu đề, giá, địa chỉ, ảnh, trạng thái |
| `comments` | Bình luận của người dùng trên từng phòng |
| `favorites` | Danh sách phòng mà người dùng đã bấm "Lưu tin" |

**Các trạng thái của tin đăng phòng:**

| Trạng thái | Ý nghĩa |
|------------|---------|
| `draft` — Bản nháp | Mới tạo, chưa hiển thị công khai |
| `available` — Đã công khai | Hiển thị trên trang chủ cho người thuê xem |
| `hidden` — Đã ẩn | Tạm thời không hiển thị |
| `expired` — Hết hạn | Tin đăng đã quá hạn |

**Thông tin lưu trong mỗi tin đăng phòng (`rooms`):**

| Nhóm thông tin | Nội dung |
|----------------|---------|
| Thông tin cơ bản | Tiêu đề, giá thuê, diện tích, địa chỉ đầy đủ |
| Chi phí hàng tháng | Tiền cọc, điện, nước, internet, gửi xe, dịch vụ thêm |
| Đặc điểm phòng | Tiện nghi (wifi, điều hòa...), loại phòng vệ sinh, sức chứa |
| Nội quy | Giờ giấc, thú cưng, giặt đồ, chung chủ hay không |
| Hình ảnh & Liên hệ | Danh sách ảnh, link video, mô tả chi tiết, thông tin người đăng |
| Trạng thái | Đã kiểm duyệt chưa, còn phòng hay không, ngày hết hạn |

---

## 🔐 Các loại tài khoản

| Loại | Quyền hạn |
|------|----------|
| **Người thuê** (`tenant`) | Tìm phòng, lưu yêu thích, đọc và viết bình luận |
| **Môi giới** (`agent`) | Tất cả quyền trên + đăng và quản lý tin phòng _(cần xác minh danh tính khi đăng ký)_ |
| **Bên cho thuê** (`landlord`) | Tương tự Môi giới — dành cho chủ nhà trực tiếp _(cần xác minh danh tính khi đăng ký)_ |

---

## 📱 Các trang (đường dẫn URL)

| Đường dẫn | Trang hiển thị | Ai truy cập được |
|-----------|---------------|-----------------|
| `/` | Trang chủ | Tất cả |
| `/login` | Đăng nhập | Tất cả |
| `/register` | Đăng ký | Tất cả |
| `/profile` | Hồ sơ cá nhân | Phải đăng nhập |
| `/dashboard` | Quản lý tin đăng | Phải đăng nhập |
| `/:ten-phong` | Chi tiết phòng theo tên thân thiện | Tất cả |

> **Lưu ý kỹ thuật:** Trang Chi tiết phòng không thực sự "chuyển trang" mà hiện ra như một lớp phủ (`overlay`) bên trên trang chủ — giúp giữ nguyên vị trí cuộn và bộ lọc bên dưới.

---

## ⚙️ Cấu hình môi trường

> Đây là các "chìa khóa" để ứng dụng kết nối đến các dịch vụ bên ngoài.  
> Được lưu trong file `.env` — **không được chia sẻ công khai**.

| Biến | Dùng để |
|------|---------|
| `VITE_SUPABASE_URL` | Địa chỉ kết nối đến cơ sở dữ liệu Supabase |
| `VITE_SUPABASE_ANON_KEY` | Mã xác thực khi truy cập Supabase từ trình duyệt |
| `VITE_CLOUDINARY_CLOUD_NAME` | Tên tài khoản Cloudinary để tải ảnh lên |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cấu hình upload ảnh phòng lên Cloudinary |
| `VITE_CLOUDINARY_AVATAR_UPLOAD_PRESET` | Cấu hình upload ảnh đại diện lên Cloudinary |
