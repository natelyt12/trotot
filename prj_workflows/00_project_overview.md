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

## 🛠️ Công nghệ sử dụng

### Giao diện người dùng (`Frontend`)

| Công nghệ | Vai trò |
|-----------|---------|
| **React 19** | Thư viện xây dựng giao diện, mỗi thành phần là một "mảnh" màn hình độc lập |
| **Vite 8** | Công cụ chạy ứng dụng khi lập trình và đóng gói khi phát hành |
| **TailwindCSS 4** | Bộ công cụ tạo giao diện — tô màu, căn chỉnh bố cục qua class CSS |
| **Framer Motion 12** | Thư viện tạo hiệu ứng chuyển động và animation |
| **React Icons 5** | Bộ icon dùng trong giao diện |

### Dữ liệu & đăng nhập (`Backend` — dùng dịch vụ Supabase)

| Thành phần | Vai trò |
|------------|---------|
| **Xác thực** (`Auth`) | Quản lý đăng nhập bằng email và mật khẩu, cấp phiên làm việc |
| **Cơ sở dữ liệu** (`PostgreSQL`) | Lưu trữ thông tin phòng, người dùng, bình luận, danh sách yêu thích |
| **Kho lưu trữ file** (`Storage`) | Lưu ảnh phòng và ảnh đại diện người dùng |

### Lưu trữ hình ảnh

| Công nghệ | Vai trò |
|-----------|---------|
| **Cloudinary** | Dịch vụ tải lên và tối ưu ảnh phòng, ảnh đại diện _(nếu không cấu hình, ảnh sẽ được lưu trên Supabase Storage)_ |

### Triển khai & phát hành (`Deployment`)

| Công nghệ | Vai trò |
|-----------|---------|
| **Vercel** | Nền tảng đăng ứng dụng lên mạng, tự động cập nhật khi có thay đổi code |

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
