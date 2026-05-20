# 🏡 Xem chi tiết phòng — Yêu thích · Liên hệ · Bình luận

Tài liệu mô tả mọi thứ xảy ra khi người dùng mở một tin đăng phòng trọ cụ thể.

---

## 1. Mở trang chi tiết phòng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm vào thẻ phòng\ntrên trang chủ]) --> B{Cách mở}
        B -- Bấm từ danh sách --> C[Hệ thống mở trang\nchi tiết phòng]
        B -- Nhập trực tiếp\nđịa chỉ URL phòng --> D[Hệ thống tìm phòng\ntheo tên trong URL]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        C --> E{Phòng có đang\nhiển thị không?}
        D --> F[Tìm phòng theo tên\nthân thiện trong URL]
        F --> G{Tìm thấy?}
        G -- Không --> H[Chuyển về Trang chủ]
        G -- Đã bị ẩn --> I[Thông báo:\nPhòng không còn tồn tại]
        G -- Còn hiển thị --> J[Chuyển đổi dữ liệu\nsang định dạng hiển thị]
        E -- Đã bị ẩn --> I
        E -- Còn hiển thị --> K[Hiện trang chi tiết\ndạng lớp phủ toàn màn hình]
        J --> K
        K --> L[URL chuyển sang\ntên phòng thân thiện]
        L --> M[Trang bên dưới\nbị khóa cuộn]
    end
```

---

## 2. Đếm lượt xem phòng

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống — Chạy ngầm khi mở phòng"]
        A([Trang chi tiết phòng mở]) --> B{Đang ở chế độ\nXem trước?}
        B -- Có --> C[Bỏ qua, không đếm]
        B -- Không --> D{Phòng này đã được\nđếm trong lần xem này chưa?}
        D -- Rồi --> C
        D -- Chưa --> E[Gọi hàm tăng lượt xem\nlên cơ sở dữ liệu]
        E --> F{Thành công?}
        F -- Có --> G[Số lượt xem\nhiển thị trên màn hình tăng lên 1]
        F -- Lỗi --> H[Thử cách thay thế:\ncập nhật trực tiếp vào bảng phòng]
        H --> I{Thành công?}
        I -- Có --> J[Cập nhật số lượt xem\ntừ dữ liệu trả về]
        I -- Lỗi quyền truy cập --> K[Bỏ qua, không hiện lỗi\ncho người dùng]
    end
```

> **Lưu ý:** Mỗi lần xem chỉ được đếm một lần — dù người dùng quay lại xem nhiều lần trong cùng một phiên.

---

## 3. Gallery ảnh và video

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Xem trang chi tiết]) --> B[Phần media hiển thị:\nvideo trước, ảnh sau]
        B --> C[Hiển thị ảnh/video\nđầu tiên trong khung lớn]
        C --> D{Loại media đang xem}
        D -- Video YouTube/TikTok --> E[Video nhúng trực tiếp\nxem ngay trên trang]
        D -- Ảnh --> F[Ảnh phóng to\ntrong khung chính]

        C --> G[Hàng thumbnail nhỏ\nphía dưới khung lớn]
        G --> H[Bấm thumbnail\nđể chuyển sang ảnh/video đó]

        C --> I[Mũi tên trái/phải\nkhi có nhiều hơn 1 ảnh]
        I --> J[Chuyển ảnh trước/sau\nvòng lặp tròn]
    end
```

---

## 4. Lưu phòng yêu thích

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Lưu tin\ntrên trang chi tiết]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[Thông báo:\nCần đăng nhập để lưu tin]
        C --> D[Bấm Đăng nhập ngay\nchuyển sang trang đăng nhập]
        B -- Rồi --> E{Phòng này đã lưu\ntrước đó chưa?}
        E -- Chưa --> F[Thêm vào danh sách yêu thích]
        E -- Rồi --> G[Bỏ khỏi danh sách yêu thích]
        F --> H[Nút đổi thành: Đã lưu tin\nIcon tim đỏ có hiệu ứng nhịp đập]
        G --> I[Nút đổi lại: Lưu tin\nIcon tim trống]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        F --> J[Lưu vào cơ sở dữ liệu:\nbảng danh sách yêu thích]
        G --> K[Xóa khỏi cơ sở dữ liệu:\nbảng danh sách yêu thích]
        J & K --> L[Cập nhật danh sách\nyêu thích toàn ứng dụng]
    end
```

---

## 5. Liên hệ chủ nhà

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Xem trang chi tiết phòng]) --> B[Thẻ liên hệ bên phải\nhoặc phía dưới trên điện thoại]
        B --> C{Bấm Liên hệ ngay\nhoặc Nhắn tin qua Zalo}
        C --> D{Đã đăng nhập?}
        D -- Chưa --> E[Thông báo:\nCần đăng nhập để xem liên hệ]
        D -- Rồi --> F[Số điện thoại hiện ra\nđịnh dạng: 09xx xxx xxx]
        E --> G[Bấm Đăng nhập\nchuyển trang]
    end

    subgraph NOTE["📌 Lý do yêu cầu đăng nhập"]
        H[Bảo vệ thông tin liên hệ của chủ nhà\ntránh bị thu thập tự động bởi bot]
    end
```

---

## 6. Bình luận

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Cuộn xuống phần\nBình luận]) --> B[Xem danh sách bình luận\ncủa phòng này]
        B --> C{Muốn viết bình luận?}
        C -- Chưa đăng nhập --> D[Nút: Đăng nhập để bình luận]
        D --> E[Chuyển sang trang đăng nhập]
        C -- Đã đăng nhập --> F[Ô nhập nội dung\nhiển thị bên dưới]
        F --> G[Nhập nội dung bình luận]
        G --> H[Bấm Gửi]
        H --> I[Bình luận mới hiện\ntrên danh sách]

        I --> J{Bình luận đó\ndo mình viết?}
        J -- Có --> K[Nút Xóa hiện\nbên cạnh bình luận đó]
        K --> L[Bấm Xóa\nBình luận biến mất]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        H --> M[Lưu bình luận vào\ncơ sở dữ liệu]
        M --> N[Tải lại danh sách bình luận\ncủa phòng này]
        N --> I
        L --> O[Xóa bình luận\nkhỏi cơ sở dữ liệu]
        O --> N
    end
```

---

## 7. Đóng trang chi tiết phòng — Quay lại

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Quay lại]) --> B{Mở phòng từ đâu?}
        B -- Từ Hồ sơ cá nhân --> C[Quay về trang Hồ sơ]
        B -- Từ Trang chủ --> D[Quay về Trang chủ]
        B -- Bấm nút Back\ncủa trình duyệt --> E[Xử lý điều hướng\ntheo URL trước đó]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        A --> F[Bắt đầu hiệu ứng\nđóng trang]
        F --> G[Chờ hiệu ứng hoàn tất\n250 mili giây]
        G --> H[Chuyển sang trang đích]
        H --> I[Bỏ khóa cuộn trang\ncuộn trang bình thường trở lại]
        I --> J[URL cập nhật về\ntrang chủ hoặc hồ sơ]
    end
```

---

## 8. Tóm tắt thông tin trên trang chi tiết phòng

| Khu vực | Nội dung hiển thị |
|---------|------------------|
| **Gallery** | Ảnh và video (YouTube/TikTok nhúng trực tiếp) |
| **Tiêu đề** | Tên phòng, địa chỉ đầy đủ, số lượt xem, ngày cập nhật, ngày hết hạn |
| **Gần trường** | Nhãn các trường đại học thuộc cùng quận/phường |
| **Thống kê nhanh** | Giá thuê, diện tích, sức chứa tối đa, loại phòng vệ sinh |
| **Mô tả** | Nội dung mô tả do người đăng viết |
| **Chi phí** | Tiền cọc, điện, nước, internet, gửi xe, dịch vụ thêm |
| **Nội quy** | Giờ giấc ra vào, thú cưng, giặt đồ, chung chủ hay không |
| **Tiện nghi** | Lưới các tiện nghi — sáng nếu có, mờ nếu không có |
| **Bản đồ** | Đang phát triển |
| **Bình luận** | Danh sách bình luận của người thuê |
| **Thẻ liên hệ** | Giá, mã tin, thông tin chủ phòng, nút Gọi điện và Zalo |
