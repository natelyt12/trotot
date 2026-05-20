# 👤 Workflow: Hồ sơ người dùng (Profile)

Tài liệu mô tả luồng **quản lý thông tin cá nhân**, **đổi mật khẩu**, **tin đã lưu**, **phòng đã bình luận** và **xóa tài khoản**.

> **Yêu cầu:** Phải đăng nhập. Truy cập qua `/profile`.

---

## 1. Luồng truy cập và khởi tạo Profile

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Hồ sơ\ntrên Header/BottomNav]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[navigate login]
        B -- Rồi --> D[ProfilePage hiển thị]
        D --> E[Tab mặc định: Thông tin cá nhân]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> F[Đọc user.user_metadata\nkhởi tạo formData]
        F --> G[fetchProfile từ Supabase\nbảng profiles]
        G --> H[Cập nhật formData\nvới dữ liệu mới nhất từ DB]
    end

    subgraph LAYOUT["🗂️ Cấu trúc sidebar"]
        I[Nhóm Cá nhân:\nThông tin cá nhân\nTin đã lưu\nPhòng đã bình luận]
        J[Nhóm Bảo mật:\nĐổi mật khẩu\nVùng nguy hiểm]
        K[Nút Đăng xuất\nphía dưới sidebar]
    end
```

---

## 2. Luồng Cập nhật thông tin cá nhân

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Tab: Thông tin cá nhân"]
        A([Xem form thông tin]) --> B[Sửa Tên người dùng]
        B --> C[Sửa Số điện thoại]
        C --> D{Muốn đổi vai trò?}
        D -- Có --> E[Chọn: Người thuê / Môi giới / Bên cho thuê]
        D -- Không --> F[Giữ vai trò hiện tại]
        E & F --> G[Bấm Lưu thay đổi]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        G --> H{Validate dữ liệu}
        H --> |Tên trống| I[Toast lỗi:\nVui lòng nhập họ tên]
        H --> |SĐT không hợp lệ| J[Toast lỗi:\nSĐT không hợp lệ]
        H --> |Hợp lệ| K{Chuyển từ landlord/agent\nsang tenant?}
        K -- Có --> L[Modal cảnh báo:\nTất cả tin đăng sẽ bị ẩn]
        K -- Không --> M[performUpdate trực tiếp]
        L --> |Xác nhận| N[performUpdate\n+ draftAllUserRooms]
        L --> |Hủy| O[Không làm gì]
        M & N --> P[supabase.auth.updateUser\ncập nhật metadata]
        P --> Q[supabase.profiles.update\ncập nhật bảng profiles]
        Q --> R[Toast: Cập nhật thành công]
    end
```

---

## 3. Luồng Upload ảnh đại diện (Avatar)

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Hover vào Avatar\nSidebar Profile]) --> B[Overlay camera icon hiển thị]
        B --> C[Bấm chọn file ảnh]
        C --> D[Uploading spinner hiển thị]
    end

    subgraph SYSTEM["⚙️ Hệ thống – imageUtils.js"]
        D --> E[cropImageToSquare\nCắt trung tâm thành hình vuông 400x400]
        E --> F{Cloudinary được cấu hình?}
        F -- Có --> G[Upload lên Cloudinary\ndùng avatar_upload_preset]
        F -- Không --> H[Upload lên Supabase Storage\nbucket: user_avatar\npath: userId/timestamp.ext]
        G --> I[Nhận secure_url]
        H --> J[Lấy publicUrl]
        I & J --> K[supabase.auth.updateUser\ndata.avatar_url = newUrl]
        K --> L[supabase.profiles.update\navatar_url = newUrl]
        L --> M[setFormData cập nhật avatar\nhiển thị ảnh mới]
        M --> N[Toast: Cập nhật ảnh thành công]
        N --> O{Có ảnh cũ?}
        O -- Có, Cloudinary --> P[deleteFromCloudinary\nxóa ảnh cũ]
        O -- Có, Supabase --> Q[Storage.remove\nxóa file cũ]
        O -- Không --> R[Kết thúc]
        P & Q --> R
    end
```

---

## 4. Luồng Tin đã lưu (Favorites)

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm tab Tin đã lưu]) --> B[Fetch danh sách yêu thích]
        B --> C{Có phòng đã lưu?}
        C -- Không --> D[Empty state:\nnút Khám phá ngay]
        D --> E[navigate home]
        C -- Có --> F[RoomGrid hiển thị\nphòng đã lưu]
        F --> G[Bấm vào phòng]
        G --> H[navigate room-detail\nvới fromProfile = true]
        H --> I[Xem chi tiết phòng\nKhi back → quay lại Profile]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> J[SELECT rooms\nWHERE id IN favorites array]
        J --> K[mapSupabaseRoom\nchuyển đổi data]
        K --> L[setSavedRooms]
        L --> C
    end
```

---

## 5. Luồng Phòng đã bình luận

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm tab Phòng đã bình luận]) --> B[Fetch danh sách]
        B --> C{Có phòng đã bình luận?}
        C -- Không --> D[Empty state]
        C -- Có --> E[Grid 2 cột\nhiển thị card phòng\nvà số lượt bình luận]
        E --> F[Bấm vào card]
        F --> G[navigate room-detail\nvới fromProfile = true]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> H[SELECT comments JOIN rooms\nWHERE user_id = current\nORDER BY created_at DESC]
        H --> I[Group theo room_id\nTính số comment mỗi phòng]
        I --> J[setCommentedRooms]
        J --> C
    end
```

---

## 6. Luồng Đổi mật khẩu

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Tab: Đổi mật khẩu"]
        A([Nhập Mật khẩu cũ]) --> B[Nhập Mật khẩu mới]
        B --> C[Nhập Xác nhận mật khẩu mới]
        C --> D[Bấm Cập nhật mật khẩu]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> E{Validate}
        E --> |newPassword ≠ confirm| F[Toast lỗi:\nMật khẩu không khớp]
        E --> |newPassword < 6 ký tự| G[Toast lỗi:\nMật khẩu quá ngắn]
        E --> |Hợp lệ| H[signInWithPassword\nvới oldPassword để verify]
        H --> |Sai| I[Toast lỗi:\nMật khẩu cũ không chính xác]
        H --> |Đúng| J[supabase.auth.updateUser\npassword = newPassword]
        J --> K[Toast: Thay đổi thành công]
        K --> L[Reset form mật khẩu]
    end
```

---

## 7. Luồng Xóa tài khoản vĩnh viễn

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Tab: Vùng nguy hiểm"]
        A([Đọc cảnh báo]) --> B[Nhập mật khẩu xác nhận]
        B --> C[Bấm Xác nhận xóa tài khoản]
        C --> D[Modal CAUTION:\nHành động không thể hoàn tác]
        D --> |Hủy bỏ| E[Không làm gì]
        D --> |Xác nhận xóa| F[Tiến hành xóa]
        F --> G{Thành công?}
        G -- Có --> H[Modal thông báo thành công]
        H --> I[navigate home]
        G -- Lỗi --> J[Toast: Lỗi + message]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        F --> K[signInWithPassword\nxác thực lại]
        K --> |Sai mật khẩu| L[Toast lỗi:\nMật khẩu xác nhận không chính xác]
        K --> |Đúng| M[supabase.rpc\ndelete_user_account]
        M --> N[Supabase function xóa:\nProfile, rooms, comments,\nfavorites, auth user]
        N --> O[supabase.auth.signOut]
        O --> H
    end
```

---

## 8. Luồng Đăng xuất

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Đăng xuất\ntrên sidebar]) --> B[Modal xác nhận]
        B --> |Hủy| C[Không làm gì]
        B --> |Đăng xuất| D[supabase.auth.signOut]
        D --> E[onAuthStateChange kích hoạt\nsetUser = null]
        E --> F[navigate home]
        F --> G[Header cập nhật\nhiển thị nút Đăng nhập]
    end
```
