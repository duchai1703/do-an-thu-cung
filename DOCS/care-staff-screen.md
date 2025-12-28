# Care Staff Dashboard - Screen Design

## Tổng quan

Dashboard cho nhân viên chăm sóc (Care Staff) hiển thị công việc hôm nay, lịch làm việc, và quản lý chuồng nuôi.

---

## Backend APIs được hỗ trợ cho CARE_STAFF

### 1. Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/auth/me` | Lấy thông tin user + employeeId |

### 2. Appointments (Công việc)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/appointments` | Danh sách tất cả appointments (có filter) |
| GET | `/api/appointments/:id` | Chi tiết appointment |
| GET | `/api/appointments/by-employee/:employeeId` | Appointments của employee |
| PUT | `/api/appointments/:id/start` | Bắt đầu task (CONFIRMED → IN_PROGRESS) |
| PUT | `/api/appointments/:id/complete` | Hoàn thành task (IN_PROGRESS → COMPLETED) |

### 3. Schedules (Lịch làm việc)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/schedules/:id` | Chi tiết schedule |
| GET | `/api/schedules/employee/:employeeId` | Lịch làm việc của employee |
| PUT | `/api/schedules/:id/available` | Đánh dấu schedule available |
| PUT | `/api/schedules/:id/unavailable` | Đánh dấu schedule unavailable |

### 4. Employees
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/employees/:id` | Chi tiết employee |

### 5. Cages (Chuồng nuôi)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cages` | Danh sách chuồng |
| GET | `/api/cages/:id` | Chi tiết chuồng |
| GET | `/api/cages/available` | Chuồng trống |
| GET | `/api/cages/status-summary` | Thống kê trạng thái chuồng |
| GET | `/api/cages/occupancy-history/:cageId` | Lịch sử sử dụng chuồng |
| GET | `/api/cages/occupants-by-period` | Occupants theo thời gian |
| PUT | `/api/cages/:id/status` | Cập nhật trạng thái chuồng |
| PUT | `/api/cages/:id/clean` | Đánh dấu đã dọn dẹp |

---

## 1. Trang Tổng quan (`/dashboard/care-staff`)

### 1.1 Header
- **Tiêu đề:** "Công việc hôm nay"
- **Phụ đề:** "Quản lý và thực hiện các dịch vụ chăm sóc"
- **Hiển thị trạng thái:** Badge "Đang rảnh" hoặc "Đang bận" (read-only - chỉ Manager toggle được employee status)
- **Ngày giờ hiện tại**

### 1.2 Thống kê (4 cards)
| Card | API |
|------|-----|
| Tổng công việc | `GET /appointments?employeeId=X&date=today` |
| Đã xong | Filter COMPLETED |
| Đang thực hiện | Filter IN_PROGRESS |
| Lịch sắp tới | Filter PENDING/CONFIRMED |

### 1.3 Lịch làm việc hôm nay
- **Ca làm việc:** startTime - endTime
- **Giờ nghỉ:** breakStart - breakEnd
- **API:** `GET /schedules/employee/:employeeId?startDate=X&endDate=X`
- **Toggle Schedule:** CARE_STAFF CÓ THỂ toggle availability của schedule (PUT :id/available|unavailable)

### 1.4 Thao tác nhanh (2 buttons)
| Button | Điều hướng |
|--------|-----------|
| Xem lịch làm việc | `/dashboard/care-staff/schedule` |
| Công việc hôm nay | `/dashboard/care-staff/today` |

### 1.5 Danh sách công việc
Mỗi task card:
- **Thời gian:** startTime
- **Tên thú cưng:** pet.name
- **Chủ nuôi:** pet.owner.fullName
- **Dịch vụ:** service.serviceName
- **Actions:**
  - PENDING → nút "Bắt đầu" (PUT /appointments/:id/start)
  - IN_PROGRESS → nút "Hoàn thành" (PUT /appointments/:id/complete)
  - COMPLETED → Badge "Đã xong"

---

## 2. Trang Lịch làm việc (`/dashboard/care-staff/schedule`)

### 2.1 Header
- **Tiêu đề:** "Lịch làm việc của tôi"
- **Phụ đề:** "Xem và quản lý ca làm việc trong tuần"

### 2.2 Thống kê (4 cards)
| Card | Mô tả | API |
|------|-------|-----|
| Tổng ca | Số schedules trong tuần | `GET /schedules/employee/:id` |
| Sẵn sàng | Số schedules có isAvailable=true | Filter từ data |
| Không rảnh | Số schedules có isAvailable=false | Filter từ data |
| Giờ làm | Tổng giờ làm việc tuần này | Tính toán từ startTime/endTime |

### 2.3 Week Navigator
- Nút **Tuần trước** / **Tuần sau**
- Hiển thị range ngày (dd/mm - dd/mm)
- Nút "Về tuần hiện tại" khi không ở tuần hiện tại

### 2.4 Danh sách Schedule
Mỗi schedule card hiển thị:
- **Ngày:** Thứ, ngày/tháng (highlight nếu là hôm nay)
- **Ca làm:** startTime - endTime
- **Giờ nghỉ:** breakStart - breakEnd (nếu có)
- **Nút toggle availability:** 
  - "✅ Sẵn sàng" (xanh) → có thể làm việc
  - "🚫 Không rảnh" (xám) → không thể làm việc

### 2.5 Actions
| Action | API | Mô tả |
|--------|-----|-------|
| Toggle sẵn sàng | `PUT /schedules/:id/available` | Đánh dấu có thể làm việc |
| Toggle không rảnh | `PUT /schedules/:id/unavailable` | Đánh dấu không thể làm việc |

---

## 3. Trang Công việc hôm nay (`/dashboard/care-staff/today`)

### 3.1 Header
- **Tiêu đề:** "Công việc hôm nay"
- **Phụ đề:** Ngày hiện tại (Thứ X, dd/mm/yyyy)

### 3.2 Thống kê (4 cards gradient)
| Card | Màu | Emoji | Mô tả |
|------|-----|-------|-------|
| Tổng công việc | Xanh dương → Cyan | 📋 | Tổng số appointments hôm nay |
| Chưa làm | Cam → Vàng | ⏰ | Status PENDING |
| Đang làm | Tím → Hồng | 🔄 | Status IN_PROGRESS |
| Hoàn thành | Xanh lá → Emerald | ✅ | Status COMPLETED |

### 3.3 Filter Tabs
4 tabs để filter tasks:
- **Tất cả** (hiển thị count)
- **Chưa làm** (hiển thị count)
- **Đang làm** (hiển thị count)  
- **Hoàn thành** (hiển thị count)

Active tab có gradient background tương ứng màu stats card.

### 3.4 Danh sách Tasks
Mỗi task card:
- **Background color** theo status:
  - Pending: Amber background
  - In Progress: Purple background
  - Completed: Green background
- **Thời gian:** Hiển thị trong box màu với emoji 🕐
- **Thông tin:**
  - Tên task (title)
  - 🐾 Tên pet (petType)
  - 👤 Tên chủ (ownerName)
  - 💼 Dịch vụ (service)
  - 📞 Số điện thoại (nếu có)
- **Actions:**
  - **Pending** → Nút "▶️ Bắt đầu"
  - **In Progress** → Nút "✅ Hoàn thành"
  - **Completed** → Badge "✅ Hoàn thành"

### 3.5 API Calls
| Call | Endpoint | Khi nào |
|------|----------|---------|
| Load data | `GET /auth/me` | Lấy employeeId |
| Load tasks | `GET /appointments?employeeId=X&date=today` via `getTodayTasks()` | Initial load |
| Start task | `PUT /appointments/:id/start` | Click "Bắt đầu" |
| Complete task | `PUT /appointments/:id/complete` | Click "Hoàn thành" |

---

## 4. Quản lý Chuồng nuôi (`/dashboard/care-staff/cages`)

### 4.1 Header
- **Gradient:** Orange → Red → Pink
- **Tiêu đề:** "Quản lý Chuồng nuôi"
- **Phụ đề:** "Theo dõi và quản lý tình trạng chuồng thú cưng"

### 4.2 Thống kê (4 cards)
| Card | Màu | Emoji | Mô tả |
|------|-----|-------|-------|
| Tổng chuồng | Blue → Cyan | 🏠 | Tổng số chuồng |
| Trống | Green → Emerald | ✅ | Status AVAILABLE |
| Đang dùng | Purple → Pink | 🐾 | Status OCCUPIED |
| Bảo trì | Amber → Orange | 🔧 | Status MAINTENANCE |

### 4.3 Filter Tabs
4 tabs: Tất cả / Trống / Đang dùng / Bảo trì

### 4.4 Cage Grid
Hiển thị grid cards (3 columns), mỗi card:
- **Status badge** (góc phải trên)
- **Icon size:** 🐱 (nhỏ), 🐶 (vừa), 🐕 (lớn)
- **Tên chuồng:** cageName
- **Kích thước:** cageSize (SMALL/MEDIUM/LARGE)
- **Vị trí:** location
- **Ghi chú:** notes (nếu có)
- **Actions:**
  - AVAILABLE → Nút "🔧 Bảo trì"
  - MAINTENANCE → Nút "✅ Hoàn thành"
  - OCCUPIED → Badge "🐾 Đang có pet"

### 4.5 API Endpoints  CARE_STAFF có quyền
| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/cages` | GET | Danh sách tất cả chuồng |
| `/cages/available` | GET | Danh sách chuồng trống |
| `/cages/:id` | GET | Chi tiết chuồng |
| `/cages/:id/maintenance` | PUT | Bắt đầu bảo trì |
| `/cages/:id/complete-maintenance` | PUT | Hoàn thành bảo trì |
| `/cages/:id/assign` | POST | Check-in pet vào chuồng |
| `/cages/assignments/:id/checkout` | PUT | Check-out pet |
| `/cages/:id/assignments` | GET | Lịch sử sử dụng chuồng |
| `/cages/assignments/active` | GET | Tất cả assignments đang active |

---

## Features KHÔNG được hỗ trợ

| Feature | Lý do |
|---------|-------|
| Toggle employee status | Chỉ Manager có quyền (PUT /employees/:id/available) |
| Tạo/sửa/xóa schedule | Chỉ Manager có quyền |
| Thêm ghi chú công việc riêng | Không có endpoint |
| Tạo/sửa/xóa appointment | Không có quyền |

---

## Response Data Structure

### Appointment Object
```json
{
  "appointmentId": 1,
  "petId": 1,
  "employeeId": 4,
  "serviceId": 1,
  "status": "PENDING",
  "appointmentDate": "2025-12-28",
  "startTime": "10:00:00",
  "endTime": "11:00:00",
  "pet": {
    "name": "Bông",
    "species": "Dog",
    "owner": {
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0901234567"
    }
  },
  "service": {
    "serviceName": "Tắm spa cho chó"
  }
}
```

### Schedule Object
```json
{
  "scheduleId": 1,
  "employeeId": 4,
  "workDate": "2025-12-28",
  "startTime": "07:00:00",
  "endTime": "17:00:00",
  "breakStart": "12:00:00",
  "breakEnd": "13:00:00",
  "isAvailable": true
}
```

### Cage Object
```json
{
  "cageId": 1,
  "cageName": "A-01",
  "cageType": "SMALL",
  "status": "AVAILABLE",
  "location": "Khu A",
  "notes": ""
}
```