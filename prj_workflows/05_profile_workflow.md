# 👤 Hồ sơ cá nhân — Cài đặt tài khoản

Tài liệu mô tả các tính năng trên trang Hồ sơ cá nhân của TroTot: chỉnh sửa thông tin, đổi ảnh đại diện, xem phòng đã lưu, đổi mật khẩu và xóa tài khoản.

> **Yêu cầu:** Phải đăng nhập. Truy cập qua đường dẫn `/profile`.

---

## 1. Vào trang Hồ sơ và khởi tạo dữ liệu

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm Hồ sơ\ntrên thanh điều hướng]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[Chuyển sang\ntrang Đăng nhập]
        B -- Rồi --> D[Trang Hồ sơ hiển thị]
        D --> E[Tab mặc định:\nThông tin cá nhân]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> F[Lấy thông tin từ phiên\nđăng nhập hiện tại]
        F --> G[Tải thêm thông tin\nmới nhất từ cơ sở dữ liệu]
        G --> H[Hiển thị thông tin\nmới nhất lên form]
    end

    subgraph LAYOUT["🗂️ Cấu trúc trang"]
        I[Sidebar trái: Ảnh đại diện · Tên · Email]
        J[Menu điều hướng:\n— Nhóm Cá nhân:\n  Thông tin cá nhân\n  Tin đã lưu\n  Phòng đã bình luận\n— Nhóm Bảo mật:\n  Đổi mật khẩu\n  Vùng nguy hiểm]
        K[Nút Đăng xuất\nphía dưới menu]
    end
```

---

## 2. Cập nhật thông tin cá nhân

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Thông tin cá nhân"]
        A([Xem form thông tin]) --> B[Sửa Tên người dùng]
        B --> C[Sửa Số điện thoại]
        C --> D{Muốn đổi\nloại tài khoản?}
        D -- Có --> E[Chọn:\nNgười thuê · Môi giới · Bên cho thuê]
        D -- Không --> F[Giữ nguyên]
        E & F --> G[Bấm Lưu thay đổi]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        G --> H{Kiểm tra thông tin}
        H --> |Tên trống| I[Thông báo:\nVui lòng nhập họ tên]
        H --> |SĐT sai định dạng| J[Thông báo:\nSố điện thoại không hợp lệ]
        H --> |Hợp lệ| K{Có đang chuyển từ\nMôi giới/Bên cho thuê\nsang Người thuê không?}
        K -- Có --> L[Hộp thoại cảnh báo:\nTất cả tin đăng sẽ bị ẩn tạm thời]
        K -- Không --> M[Cập nhật thông tin\nngay lập tức]
        L --> |Hủy| N[Không làm gì]
        L --> |Xác nhận| O[Cập nhật thông tin\nVÀ ẩn tất cả tin đăng\nvề bản nháp]
        M & O --> P[Thông báo nhỏ:\nCập nhật thành công]
    end
```

---

## 3. Thay ảnh đại diện

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Di chuột vào ảnh đại diện\ntrên sidebar]) --> B[Lớp phủ tối + icon camera\nhiển thị]
        B --> C[Bấm vào để chọn file ảnh]
        C --> D[Vòng xoay tải\nxuất hiện trong lúc chờ]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> E[Cắt ảnh thành hình vuông\ntừ trung tâm — 400x400 điểm ảnh]
        E --> F{Có cấu hình\nCloudinary không?}
        F -- Có --> G[Tải lên kho ảnh\nCloudinary]
        F -- Không --> H[Tải lên kho lưu trữ\nSupabase\nthư mục theo ID người dùng]
        G --> I[Nhận địa chỉ ảnh mới]
        H --> J[Tạo địa chỉ ảnh mới]
        I & J --> K[Cập nhật ảnh\ntrên tài khoản đăng nhập]
        K --> L[Cập nhật ảnh\ntrong bảng hồ sơ người dùng]
        L --> M[Ảnh mới hiển thị ngay\ntrên giao diện]
        M --> N[Thông báo nhỏ:\nCập nhật ảnh thành công]
        N --> O{Có ảnh cũ không?}
        O -- Có, trên Cloudinary --> P[Xóa ảnh cũ\nkhỏi Cloudinary]
        O -- Có, trên Supabase --> Q[Xóa file ảnh cũ\nkhỏi kho lưu trữ]
        O -- Không --> R[Kết thúc]
        P & Q --> R
    end
```

> **Lý do cắt vuông:** Ảnh đại diện luôn hiển thị trong khung tròn — cắt chính giữa giúp ảnh không bị méo.

---

## 4. Xem tin phòng đã lưu yêu thích

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm tab Tin đã lưu]) --> B[Hệ thống tải danh sách]
        B --> C{Có phòng đã lưu không?}
        C -- Không --> D[Màn hình rỗng:\nnút Khám phá ngay]
        D --> E[Chuyển về Trang chủ]
        C -- Có --> F[Lưới các thẻ phòng\nđã lưu]
        F --> G[Bấm vào thẻ phòng]
        G --> H[Trang chi tiết phòng mở\nkhi quay lại → về trang Hồ sơ]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> I[Lấy danh sách ID phòng\ntừ bảng yêu thích]
        I --> J[Tải dữ liệu đầy đủ\ncủa từng phòng đó]
        J --> K[Chuyển đổi sang\nđịnh dạng hiển thị thẻ phòng]
        K --> C
    end
```

---

## 5. Xem phòng đã từng bình luận

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm tab Phòng đã bình luận]) --> B[Hệ thống tải danh sách]
        B --> C{Đã bình luận phòng nào chưa?}
        C -- Chưa --> D[Màn hình rỗng]
        C -- Rồi --> E[Lưới 2 cột\nhiển thị thẻ phòng\nvà số lượng bình luận đã viết]
        E --> F[Bấm vào thẻ phòng]
        F --> G[Trang chi tiết phòng mở\nkhi quay lại → về trang Hồ sơ]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        B --> H[Lấy tất cả bình luận\ncủa tài khoản này]
        H --> I[Gộp theo phòng:\nmỗi phòng 1 dòng\nvà đếm số bình luận]
        I --> J[Sắp xếp theo\nbình luận gần nhất]
        J --> C
    end
```

---

## 6. Đổi mật khẩu

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Đổi mật khẩu"]
        A([Nhập Mật khẩu hiện tại]) --> B[Nhập Mật khẩu mới]
        B --> C[Nhập lại Mật khẩu mới\nđể xác nhận]
        C --> D[Bấm Cập nhật mật khẩu]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> E{Kiểm tra thông tin}
        E --> |Mật khẩu mới và xác nhận\nkhông giống nhau| F[Thông báo:\nMật khẩu không khớp]
        E --> |Mật khẩu mới dưới 6 ký tự| G[Thông báo:\nMật khẩu quá ngắn]
        E --> |Hợp lệ| H[Đăng nhập lại\nbằng mật khẩu hiện tại\nđể xác thực danh tính]
        H --> |Mật khẩu hiện tại sai| I[Thông báo:\nMật khẩu cũ không chính xác]
        H --> |Đúng| J[Cập nhật\nmật khẩu mới lên hệ thống]
        J --> K[Thông báo nhỏ:\nThay đổi thành công]
        K --> L[Form mật khẩu\nđược xóa trắng]
    end
```

---

## 7. Xóa tài khoản vĩnh viễn

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng — Tab: Vùng nguy hiểm"]
        A([Đọc cảnh báo\ntrên trang]) --> B[Nhập mật khẩu\nđể xác nhận danh tính]
        B --> C[Bấm Xác nhận xóa tài khoản]
        C --> D[Hộp thoại cảnh báo đỏ:\nHành động KHÔNG thể hoàn tác]
        D --> |Hủy bỏ| E[Không làm gì]
        D --> |Xác nhận xóa| F[Tiến hành xóa]
        F --> G{Kết quả}
        G -- Thành công --> H[Thông báo:\nTài khoản đã được xóa]
        H --> I[Chuyển về Trang chủ]
        G -- Lỗi --> J[Thông báo lỗi\ncụ thể]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        F --> K[Đăng nhập lại\nbằng mật khẩu vừa nhập\nđể xác thực]
        K --> |Sai mật khẩu| L[Thông báo:\nMật khẩu xác nhận không đúng]
        K --> |Đúng| M[Gọi hàm xóa\ntoàn bộ dữ liệu\ntrên cơ sở dữ liệu]
        M --> N[Xóa: Hồ sơ · Tin đăng · Bình luận\nDanh sách yêu thích · Tài khoản]
        N --> O[Đăng xuất ngay lập tức]
        O --> H
    end
```

---

## 8. Đăng xuất

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Đăng xuất\nphía dưới sidebar]) --> B[Hộp thoại xác nhận]
        B --> |Hủy| C[Không làm gì]
        B --> |Đăng xuất| D[Hệ thống đăng xuất\nkhỏi dịch vụ xác thực]
        D --> E[Ứng dụng nhận tín hiệu\ntự động xóa thông tin người dùng]
        E --> F[Chuyển về Trang chủ]
        F --> G[Thanh điều hướng\nhiển thị nút Đăng nhập]
    end
```
