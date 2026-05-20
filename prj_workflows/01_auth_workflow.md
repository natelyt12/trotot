# 🔐 Workflow: Xác thực người dùng (Auth)

Tài liệu mô tả luồng **Đăng ký**, **Đăng nhập** và **Quên mật khẩu** trong hệ thống TroTot.

---

## 1. Luồng Đăng nhập

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bắt đầu]) --> B[Truy cập trang /login]
        B --> C[Nhập Email & Mật khẩu]
        C --> D{Bấm Đăng nhập}
        D --> E{Quên mật khẩu?}
        E -- Có --> F[Bấm 'Quên mật khẩu?']
        E -- Không --> G[Gửi form]
        G --> |Thành công| H[Chuyển về trang chủ]
        G --> |Thất bại| I[Hiển thị lỗi inline]
        I --> C
        F --> J[Xem Luồng Quên Mật Khẩu]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        G --> K[supabase.auth.signInWithPassword]
        K --> |Email chưa xác thực| L[Lỗi: Vui lòng xác thực tài khoản]
        K --> |Sai credentials| M[Lỗi: Email hoặc mật khẩu không chính xác]
        K --> |Thành công| N[Trả về session + user]
        N --> O[onAuthStateChange cập nhật state]
        O --> H
        L --> I
        M --> I
    end
```

**Chi tiết xử lý lỗi:**

| Lỗi từ Supabase | Thông báo hiển thị |
|---|---|
| `Invalid login credentials` | Email hoặc mật khẩu không chính xác. |
| `Email not confirmed` | Vui lòng xác thực tài khoản trước khi đăng nhập. |
| Lỗi khác | Hiển thị trực tiếp message từ Supabase |

---

## 2. Luồng Đăng ký

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bắt đầu]) --> B[Truy cập trang /register]
        B --> C{Chọn vai trò}
        C -- Mặc định Người thuê --> D[Điền form: Tên, Email, SĐT, Mật khẩu]
        C -- Môi giới/Bên cho thuê --> E[Bật role selector\nChọn Agent hoặc Landlord]
        E --> D
        D --> F[Tick đồng ý Điều khoản]
        F --> G{Bấm Tạo tài khoản}

        G -- Role = tenant --> H[Gửi thẳng lên server]
        G -- Role = agent/landlord --> I[Chuyển sang Bước 2:\nXác minh danh tính KYC]
        I --> J[Xem thông tin KYC\nBấm Xác nhận]
        J --> H

        H --> |Thành công| K[Modal: Đăng ký thành công!]
        H --> |Lỗi| L[Hiển thị lỗi tương ứng]
        K --> M[Chuyển về trang chủ]
        L --> D
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        H --> N[Kiểm tra Tên đã tồn tại\ntrong profiles table]
        N --> |Đã tồn tại| O[Modal: Tên người dùng đã tồn tại]
        N --> |Chưa có| P[Kiểm tra SĐT đã tồn tại\ntrong profiles table]
        P --> |Đã tồn tại| Q[Modal: Số điện thoại đã tồn tại]
        P --> |Chưa có| R[supabase.auth.signUp\nvới metadata: name, phone, role]
        R --> |Email đã đăng ký| S[Modal: Email đã tồn tại\nGợi ý Đăng nhập]
        R --> |Thành công| T[Supabase tự tạo profile\nqua trigger]
        T --> K
        O --> D
        Q --> D
        S --> D
    end
```

**Validation phía client:**

| Trường | Quy tắc |
|--------|---------|
| Tên người dùng | Tối đa 30 ký tự, chỉ chữ cái (tiếng Việt), số, khoảng trắng |
| Email | Phải chứa `@` |
| Mật khẩu | Tối thiểu 6 ký tự, ≥1 chữ hoa, ≥1 chữ số |
| Xác nhận mật khẩu | Phải trùng với mật khẩu |
| Số điện thoại | 10 số, bắt đầu bằng `0` |
| Điều khoản | Bắt buộc tick |

---

## 3. Luồng Quên mật khẩu

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A[Bấm 'Quên mật khẩu?' trên trang Login] --> B[ForgotPasswordForm hiển thị]
        B --> C[Nhập địa chỉ email]
        C --> D[Bấm Gửi link đặt lại]
        D --> |Thành công| E[Thông báo: Kiểm tra hộp thư]
        D --> |Lỗi| F[Hiển thị thông báo lỗi]
        E --> G[Mở email, bấm link reset]
        G --> H[Supabase redirect đến trang đặt lại mật khẩu]
        H --> I[Nhập mật khẩu mới]
        I --> J[Xác nhận – đăng nhập lại]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        D --> K[supabase.auth.resetPasswordForEmail]
        K --> |Không tìm thấy email| L[Supabase vẫn trả success\nvì lý do bảo mật]
        K --> |Email hợp lệ| M[Gửi email reset link]
        L --> E
        M --> E
    end
```

> **Lưu ý bảo mật:** Supabase không phân biệt email tồn tại hay không khi reset password (để tránh email enumeration attack).

---

## 4. Luồng Auth Session (Global)

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống – App.jsx"]
        A([App khởi động]) --> B[supabase.auth.getSession]
        B --> |Có session| C[setUser với user hiện tại]
        B --> |Không có session| D[setUser = null]
        C --> E[setAuthLoaded = true]
        D --> E

        F[supabase.auth.onAuthStateChange] --> |Đăng nhập| G[setUser = user mới]
        F --> |Đăng xuất| H[setUser = null]

        G --> I{currentPage = profile/dashboard?}
        H --> I
        I -- user = null --> J[navigate to /login]
        I -- user có giá trị --> K[Giữ nguyên trang hiện tại]
    end
```

**Protected routes:** `/profile` và `/dashboard` — chuyển hướng về `/login` nếu chưa đăng nhập.
