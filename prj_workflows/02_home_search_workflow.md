# 🔍 Tìm kiếm & Lọc phòng — Trang chủ

Tài liệu mô tả cách người dùng tìm kiếm phòng theo vị trí, lọc theo tiêu chí và xem thêm kết quả trên trang chủ TroTot.

---

## 1. Tìm kiếm theo vị trí

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Vào trang chủ]) --> B[Thấy ô tìm kiếm\ntrên banner hoặc thanh điều hướng]
        B --> C[Bấm vào ô tìm kiếm]
        C --> D[Hộp thoại chọn vị trí\nhiện ra]
        D --> E{Muốn tìm theo cách nào?}
        E -- Theo tỉnh/thành phố --> F[Chọn Tỉnh hoặc Thành phố\ntừ danh sách]
        E -- Theo trường đại học --> G[Chọn Trường đại học]
        F --> H[Bấm Tìm kiếm]
        G --> H
        H --> I[Hộp thoại đóng lại]
        I --> J[Danh sách phòng cập nhật\ntrang tự cuộn xuống kết quả]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        H --> K[Cập nhật bộ lọc vị trí\nvới thành phố hoặc trường ĐH đã chọn]
        K --> L[Truy vấn lại danh sách phòng\nkhớp vị trí từ cơ sở dữ liệu]
        L --> M[Trả về danh sách phòng\nphù hợp]
        M --> O[Cập nhật giao diện\nhiển thị kết quả mới]
        O --> J
    end
```

---

## 2. Lọc phòng nâng cao

```mermaid
flowchart TD
    subgraph USER_DESKTOP["🖥️ Người dùng — Máy tính"]
        A([Xem danh sách phòng]) --> B[Thanh lọc hiển thị\nbên phải danh sách]
        B --> C{Chọn tiêu chí lọc}
        C --> D[Giá thuê: kéo thả\nhoặc nhập khoảng min/max]
        C --> E[Diện tích: nhập\nkhoảng min/max]
        C --> F[Loại phòng:\nphòng đơn, đôi, studio...]
        C --> G[Tiện nghi: bật/tắt\nWifi, điều hòa, tủ lạnh...]
        C --> H[Tìm theo từ khóa:\ntheo tên hoặc địa chỉ]
        D & E & F & G & H --> I[Kết quả tự động cập nhật\nngay sau khi thay đổi]
    end

    subgraph USER_MOBILE["📱 Người dùng — Điện thoại"]
        J([Bấm icon Lọc\ntrên thanh điều hướng dưới]) --> K[Bảng lọc trượt lên\ntừ phía dưới màn hình]
        K --> L[Chọn tiêu chí\ntương tự máy tính]
        L --> M[Bấm Áp dụng]
        M --> N[Bảng lọc đóng\nDanh sách cập nhật kết quả]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        I --> O[Chờ một chút\ntrước khi gọi lên server\nđể tránh gọi quá nhiều lần]
        O --> P[Truy vấn cơ sở dữ liệu\nvới tất cả tiêu chí đang bật]
        P --> Q[Trả về danh sách phòng\nkhớp tất cả điều kiện]
        Q --> R[Cập nhật giao diện]
        M --> O
    end
```

**Các tiêu chí lọc hỗ trợ:**

| Tiêu chí | Loại | Mô tả |
|----------|------|--------|
| Tỉnh/Thành phố | Chọn một | Lọc theo vị trí địa lý |
| Trường đại học | Chọn một | Lọc phòng gần trường |
| Từ khóa | Nhập text | Tìm theo tên phòng hoặc địa chỉ |
| Giá thuê | Khoảng số | Giá tháng tối thiểu và tối đa |
| Diện tích | Khoảng số | Diện tích tối thiểu và tối đa |
| Loại phòng | Chọn một | Phòng đơn, đôi, studio, căn hộ mini... |
| Tiện nghi | Bật/tắt nhiều | Wifi, điều hòa, tủ lạnh, máy giặt... |

---

## 3. Xem thêm kết quả

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Cuộn xuống cuối\ndanh sách phòng]) --> B{Còn phòng chưa hiển thị?}
        B -- Có --> C[Thấy nút\nXem thêm kết quả]
        B -- Không --> D[Thông báo:\nĐã hiển thị tất cả kết quả]
        C --> E[Bấm nút]
        E --> F[Vòng xoay tải\nhiển thị trên nút]
        F --> G[Các phòng mới\nthêm vào bên dưới danh sách]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        E --> H[Tải thêm một trang phòng tiếp theo\nvị trí bắt đầu dịch chuyển về phía sau]
        H --> I[Gộp phòng mới vào\ndanh sách hiện tại]
        I --> J{Vẫn còn phòng tiếp theo?}
        J -- Có --> K[Giữ nút Xem thêm]
        J -- Không --> L[Ẩn nút\nHiện thông báo hết]
        K --> G
        L --> D
    end
```

---

## 4. Danh sách phòng hiển thị như thế nào

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống — Khi trang chủ mở"]
        A([Trang chủ tải lên]) --> B[Tự động tải danh sách phòng\ntừ cơ sở dữ liệu]
        B --> C{Trạng thái tải}
        C -- Đang tải --> D[Hiển thị thẻ phòng mờ\nchờ dữ liệu về]
        C -- Lỗi kết nối --> E[Thông báo lỗi\nnút Thử lại]
        C -- Tải xong --> F[Hiển thị lưới\ncác thẻ phòng]
    end

    subgraph USER["👤 Người dùng"]
        F --> G[Xem và cuộn qua\ncác thẻ phòng]
        G --> H{Bấm vào phòng nào?}
        H -- Có --> I[Trang chi tiết phòng\nhiển thị dạng lớp phủ]
        H -- Không --> J[Tiếp tục cuộn\nxem các phòng khác]
    end

    subgraph SYSTEM2["⚙️ Hệ thống — Khi mở chi tiết phòng"]
        I --> K{Phòng còn hiển thị\nkhông?}
        K -- Đã bị ẩn hoặc xóa --> L[Thông báo:\nPhòng không còn tồn tại]
        K -- Vẫn còn --> M[Hiện chi tiết phòng\nURL chuyển sang tên phòng]
        L --> G
    end
```

---

## 5. Sơ đồ các thành phần trang chủ

```
Trang chủ (HomePage)
│
├── Banner Hero
│   ├── Ô tìm kiếm (SearchTrigger)     ← Bấm để mở hộp chọn vị trí
│   └── Số liệu thống kê (300+ phòng, N thành phố...)
│
└── Khu vực danh sách phòng
    ├── Thanh lọc bên phải (máy tính)  ← Bộ lọc nâng cao
    └── Lưới phòng                     ← Các thẻ phòng, bấm để xem chi tiết

Toàn ứng dụng (App)
├── Hộp thoại chọn vị trí             ← Hiện khi bấm ô tìm kiếm
└── Bảng lọc điện thoại               ← Trượt lên từ dưới khi bấm icon lọc
```
