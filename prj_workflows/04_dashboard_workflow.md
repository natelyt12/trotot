# 📊 Quản lý tin đăng — Dành cho chủ nhà và môi giới

Tài liệu mô tả cách đăng tin mới, sửa tin, công khai, gỡ, xóa và xem trước tin đăng phòng trọ trên Dashboard của TroTot.

> **Yêu cầu:** Phải đăng nhập với tài khoản **Môi giới** hoặc **Bên cho thuê**.

---

## 1. Vào trang Quản lý tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Quản lý tin đăng\ntrên thanh điều hướng]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[Chuyển sang\ntrang Đăng nhập]
        B -- Rồi --> D[Trang Dashboard hiển thị]
        D --> E[Tab mặc định:\nQuản lý tin đăng]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> F[Tải danh sách\ntin đăng của tài khoản này]
        F --> G[Lấy tất cả phòng\ntừ cơ sở dữ liệu]
        G --> H[Hiển thị danh sách\ntheo bộ lọc tab đang chọn]
    end
```

---

## 2. Xem tin theo trạng thái

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Quản lý tin đăng"]
        A([Vào tab Quản lý tin đăng]) --> B[3 tab con phía trên]
        B --> C{Chọn tab}
        C -- Tin đã kiểm duyệt --> D[Chỉ hiện tin:\nĐã công khai VÀ đã được duyệt]
        C -- Tin đã công khai --> E[Chỉ hiện tin:\nĐã công khai nhưng chưa được duyệt]
        C -- Tin nháp --> F[Chỉ hiện tin:\nBản nháp hoặc đã ẩn]

        D & E & F --> G[Hiển thị danh sách\n10 tin mỗi trang — có phân trang]
        G --> H{Không có tin nào?}
        H -- Có --> I[Màn hình rỗng\nvới hướng dẫn phù hợp]
        H -- Không --> J[Danh sách tin\nvới các nút thao tác]
    end
```

**Ý nghĩa các trạng thái:**

| Trạng thái | Màu nhãn | Ý nghĩa |
|------------|---------|---------|
| Đã công khai + Đã kiểm duyệt | 🟢 Xanh · 🔵 Xanh dương | Tin đang hiển thị, đã được admin duyệt |
| Đã công khai + Chờ duyệt | 🟢 Xanh | Tin đang hiển thị, chờ admin kiểm tra |
| Bản nháp | ⬜ Xám | Mới tạo, chưa ai xem được |
| Đã ẩn | 🟡 Vàng | Tạm thời không hiển thị |
| Hết hạn | 🔴 Đỏ | Tin đã quá ngày hết hạn |

---

## 3. Đăng tin phòng mới

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Đăng tin ngay\nhoặc vào tab Đăng/Sửa tin]) --> B[Tab: Đăng / Sửa tin]
        B --> C{Có tin đang cần sửa\nhoặc đang tạo mới không?}
        C -- Không --> D[Màn hình rỗng:\nnút Tạo tin đăng mới]
        D --> E[Bấm Tạo tin mới]
        C -- Có --> F[Form đăng tin\nhiển thị trống]
        E --> F

        F --> G[Điền tiêu đề, địa chỉ,\ngiá thuê, diện tích]
        G --> H[Tải ảnh lên\ntừ thiết bị hoặc dán đường dẫn ảnh]
        H --> I[Viết mô tả chi tiết]
        I --> J[Điền chi phí hàng tháng:\nCọc, điện, nước, internet...]
        J --> K[Chọn tiện nghi và nội quy phòng]
        K --> L{Muốn làm gì?}
        L -- Lưu nháp --> M[Lưu dạng bản nháp\nchưa ai xem được]
        L -- Đăng công khai --> N[Kiểm tra thông tin\ntrước khi đăng]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        N --> O{Đủ thông tin\nbắt buộc chưa?}
        O --> |Thiếu| P[Thông báo lỗi:\nliệt kê các mục còn thiếu]
        O --> |Đủ| Q[Lưu tin đăng\ntrạng thái Đã công khai]
        M --> R[Lưu tin đăng\ntrạng thái Bản nháp]
        Q & R --> S[Chuyển sang tab\nQuản lý tin đăng]
        P --> F
    end
```

**Thông tin bắt buộc khi đăng công khai:**

| Thông tin | Điều kiện |
|-----------|-----------|
| Tiêu đề tin | Không được để trống |
| Giá thuê | Tối thiểu 100.000đ/tháng |
| Diện tích | Phải lớn hơn 0 m² |
| Địa chỉ | Phải có đủ: Tỉnh · Huyện · Xã · Số nhà |
| Tiền cọc | Tối thiểu 500.000đ |
| Ảnh thực tế | Ít nhất 1 ảnh phòng |
| Mô tả | Tối thiểu 20 ký tự |
| Link video | Nếu có, phải là link YouTube hoặc TikTok hợp lệ |

---

## 4. Tải ảnh phòng lên

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Chọn ảnh từ thiết bị\nhoặc kéo thả vào form]) --> B[Ảnh được chọn]
        B --> C[Hệ thống nén ảnh\ntrước khi tải lên]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        C --> D{Có cấu hình\nCloudinary không?}
        D -- Có --> E[Tải lên kho ảnh\nCloudinary]
        D -- Không --> F[Tải lên kho lưu trữ\ncủa Supabase]
        E --> G[Nhận địa chỉ ảnh\ntrả về từ Cloudinary]
        F --> H[Tạo địa chỉ ảnh\ntừ Supabase]
        G & H --> I[Thêm ảnh vào\ndanh sách ảnh của tin đăng]
        I --> J[Ảnh đầu tiên trong danh sách\ntự động làm ảnh bìa]
    end
```

---

## 5. Công khai tin từ bản nháp

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Tin nháp"]
        A([Bấm nút Công khai\ntrên tin nháp]) --> B[Hệ thống kiểm tra\nthông tin của tin đó]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C{Đủ thông tin\nbắt buộc?}
        C --> |Thiếu| D[Thông báo lỗi:\nliệt kê các mục thiếu\nnút Sửa để bổ sung]
        C --> |Đủ| E[Hộp thoại xác nhận:\nBạn có chắc muốn công khai?]
        E --> |Hủy| F[Không làm gì]
        E --> |Xác nhận| G[Cập nhật trạng thái\nthành Đã công khai]
        G --> H[Danh sách tin cập nhật\nngay tức thì]
        H --> I[Thông báo nhỏ:\nTin đã gửi, đang chờ kiểm duyệt]
        I --> J[Chuyển sang tab\nTin đã kiểm duyệt]
        D --> K[Quay lại xem tin nháp]
    end
```

---

## 6. Gỡ công khai tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Tin đã công khai hoặc Đã kiểm duyệt"]
        A([Bấm nút Gỡ công khai]) --> B[Hộp thoại xác nhận hiển thị]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> C{Tin này đã được\nkiểm duyệt trước đó?}
        C -- Có --> D[Cảnh báo thêm:\nGỡ tin đã duyệt có thể\ncần kiểm duyệt lại khi đăng lại]
        C -- Không --> E[Hộp xác nhận bình thường]
        D & E --> |Hủy| F[Không làm gì]
        D & E --> |Xác nhận| G[Chuyển tin về\ntrạng thái Bản nháp\nBỏ trạng thái đã kiểm duyệt]
        G --> H[Danh sách tin cập nhật\nngay tức thì]
        H --> I[Thông báo nhỏ:\nĐã gỡ công khai]
        I --> J[Tin chuyển sang\ntab Tin nháp]
    end
```

---

## 7. Xóa tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Tin nháp"]
        A([Bấm nút Xóa]) --> B[Hộp thoại xác nhận:\nHành động không thể hoàn tác]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> |Hủy| C[Không làm gì]
        B --> |Xóa| D[Xóa tin đăng\nvà tất cả dữ liệu liên quan\nkhỏi cơ sở dữ liệu]
        D --> E{Xóa thành công?}
        E -- Có --> F[Duyệt qua các ảnh của tin]
        F --> G{Ảnh đang lưu ở đâu?}
        G -- Cloudinary --> H[Xóa ảnh khỏi\nCloudinary]
        G -- Supabase --> I[Xóa ảnh khỏi\nkho lưu trữ Supabase]
        H & I --> J[Cập nhật danh sách\nbỏ tin vừa xóa]
        J --> K[Thông báo nhỏ:\nXóa tin thành công]
        E -- Thất bại --> L[Thông báo lỗi:\nKhông thể xóa tin đăng]
    end
```

---

## 8. Xem trước tin đăng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Xem trước\ntrên bất kỳ tin nào]) --> B[Trang chi tiết phòng\nhiển thị toàn màn hình]
        B --> C[Dải thông báo màu vàng:\nBạn đang ở chế độ Xem trước]
        C --> D[Kiểm tra giao diện\nnhư người thuê sẽ thấy]
        D --> E[Bấm nút đóng\nQuay về Dashboard]
    end

    subgraph NOTE["📌 Trong chế độ Xem trước"]
        F[✅ Có thể: Cuộn xem nội dung, đọc bình luận]
        G[❌ Không thể: Lưu yêu thích, xem SĐT, liên hệ chủ nhà]
        H[❌ Không tính: Lượt xem không tăng]
    end
```

---

## 9. Kiểm duyệt tin — Tính năng thử nghiệm

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Tin đã công khai"]
        A([Bấm nút Duyệt tin\nMock]) --> B[Hệ thống đánh dấu tin\nđã được kiểm duyệt]
        B --> C[Thông báo nhỏ:\nĐã duyệt tin thành công — Mockup]
    end

    subgraph NOTE["📌 Lưu ý quan trọng"]
        D[Đây là tính năng MÔ PHỎNG\nchỉ dùng để test\nTrong thực tế, kiểm duyệt do\nquản trị viên thực hiện]
    end
```
