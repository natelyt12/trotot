# 🏠 TroTot – Tổng Quan Dự Án

> **TroTot** là nền tảng tìm phòng trọ trực tuyến dành cho thị trường Việt Nam.  
> Kết nối người thuê phòng với chủ nhà / môi giới một cách nhanh chóng, minh bạch và tiện lợi.

---

## 📋 Mục lục tài liệu

| File                         | Nội dung                                     |
| ---------------------------- | -------------------------------------------- |
| `00_project_overview.md`     | Tổng quan dự án, tech stack, kiến trúc       |
| `01_auth_workflow.md`        | Luồng đăng ký, đăng nhập, quên mật khẩu      |
| `02_home_search_workflow.md` | Luồng tìm kiếm & lọc phòng trang chủ         |
| `03_room_detail_workflow.md` | Luồng xem chi tiết phòng, yêu thích, liên hệ |
| `04_dashboard_workflow.md`   | Luồng quản lý tin đăng (chủ nhà / môi giới)  |
| `05_profile_workflow.md`     | Luồng quản lý hồ sơ người dùng               |

---

## 🎯 Mục tiêu sản phẩm

- Cung cấp **hàng trăm phòng trọ được xác minh** trên cả nước
- **Miễn phí tìm kiếm**, không phí trung gian cho người thuê
- Giao diện thân thiện, hỗ trợ cả **desktop và mobile**
- Ba nhóm vai trò: **Người thuê** (tenant) · **Môi giới** (agent) · **Bên cho thuê** (landlord)

---

## 🛠️ Tech Stack

### Frontend

```
React 19          – UI framework
Vite 8            – Build tool & dev server
TailwindCSS 4     – Utility-first CSS framework
Framer Motion 12  – Animations & transitions
React Icons 5     – Icon library
```

### Backend-as-a-Service (BaaS)

```
Supabase          – PostgreSQL Database + Auth + Storage
  ├── Auth          Email/Password authentication, JWT sessions
  ├── Database      PostgreSQL (rooms, profiles, comments, favorites)
  └── Storage       room_media (ảnh phòng), user_avatar (ảnh đại diện)
```

### Media & Storage

```
Cloudinary        – Upload & optimize ảnh phòng và avatar
                    (fallback về Supabase Storage nếu chưa cấu hình)
```

### Deployment

```
Vercel            – Hosting & CI/CD (vercel.json)
```

---

## 🗂️ Kiến trúc thư mục

```
src/
├── App.jsx                    # Root component, routing SPA thủ công, auth listener
├── main.jsx                   # Entry point
├── index.css                  # Global styles
│
├── pages/                     # Các trang chính
│   ├── HomePage.jsx           # Trang chủ – Danh sách & tìm kiếm phòng
│   ├── RoomDetailPage.jsx     # Chi tiết phòng (overlay modal)
│   ├── LoginPage.jsx          # Đăng nhập
│   ├── RegisterPage.jsx       # Đăng ký (multi-step)
│   ├── ProfilePage.jsx        # Hồ sơ cá nhân
│   └── DashboardPage.jsx      # Bảng điều khiển chủ nhà/môi giới
│
├── components/
│   ├── auth/                  # ForgotPasswordForm, VerificationForm
│   ├── common/                # AppIcon, BaseModal, GlobalModal, ToastContainer
│   ├── dashboard/             # RoomPostForm (form đăng/sửa tin)
│   ├── layout/                # Header, Footer, BottomNav
│   ├── rooms/                 # RoomCard, RoomGrid, RoomFilters, CommentSection, MobileFilterModal
│   └── search/                # SearchTrigger, LocationWizardModal
│
├── context/
│   ├── FavoritesContext.jsx   # Quản lý danh sách yêu thích (persist Supabase)
│   ├── ModalContext.jsx       # Global modal/dialog
│   └── NotificationContext.jsx # Toast notifications
│
├── hooks/
│   └── useRoomFilter.js       # Custom hook – toàn bộ logic filter & fetch phòng
│
├── lib/
│   └── supabase.js            # Khởi tạo Supabase client
│
├── utils/
│   ├── formatters.js          # Định dạng giá tiền, diện tích, ngày tháng...
│   ├── imageUtils.js          # Nén ảnh, cắt avatar, xóa Cloudinary
│   ├── roomMapper.js          # Map dữ liệu Supabase → format UI
│   └── roomUtils.js           # moveRoomToDraft, draftAllUserRooms
│
└── data/
    ├── constants.js           # AMENITIES, STATUS_LABELS, CURFEW_LABELS...
    └── universities.js        # Danh sách trường đại học theo khu vực
```

---

## 🗃️ Database Schema (Supabase PostgreSQL)

```
profiles          – Thông tin người dùng (full_name, phone, role, avatar_url)
rooms             – Tin đăng phòng (title, price, address, media_contact, status...)
comments          – Bình luận theo phòng
favorites         – Danh sách phòng yêu thích của user
```

**Các trường quan trọng của `rooms`:**

| Cột               | Kiểu  | Mô tả                                                                           |
| ----------------- | ----- | ------------------------------------------------------------------------------- |
| `status`          | enum  | `draft` / `available` / `hidden` / `expired`                                    |
| `is_verified`     | bool  | Đã kiểm duyệt bởi admin                                                         |
| `slug`            | text  | URL-friendly slug (dùng cho routing)                                            |
| `media_contact`   | jsonb | `{ images, video_urls, description, contact }`                                  |
| `monthly_costs`   | jsonb | `{ deposit_amount, electricity, water, internet, parking_fee, extra_services }` |
| `room_features`   | jsonb | `{ amenities, bathroom_type, counts, ... }`                                     |
| `rules_utilities` | jsonb | `{ curfew, is_pet_allowed, laundry_type, ... }`                                 |

---

## 🔐 Hệ thống vai trò (Role)

```
tenant    – Người thuê: Tìm phòng, lưu yêu thích, bình luận
agent     – Môi giới: Đăng tin, quản lý tin đăng (cần KYC)
landlord  – Bên cho thuê: Đăng tin, quản lý tin đăng (cần KYC)
```

---

## 📱 Routing (SPA thủ công – không dùng React Router)

| URL          | Trang                               |
| ------------ | ----------------------------------- |
| `/`          | Trang chủ                           |
| `/login`     | Đăng nhập                           |
| `/register`  | Đăng ký                             |
| `/profile`   | Hồ sơ (yêu cầu đăng nhập)           |
| `/dashboard` | Bảng điều khiển (yêu cầu đăng nhập) |
| `/:slug`     | Chi tiết phòng theo slug            |

> **Lưu ý:** Room Detail được render dạng **overlay modal** trên trang chủ (giữ nguyên scroll position).
