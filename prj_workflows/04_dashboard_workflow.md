# 📊 Workflow: Dashboard – Quản lý tin đăng

Tài liệu mô tả luồng **đăng tin mới**, **sửa tin**, **công khai/gỡ**, **xóa tin** và **xem trước** dành cho vai trò **Môi giới** và **Bên cho thuê**.

> **Yêu cầu:** Phải đăng nhập và có role `agent` hoặc `landlord`.

---

## 1. Luồng truy cập Dashboard

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Dashboard\ntrên Header/BottomNav]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[navigate login]
        B -- Rồi --> D[DashboardPage hiển thị]
        D --> E[Tab mặc định:\nQuản lý tin đăng]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> F[fetchUserRooms\ntừ Supabase]
        F --> G[SELECT rooms\nWHERE user_id = currentUser]
        G --> H[setRooms với kết quả]
        H --> I[Render danh sách\ntheo subTab hiện tại]
    end
```

---

## 2. Luồng xem và lọc tin đăng theo trạng thái

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Tab: Quản lý tin đăng"]
        A([Tab Quản lý tin đăng]) --> B[3 sub-tab phía trên]
        B --> C{Chọn sub-tab}
        C -- Tin đã kiểm duyệt --> D[Lọc: status=available\nAND is_verified=true]
        C -- Tin đã công khai --> E[Lọc: status=available\nAND is_verified=false]
        C -- Tin nháp --> F[Lọc: status=draft\nOR status=hidden]

        D & E & F --> G[Hiển thị danh sách tin\nvới phân trang 10 tin/trang]
        G --> H{Không có tin?}
        H -- Có --> I[Empty state\nvới hướng dẫn phù hợp]
        H -- Không --> J[Danh sách tin đăng\nvới action buttons]
    end
```

**Badge trạng thái:**

| `status` | `is_verified` | Hiển thị |
|----------|--------------|---------|
| `available` | `true` | 🟢 Đã công khai · 🔵 Đã kiểm duyệt |
| `available` | `false` | 🟢 Đã công khai (chờ kiểm duyệt) |
| `draft` | - | ⬜ Bản nháp |
| `hidden` | - | 🟡 Đã ẩn |
| `expired` | - | 🔴 Hết hạn |

---

## 3. Luồng Đăng tin mới

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Đăng tin ngay\nhoặc vào tab Đăng/Sửa tin]) --> B[Tab: Đăng / Sửa tin]
        B --> C{isCreating hoặc editingRoom?}
        C -- Không --> D[Empty state:\nnút Tạo tin đăng mới]
        D --> E[Bấm tạo tin mới\nsetIsCreating = true]
        C -- Có --> F[RoomPostForm hiển thị\nvới form trống]
        E --> F

        F --> G[Điền thông tin:\nTiêu đề, Địa chỉ, Giá, Diện tích]
        G --> H[Upload ảnh\ntừ thiết bị hoặc URL]
        H --> I[Điền Mô tả chi tiết]
        I --> J[Điền chi phí:\nCọc, Điện, Nước, Internet, ...]
        J --> K[Chọn Tiện nghi & Nội quy]
        K --> L{Bấm Lưu nháp\nhoặc Công khai}
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        L -- Lưu nháp --> M[INSERT rooms\nstatus = draft]
        L -- Công khai --> N[Validate đủ thông tin\nbắt buộc]
        N --> |Thiếu thông tin| O[Modal lỗi:\nliệt kê các mục thiếu]
        N --> |Đủ thông tin| P[INSERT rooms\nstatus = available]
        M --> Q[Chuyển sang tab\nQuản lý tin đăng]
        P --> Q
        O --> F
    end
```

**Validation khi công khai tin:**

| Trường | Yêu cầu |
|--------|---------|
| Tiêu đề | Bắt buộc, không được trống |
| Giá thuê | ≥ 100.000đ |
| Diện tích | > 0 m² |
| Địa chỉ | Đủ: Tỉnh + Huyện + Xã + Số nhà |
| Tiền cọc | ≥ 500.000đ |
| Ảnh thực tế | ≥ 1 ảnh |
| Mô tả | ≥ 20 ký tự |
| Link video | Nếu có, phải là YouTube hoặc TikTok hợp lệ |

---

## 4. Luồng Upload ảnh phòng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – RoomPostForm"]
        A([Chọn file ảnh\nhoặc kéo thả]) --> B[File được chọn]
        B --> C[compressImage\nGiảm chất lượng/kích thước]
    end

    subgraph SYSTEM["⚙️ Hệ thống – imageUtils.js"]
        C --> D{Cloudinary được cấu hình?}
        D -- Có --> E[Upload lên Cloudinary\nVia API + upload_preset]
        D -- Không --> F[Upload lên Supabase Storage\nbucket: room_media]
        E --> G[Nhận secure_url\ntừ Cloudinary]
        F --> H[Lấy publicUrl\ntừ Supabase]
        G & H --> I[Thêm URL vào\ndanh sách ảnh]
        I --> J[Ảnh đầu tiên\ntự động là ảnh bìa]
    end
```

---

## 5. Luồng Công khai tin từ bản nháp

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Sub-tab: Tin nháp"]
        A([Bấm nút Công khai\ntrên tin nháp]) --> B[handlePublishFromDraft]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C[validateRoomData\nkiểm tra đủ thông tin]
        C --> |Thiếu thông tin| D[Modal lỗi với\nlist các mục còn thiếu]
        C --> |Đủ thông tin| E[Modal xác nhận:\nBạn có chắc muốn công khai?]
        E --> |Hủy| F[Không làm gì]
        E --> |Xác nhận| G[UPDATE rooms\nSET status = available]
        G --> H[setRooms cập nhật local]
        H --> I[Toast: Tin đã được gửi\nđang chờ duyệt]
        I --> J[Chuyển sang sub-tab\nTin đã kiểm duyệt]
        D --> K[Nút Sửa để bổ sung]
    end
```

---

## 6. Luồng Gỡ công khai tin

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Sub-tab: Tin đã công khai / Đã kiểm duyệt"]
        A([Bấm nút Gỡ công khai]) --> B[handleUnpublish]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C{room.is_verified?}
        C -- Có --> D[Modal cảnh báo:\nGỡ tin đã kiểm duyệt\nsẽ cần kiểm duyệt lại]
        C -- Không --> E[Modal xác nhận bình thường]
        D & E --> |Xác nhận| F[moveRoomToDraft\nSET status = draft\nSET is_verified = false]
        F --> G[setRooms cập nhật local]
        G --> H[Toast: Đã gỡ công khai]
        H --> I[Tin xuất hiện trong\nSub-tab Tin nháp]
        D & E --> |Hủy| J[Không làm gì]
    end
```

---

## 7. Luồng Xóa tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Sub-tab: Tin nháp"]
        A([Bấm nút Xóa]) --> B[handleDeleteRoom]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C[Modal xác nhận:\nHành động không thể hoàn tác]
        C --> |Hủy| D[Không làm gì]
        C --> |Xóa| E[DELETE rooms WHERE id\nvà Cascade Delete dữ liệu liên quan]
        E --> F{Xóa thành công?}
        F -- Có --> G[Duyệt qua media_contact.images]
        G --> H{Ảnh từ Cloudinary?}
        H -- Có --> I[deleteFromCloudinary\nxóa ảnh trên cloud]
        H -- Không --> J[Xóa từ Supabase Storage\nbucket room_media]
        I & J --> K[setRooms filter bỏ room đã xóa]
        K --> L[Toast: Xóa tin thành công]
        F -- Không --> M[Modal lỗi:\nKhông thể xóa tin đăng]
    end
```

---

## 8. Luồng Xem trước tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Xem trước\ntrên bất kỳ tin nào]) --> B[setPreviewRoom\nvới data được map]
        B --> C[Overlay fullscreen\nRoomDetailPage với previewMode=true]
        C --> D[Banner: Bạn đang ở chế độ xem trước]
        D --> E{Thoát?}
        E --> F[Bấm nút đóng\nsetPreviewRoom = null]
        F --> G[Quay lại Dashboard]
    end

    subgraph NOTE["📌 Đặc điểm Preview Mode"]
        H[Nút Lưu tin bị vô hiệu hóa]
        I[Nút Liên hệ bị vô hiệu hóa]
        J[Không đếm lượt xem]
        K[Bình luận: Vẫn có thể xem và đăng]
    end
```

---

## 9. Luồng Kiểm duyệt tin (Mock)

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Sub-tab: Tin đã công khai"]
        A([Bấm nút Duyệt tin - Mock]) --> B[handleMockVerify]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C[UPDATE rooms\nSET is_verified = true]
        C --> D[setRooms cập nhật local]
        D --> E[Toast: Đã duyệt tin\nMockup]
    end

    subgraph NOTE["📌 Lưu ý"]
        F[Đây là tính năng Mock\nThực tế kiểm duyệt do Admin thực hiện\nphía backend/admin panel]
    end
```
