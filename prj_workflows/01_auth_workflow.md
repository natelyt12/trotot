# 🔐 Đăng ký · Đăng nhập · Quên mật khẩu

Tài liệu mô tả cách người dùng tạo tài khoản, đăng nhập và lấy lại mật khẩu trong TroTot.

---

## 1. Đăng nhập

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bắt đầu]) --> B[Vào trang Đăng nhập]
        B --> C[Nhập Email và Mật khẩu]
        C --> D{Bấm Đăng nhập}
        D --> E{Quên mật khẩu?}
        E -- Có --> F[Bấm nút\nQuên mật khẩu?]
        E -- Không --> G[Gửi thông tin\nlên hệ thống]
        G --> |Thành công| H[Chuyển về Trang chủ]
        G --> |Thất bại| I[Hiện thông báo lỗi\nngay dưới ô nhập]
        I --> C
        F --> J[Xem Luồng Quên Mật Khẩu bên dưới]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        G --> K[Kiểm tra email và mật khẩu\nvới dịch vụ xác thực]
        K --> |Email chưa xác nhận| L[Lỗi: Vui lòng xác thực\ntài khoản qua email]
        K --> |Sai thông tin| M[Lỗi: Email hoặc mật khẩu\nkhông chính xác]
        K --> |Đúng| N[Cấp phiên đăng nhập\ncho người dùng]
        N --> O[Ứng dụng nhận tín hiệu\ntự động cập nhật trạng thái]
        O --> H
        L --> I
        M --> I
    end
```

**Các thông báo lỗi:**

| Tình huống              | Thông báo hiển thị                               |
| ----------------------- | ------------------------------------------------ |
| Sai email hoặc mật khẩu | Email hoặc mật khẩu không chính xác.             |
| Chưa xác nhận email     | Vui lòng xác thực tài khoản trước khi đăng nhập. |
| Lỗi khác                | Hiển thị mô tả lỗi cụ thể                        |

---

## 2. Đăng ký tài khoản

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bắt đầu]) --> B[Vào trang Đăng ký]
        B --> C{Loại tài khoản?}
        C -- Người thuê\nnặc định --> D[Điền form:\nTên · Email · SĐT · Mật khẩu]
        C -- Môi giới\nhoặc Bên cho thuê --> E[Bật lựa chọn vai trò\nChọn loại tài khoản]
        E --> D
        D --> F[Tick xác nhận\nĐiều khoản sử dụng]
        F --> G{Bấm Tạo tài khoản}

        G -- Người thuê --> H[Gửi thông tin lên hệ thống]
        G -- Môi giới hoặc\nBên cho thuê --> I[Chuyển sang Bước 2:\nxác thực danh tính]
        I --> J[Đọc thông tin KYC\nBấm Xác nhận]
        J --> H

        H --> |Thành công| K[Thông báo: Đăng ký thành công!]
        H --> |Lỗi| L[Thông báo lỗi\ncụ thể]
        K --> M[Chuyển về Trang chủ]
        L --> D
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        H --> N[Kiểm tra tên người dùng\nđã có ai dùng chưa]
        N --> |Đã tồn tại| O[Thông báo:\nTên người dùng đã tồn tại]
        N --> |Chưa có| P[Kiểm tra số điện thoại\nđã đăng ký chưa]
        P --> |Đã tồn tại| Q[Thông báo:\nSố điện thoại đã tồn tại]
        P --> |Chưa có| R[Tạo tài khoản mới\nlưu email, tên, SĐT, vai trò]
        R --> |Email đã đăng ký trước đó| S[Thông báo:\nEmail đã tồn tại — Gợi ý Đăng nhập]
        R --> |Thành công| T[Hệ thống tự tạo\nhồ sơ người dùng]
        T --> K
        O --> D
        Q --> D
        S --> D
    end
```

**Quy tắc nhập thông tin:**

| Trường            | Yêu cầu                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| Tên người dùng    | Tối đa 30 ký tự, chỉ dùng chữ cái (có dấu tiếng Việt), số và khoảng trắng |
| Email             | Phải có dấu `@` và đúng định dạng email                                   |
| Mật khẩu          | Tối thiểu 6 ký tự, có ít nhất 1 chữ hoa và 1 chữ số                       |
| Xác nhận mật khẩu | Phải giống hệt mật khẩu vừa nhập                                          |
| Số điện thoại     | 10 số, bắt đầu bằng số `0`                                                |
| Điều khoản        | Bắt buộc phải tick vào ô đồng ý                                           |

---

## 3. Quên mật khẩu

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A[Bấm nút Quên mật khẩu?\ntrên trang Đăng nhập] --> B[Form quên mật khẩu\nhiển thị]
        B --> C[Nhập địa chỉ email\nđã đăng ký]
        C --> D[Bấm Gửi link đặt lại]
        D --> |Thành công| E[Thông báo:\nKiểm tra hộp thư của bạn]
        D --> |Lỗi| F[Hiển thị thông báo lỗi]
        E --> G[Mở email\nBấm vào link đặt lại mật khẩu]
        G --> H[Trang đặt mật khẩu mới\ndo hệ thống cung cấp]
        H --> I[Nhập mật khẩu mới\nrồi xác nhận]
        I --> J[Đăng nhập lại với\nmật khẩu mới]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> K[Gửi yêu cầu reset\nđến dịch vụ xác thực]
        K --> |Dù email đúng hay không| L[Luôn báo gửi thành công\nđể bảo vệ thông tin người dùng]
        K --> |Email có tồn tại| M[Gửi email chứa\nlink đặt lại mật khẩu]
        L --> E
        M --> E
    end
```

> **Lưu ý bảo mật:** Hệ thống luôn hiển thị thông báo "Kiểm tra hộp thư" dù email có tồn tại hay không — để tránh kẻ xấu đoán được email nào đã đăng ký.

---

## 4. Phiên đăng nhập hoạt động toàn ứng dụng

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống — Chạy ngầm khi mở ứng dụng"]
        A([Ứng dụng khởi động]) --> B[Kiểm tra phiên đăng nhập\ncòn hiệu lực không]
        B --> |Còn phiên| C[Lấy thông tin người dùng\nđang đăng nhập]
        B --> |Hết phiên| D[Đặt trạng thái\nchưa đăng nhập]
        C --> E[Đánh dấu đã tải xong\nthông tin xác thực]
        D --> E

        F[Lắng nghe sự kiện:\nĐăng nhập hoặc Đăng xuất] --> |Vừa đăng nhập| G[Cập nhật thông tin\nngười dùng mới]
        F --> |Vừa đăng xuất| H[Xóa thông tin\nngười dùng]

        G --> I{Đang ở trang\nHồ sơ hoặc Dashboard?}
        H --> I
        I -- Chưa đăng nhập --> J[Tự động\nchuyển sang Đăng nhập]
        I -- Đã đăng nhập --> K[Giữ nguyên trang]
    end
```

**Các trang yêu cầu đăng nhập:** Hồ sơ cá nhân (`/profile`) và Quản lý tin đăng (`/dashboard`) — nếu chưa đăng nhập sẽ tự động chuyển về trang Đăng nhập.
