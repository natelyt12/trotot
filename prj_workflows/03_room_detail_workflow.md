# 🏡 Workflow: Xem chi tiết phòng

Tài liệu mô tả luồng **xem thông tin phòng**, **yêu thích**, **liên hệ chủ nhà**, **bình luận** và **đếm lượt xem**.

---

## 1. Luồng mở trang chi tiết phòng

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm vào phòng\ntrên trang chủ]) --> B{Cách điều hướng}
        B -- Từ RoomCard --> C[navigate room-detail\nvới room data]
        B -- Nhập URL trực tiếp\nvd: /phong-tro-quan-1 --> D[App handleLocationChange]
    end

    subgraph SYSTEM["⚙️ Hệ thống – App.jsx"]
        C --> E{room.status = draft?}
        D --> F[Fetch room theo slug\ntừ Supabase]
        F --> G{Tìm thấy?}
        G -- Không --> H[Chuyển về trang chủ]
        G -- Có, status = draft --> I[Modal cảnh báo:\nPhòng không tồn tại]
        G -- Có, status = available --> J[mapSupabaseRoom\nchuyển đổi data]
        E -- Có --> I
        E -- Không --> K[Render RoomDetailPage\nlàm overlay modal\nz-index: 50]
        J --> K
        K --> L[URL cập nhật: window.history.pushState]
        L --> M[ScrollLock kích hoạt\nngăn cuộn nền]
    end
```

---

## 2. Luồng đếm lượt xem

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống – RoomDetailPage"]
        A([RoomDetailPage mount]) --> B{previewMode = true?}
        B -- Có --> C[Bỏ qua, không đếm]
        B -- Không --> D{Đã đếm room.id này\ntrong session?}
        D -- Có --> C
        D -- Không --> E[Gọi supabase.rpc\nincrement_room_views]
        E --> F{RPC thành công?}
        F -- Có --> G[setViews + 1 local]
        F -- Lỗi RPC --> H[Fallback: supabase.update\ntotal_views trực tiếp]
        H --> I{Update thành công?}
        I -- Có --> J[setViews = data.total_views]
        I -- Lỗi RLS --> K[Silent fail\nkhông hiển thị lỗi]
    end
```

> **Lưu ý:** `lastIncrementedRoomId` ref ngăn double-count khi component re-render.

---

## 3. Luồng Gallery ảnh / video

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Vào trang chi tiết]) --> B[Media items được build:\nvideos trước, ảnh sau]
        B --> C[Hiển thị media đầu tiên\nở ô lớn]
        C --> D{Loại media}
        D -- video YouTube/TikTok --> E[Render iframe embed]
        D -- video khác --> F[Render thẻ video HTML5]
        D -- ảnh --> G[Render img tag]

        C --> H[Thumbnails bar\nphía dưới]
        H --> I[Bấm thumbnail]
        I --> J[activeImage thay đổi\nHiển thị media mới]

        C --> K[Mũi tên Prev/Next\nkhi có > 1 media]
        K --> L[Chuyển prev/next\nvới vòng lặp tròn]
    end
```

---

## 4. Luồng Yêu thích (Save/Unsave)

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Lưu tin\ntrên trang chi tiết]) --> B{Đã đăng nhập?}
        B -- Chưa --> C[Modal: Vui lòng đăng nhập\nnút Đăng nhập ngay]
        C --> D[navigate login]
        B -- Rồi --> E{Đã lưu phòng này?}
        E -- Chưa --> F[toggleFavorite thêm vào]
        E -- Rồi --> G[toggleFavorite bỏ khỏi]
        F --> H[Button: Đã lưu tin\nIcon tim đỏ + animate-pulse]
        G --> I[Button: Lưu tin\nIcon tim trống]
    end

    subgraph SYSTEM["⚙️ Hệ thống – FavoritesContext"]
        F --> J[Upsert vào bảng favorites\nSupabase]
        G --> K[Delete khỏi bảng favorites\nSupabase]
        J & K --> L[setFavorites cập nhật\nglobal state]
    end
```

---

## 5. Luồng Liên hệ chủ nhà

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Xem trang chi tiết phòng]) --> B[Sidebar liên hệ bên phải]
        B --> C{Bấm Liên hệ ngay\nhoặc Nhắn tin Zalo}
        C --> D{Đã đăng nhập?}
        D -- Chưa --> E[Modal: Yêu cầu đăng nhập\nnút Đăng nhập]
        D -- Rồi --> F[showPhone = true]
        F --> G[Hiển thị số điện thoại\nđịnh dạng: 09xx xxx xxx]
        E --> H[navigate login]
    end

    subgraph NOTE["📌 Lưu ý"]
        I[Zalo: Mở Zalo với số điện thoại\nchủ phòng - hiện tại dùng chung\ncùng nút điện thoại]
        J[Lý do yêu cầu đăng nhập:\nHạn chế spam, bảo vệ\nthông tin chủ nhà]
    end
```

---

## 6. Luồng Bình luận

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Cuộn xuống phần bình luận]) --> B[CommentSection hiển thị]
        B --> C[Xem danh sách bình luận\ncủa phòng]
        C --> D{Muốn bình luận?}
        D -- Chưa đăng nhập --> E[Hiển thị nút\nĐăng nhập để bình luận]
        E --> F[navigate login]
        D -- Đã đăng nhập --> G[Ô nhập bình luận\nhiển thị]
        G --> H[Nhập nội dung]
        H --> I[Bấm Gửi]
        I --> J{Bình luận của mình?}
        J -- Có --> K[Nút Xóa hiển thị\nbên cạnh comment]
        K --> L[Bấm Xóa\nXác nhận → Xóa]
    end

    subgraph SYSTEM["⚙️ Hệ thống – CommentSection.jsx"]
        I --> M[Insert vào bảng comments\n{room_id, user_id, content}]
        M --> N[Refetch comments\ntheo room_id]
        N --> O[Re-render danh sách\nbình luận mới nhất]
        L --> P[Delete comment\ntheo id]
        P --> N
    end
```

---

## 7. Luồng đóng modal Room Detail

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Bấm nút Quay lại]) --> B{Đến từ đâu?}
        B -- fromProfile = true --> C[Quay lại Profile page]
        B -- Từ trang chủ --> D[Quay lại Home page]
        B -- Nhấn Back browser --> E[popstate event]
        E --> F[handleLocationChange\nparse URL mới]
    end

    subgraph SYSTEM["⚙️ Hệ thống – App.jsx"]
        A --> G[isClosing = true]
        G --> H[animate-modal-out\nCSS animation 250ms]
        H --> I[setTimeout 250ms]
        I --> J[setCurrentPage\ntargetPage]
        J --> K[ScrollLock tắt\ncuộn trang bình thường]
        K --> L[URL cập nhật:\n/ hoặc /profile]
    end
```

---

## 8. Thông tin hiển thị trên trang chi tiết

| Section | Nội dung |
|---------|---------|
| **Gallery** | Ảnh + Video (YouTube/TikTok embed) |
| **Thông tin chính** | Tiêu đề, địa chỉ đầy đủ, lượt xem, ngày cập nhật |
| **Gần trường ĐH** | Badge các trường ĐH cùng quận/phường |
| **Thống kê** | Giá thuê, diện tích, tối đa người, loại vệ sinh |
| **Mô tả** | Mô tả chi tiết từ chủ phòng |
| **Chi phí** | Cọc, điện, nước, internet, gửi xe, dịch vụ thêm |
| **Nội quy** | Giờ giấc, thú cưng, giặt đồ, chung chủ |
| **Tiện nghi** | Grid các tiện nghi (sáng/tối theo có/không) |
| **Bản đồ** | Placeholder (đang phát triển) |
| **Bình luận** | CommentSection với phân trang |
| **Sidebar liên hệ** | Giá, mã tin, thông tin người đăng, nút Gọi/Zalo |
