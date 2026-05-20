# 🔍 Workflow: Tìm kiếm & Lọc phòng (Home + Search)

Tài liệu mô tả luồng **tìm kiếm theo vị trí**, **lọc phòng theo tiêu chí** và **phân trang** trên trang chủ.

---

## 1. Luồng Tìm kiếm theo vị trí

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Vào trang chủ]) --> B[Thấy SearchTrigger\ntrên Hero section hoặc Header]
        B --> C[Bấm vào ô tìm kiếm]
        C --> D[LocationWizardModal mở ra]
        D --> E{Chọn phương thức}
        E -- Theo thành phố --> F[Chọn Tỉnh/Thành phố]
        E -- Theo trường ĐH --> G[Chọn Trường đại học]
        F --> H[Bấm Tìm kiếm]
        G --> H
        H --> I[LocationWizardModal đóng]
        I --> J[Danh sách phòng cập nhật\nScroll đến listing-section]
    end

    subgraph SYSTEM["⚙️ Hệ thống – useRoomFilter.js"]
        H --> K[updateFilter gọi với\ncity hoặc university]
        K --> L[useRoomFilter refetch\ntừ Supabase với filter mới]
        L --> M[Supabase query:\nrooms WHERE city = ?\nOR university = ?]
        M --> N[Trả về danh sách phòng\nphù hợp]
        N --> O[setFilteredRooms\ncập nhật UI]
        O --> J
    end
```

---

## 2. Luồng Lọc phòng nâng cao

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng – Desktop"]
        A([Xem danh sách phòng]) --> B[Sidebar RoomFilters\nbên phải màn hình]
        B --> C{Chọn tiêu chí lọc}
        C --> D[Lọc theo Giá thuê\nmin/max]
        C --> E[Lọc theo Diện tích\nmin/max]
        C --> F[Lọc theo Loại phòng\nSingle/Double/Studio/...]
        C --> G[Bật/tắt Tiện nghi\nWifi, AC, Tủ lạnh...]
        C --> H[Tìm theo từ khóa\nfulltext search]
        D & E & F & G & H --> I[Kết quả tự động cập nhật\nkhi thay đổi filter]
    end

    subgraph USER_MOBILE["📱 Người dùng – Mobile"]
        J([Bấm icon Filter\ntrên BottomNav]) --> K[MobileFilterModal mở\ndrawer từ dưới lên]
        K --> L[Chọn tiêu chí\ngiống Desktop]
        L --> M[Bấm Áp dụng]
        M --> N[MobileFilterModal đóng\nDanh sách cập nhật]
    end

    subgraph SYSTEM["⚙️ Hệ thống – useRoomFilter.js"]
        I --> O[Debounce 300ms\ntrước khi gọi API]
        O --> P[Supabase query với\ntất cả filter active]
        P --> Q[Trả về rooms\nkhớp tất cả điều kiện]
        Q --> R[setFilteredRooms\ncập nhật RoomGrid]
        M --> O
    end
```

**Danh sách filter hỗ trợ:**

| Filter | Kiểu | Mô tả |
|--------|------|--------|
| `city` | string | Tỉnh/Thành phố |
| `university` | string | Trường đại học gần đó |
| `search` | string | Tìm theo từ khóa (title, address) |
| `minPrice` / `maxPrice` | number | Khoảng giá (VNĐ/tháng) |
| `minArea` / `maxArea` | number | Khoảng diện tích (m²) |
| `roomType` | string | Loại phòng |
| `amenities` | string[] | Danh sách tiện nghi (toggle) |

---

## 3. Luồng Load thêm kết quả (Pagination)

```mermaid
flowchart TD
    subgraph USER["👤 Người dùng"]
        A([Cuộn xuống cuối danh sách]) --> B{Còn kết quả?}
        B -- Có --> C[Thấy nút 'Xem thêm kết quả']
        B -- Không --> D[Thông báo:\nĐã hiển thị tất cả kết quả]
        C --> E[Bấm nút Xem thêm]
        E --> F[Loading spinner hiển thị]
        F --> G[Thêm phòng mới vào danh sách]
    end

    subgraph SYSTEM["⚙️ Hệ thống"]
        E --> H[loadMore được gọi\ntừ useRoomFilter]
        H --> I[Supabase query với\nrange: offset += PAGE_SIZE]
        I --> J[Append rooms mới\nvào filteredRooms]
        J --> K{Còn data?}
        K -- Có --> L[setHasMore = true]
        K -- Không --> M[setHasMore = false]
        L --> G
        M --> D
    end
```

---

## 4. Luồng Hiển thị danh sách phòng

```mermaid
flowchart TD
    subgraph SYSTEM["⚙️ Hệ thống"]
        A([useRoomFilter mount]) --> B[Fetch initial rooms\ntừ Supabase]
        B --> C{Loading state}
        C -- loading = true --> D[RoomGrid hiển thị\nSkeleton loading cards]
        C -- loading = false, error --> E[Hiển thị thông báo lỗi\nnút Thử lại]
        C -- loading = false, data --> F[RoomGrid render\ndanh sách RoomCard]
    end

    subgraph USER["👤 Người dùng"]
        F --> G[Xem danh sách phòng\ndạng Grid]
        G --> H{Bấm vào phòng nào?}
        H -- Có --> I[navigate room-detail\nvới room data]
        H -- Không --> J[Tiếp tục scroll]
    end

    subgraph SYSTEM2["⚙️ Hệ thống – RoomDetailPage"]
        I --> K{room.status = draft?}
        K -- Có --> L[Modal cảnh báo:\nPhòng không tồn tại]
        K -- Không --> M[Hiển thị RoomDetailPage\ndạng overlay modal]
        M --> N[URL cập nhật sang /:slug]
        L --> G
    end
```

---

## 5. Cấu trúc component trang chủ

```
App.jsx
└── HomePage.jsx
    ├── Hero Section
    │   ├── SearchTrigger         ← Mở LocationWizardModal
    │   └── Stats bar (300+ phòng, N thành phố, ...)
    │
    └── Listing Section (#listing-section)
        ├── RoomFilters (Desktop sidebar)   ← useRoomFilter filters
        └── RoomGrid
            └── RoomCard × N               ← Click → navigate('room-detail')

App.jsx (global)
└── LocationWizardModal           ← isLocationModalOpen state
└── MobileFilterModal             ← showMobileFilter state
```
