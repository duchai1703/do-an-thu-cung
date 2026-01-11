# Receptionist UI Field Coverage Audit

> So sánh các fields từ API với những gì đã được hiển thị trên UI của Receptionist Dashboard

**Ngày audit**: 2026-01-11

---

## 📊 Tổng quan

| Module | API Fields | UI Displayed | Coverage |
|--------|-----------|--------------|----------|
| Appointments | 15 | 10 | ⚠️ 67% |
| Customers | 12 | 9 | ⚠️ 75% |
| Payments | 11 | 8 | ⚠️ 73% |
| Slips | 12 | 9 | ⚠️ 75% |
| Reminders | 10 | 8 | ⚠️ 80% |

---

## 1. Appointments Page (`/appointments`)

### ✅ Đã hiển thị trên UI

| Field | Location | Ghi chú |
|-------|----------|---------|
| `appointmentId` | Table - Mã lịch | Format: formatAppointmentId() |
| `appointmentDate` | Table - Ngày & Giờ | ✅ |
| `startTime` | Table - Ngày & Giờ | ✅ |
| `status` | Table - Trạng thái | Badge với icon |
| `pet.name` | Table - Thú cưng | ✅ |
| `pet.species` | Table - Icon | DOG/CAT icon |
| `pet.owner.fullName` | Table - Khách hàng | ✅ |
| `pet.owner.phoneNumber` | Table - Khách hàng | ✅ |
| `service.serviceName` | Table - Dịch vụ | ✅ |
| `service.serviceCategory.categoryName` | Table - Icon dịch vụ | Map to emoji |

### ❌ Chưa hiển thị

| Field | Gợi ý vị trí | Priority |
|-------|--------------|----------|
| `endTime` | Table hoặc Modal chi tiết | 🟡 Medium |
| `notes` | Modal chi tiết / Tooltip | 🟡 Medium |
| `estimatedCost` | Table hoặc Modal | 🔴 High |
| `actualCost` | Table (khi completed) | 🔴 High |
| `employee.fullName` | Table - Nhân viên phụ trách | 🔴 High |
| `pet.breed` | Modal chi tiết | 🟢 Low |
| `pet.owner.account.email` | Modal chi tiết | 🟡 Medium |

### 🛠️ Chức năng còn thiếu

- [ ] **Tạo lịch hẹn mới** - Không có form/button tạo appointment
- [ ] **Xem chi tiết** - Không có modal xem toàn bộ thông tin
- [ ] **Filter theo ngày** - Chỉ có filter theo status
- [ ] **Filter theo nhân viên** - Không có

---

## 2. Customers Page (`/customers`)

### ✅ Đã hiển thị trên UI

| Field | Location | Ghi chú |
|-------|----------|---------|
| `petOwnerId` | Modal - Mã KH | formatCustomerId() |
| `fullName` | Table & Modal | ✅ |
| `phoneNumber` | Table & Modal | ✅ |
| `account.email` | Modal | ✅ |
| `address` | Modal | ✅ |
| `pets` | Table & Modal | Hiển thị danh sách |
| `totalVisits` | Table & Modal | Từ customer-statistics |
| `totalSpent` | Table & Modal | Từ customer-statistics |
| `account.isActive` | Table - Status badge | ✅ |

### ❌ Chưa hiển thị

| Field | Gợi ý vị trí | Priority |
|-------|--------------|----------|
| `preferredContactMethod` | Modal chi tiết | 🟡 Medium |
| `emergencyContact` | Modal chi tiết | 🟡 Medium |
| `registrationDate` | Modal - Ngày đăng ký | 🟢 Low |
| `lastVisit` | Table | 🔴 High |
| `pets[].breed` | Modal - Chi tiết pet | 🟢 Low |

### 🛠️ Chức năng còn thiếu

- [ ] **Xem lịch hẹn của khách** - Link đến appointments filtered
- [ ] **Xem hóa đơn của khách** - Link đến invoices filtered
- [ ] **Tạo lịch hẹn cho khách** - Quick action

---

## 3. Payments Page (`/payments`)

### ✅ Đã hiển thị trên UI

| Field | Location | Ghi chú |
|-------|----------|---------|
| `invoiceId` | Table - Mã HĐ | ✅ |
| `totalAmount` | Table - Số tiền | formatCurrency() |
| `status` | Table - Trạng thái | ✅ |
| `issueDate` | Table - Ngày | ✅ |
| `createdAt` | Table - Giờ | ✅ |
| `petOwner.fullName` | Table - Khách hàng | ✅ |
| `petOwner.phone` | Table - Khách hàng | ✅ |
| `appointment.service.serviceName` | Table - Dịch vụ | ✅ |

### ❌ Chưa hiển thị

| Field | Gợi ý vị trí | Priority |
|-------|--------------|----------|
| `invoiceNumber` | Table - Code chính thức | 🔴 High |
| `dueDate` | Table - Hạn thanh toán | 🔴 High |
| `paidDate` | Table (khi paid) | 🟡 Medium |
| `notes` | Modal thanh toán | 🟢 Low |
| `payments[].transactionId` | Receipt/Modal | 🟡 Medium |
| `payments[].paymentDate` | Modal xác nhận | 🟡 Medium |

### 🛠️ Chức năng còn thiếu

- [ ] **Tạo hóa đơn mới** - POST /api/invoices/generate
- [ ] **In biên nhận** - GET /payments/:id/receipt
- [ ] **Filter theo ngày** - startDate/endDate query
- [ ] **Thanh toán VNPay** - POST /payments/online/initiate

---

## 4. Reminders Page (`/reminders`)

### ✅ Đã hiển thị trên UI

| Field | Location | Ghi chú |
|-------|----------|---------|
| `appointmentId` | Table - Mã | ✅ |
| `appointmentDate` | Table - Ngày hẹn | ✅ |
| `startTime` | Table - Giờ | ✅ |
| `status` | Table - Trạng thái | PENDING/CONFIRMED |
| `pet.name` | Table - Thú cưng | ✅ |
| `pet.owner.fullName` | Table - Khách hàng | ✅ |
| `pet.owner.phoneNumber` | Table - SĐT | ✅ |
| `service.serviceName` | Table - Dịch vụ | ✅ |

### ❌ Chưa hiển thị

| Field | Gợi ý vị trí | Priority |
|-------|--------------|----------|
| `pet.owner.account.email` | Table - Email nhận | 🔴 High |
| `notes` | Tooltip/Modal | 🟢 Low |

### 🛠️ Chức năng còn thiếu

- [ ] **Xem lịch sử nhắc** - Thời gian đã gửi lần cuối
- [ ] **Chọn kênh nhắc** - Email/SMS/Cả hai

---

## 5. Slips Page (`/slips`)

### ✅ Đã hiển thị trên UI

| Field | Location | Ghi chú |
|-------|----------|---------|
| `appointmentId` | Table - Mã phiếu | Badge gradient |
| `appointmentDate` | Table - Ngày hẹn | Full weekday |
| `startTime` | Table - Giờ | ✅ |
| `pet.name` | Table - Dịch vụ row | ✅ |
| `pet.owner.fullName` | Table - Khách hàng | With Avatar |
| `pet.owner.phoneNumber` | Table - SĐT | ✅ |
| `pet.owner.account.email` | Table - Email | ✅ |
| `service.serviceName` | Table - Dịch vụ | ✅ |
| `employee.fullName` | Table - Nhân viên | Badge |

### ❌ Chưa hiển thị

| Field | Gợi ý vị trí | Priority |
|-------|--------------|----------|
| `endTime` | Table - Thời gian kết thúc | 🟡 Medium |
| `estimatedCost` | Phiếu in | 🔴 High |
| `notes` | Phiếu in | 🟡 Medium |

---

## 6. Main Dashboard (`/receptionist`)

### ✅ Đã hiển thị

- Số lịch pending/confirmed/cancelled (từ aggregated data)
- Số khách mới (từ pet-owners API)
- Quick actions links

### ❌ Chưa hiển thị

| Field | Gợi ý | Priority |
|-------|-------|----------|
| Danh sách lịch hẹn hôm nay | Top 5 appointments | 🔴 High |
| Hóa đơn chờ thanh toán | Quick summary | 🔴 High |
| Khách đến hôm nay | Timeline | 🟡 Medium |

---

## 📋 Recommendations (Ưu tiên cao)

### 🔴 Critical - Cần bổ sung ngay

1. **Appointments**:
   - Thêm column `employee.fullName` (Nhân viên phụ trách)
   - Thêm `estimatedCost` / `actualCost`
   - Thêm modal xem chi tiết với notes

2. **Payments**:
   - Hiển thị `invoiceNumber` thay vì `invoiceId`
   - Thêm column `dueDate` (Hạn thanh toán)

3. **Dashboard**:
   - Thêm mini list "Lịch hẹn sắp tới" top 5
   - Thêm "Hóa đơn cần thu" summary

### 🟡 Medium - Nên bổ sung

4. **Customers**:
   - Thêm `preferredContactMethod` và `emergencyContact` trong modal
   - Quick action "Đặt lịch cho khách này"

5. **Reminders**:
   - Hiển thị email của khách trong table

### 🟢 Low - Nice to have

6. Pet breed details
7. Registration date

---

## Checklist Tổng hợp

- [x] Appointments: Basic display ✅
- [ ] Appointments: Employee assigned display ❌
- [ ] Appointments: Create new appointment form ❌
- [ ] Appointments: Detail modal ❌
- [x] Customers: List with stats ✅
- [x] Customers: Detail modal ✅
- [ ] Customers: Contact preferences ❌
- [x] Payments: List display ✅
- [x] Payments: Confirm modal ✅
- [ ] Payments: Invoice number ❌
- [ ] Payments: Due date display ❌
- [ ] Payments: Create invoice ❌
- [x] Reminders: Basic display ✅
- [x] Slips: Full display ✅
- [ ] Dashboard: Today's appointments list ❌
- [ ] Dashboard: Pending invoices summary ❌

---

> **Kết luận**: UI hiện tại đã cover **~70%** các fields chính từ API. Còn thiếu một số thông tin quan trọng như `employee`, `estimatedCost`, `invoiceNumber`, và các chức năng như tạo lịch hẹn mới, tạo hóa đơn.
