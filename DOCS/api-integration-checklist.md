# API Integration Checklist

> Checklist chia việc test kết nối Frontend-Backend theo Route

**Password cho tất cả accounts:** `Password@123`

---

## Nhóm 1: Core Authentication & User Profile ⭐⭐⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký (Pet Owner) |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| GET | `/api/auth/account/:id/full-profile` | Lấy profile đầy đủ |

### Checklist
- [ ] **Login với Manager** (`manager@pawlovers.com`)
  - [ ] Form hiển thị đúng
  - [ ] Submit thành công, redirect đến `/dashboard/manager`
  - [ ] Token được lưu
  - [ ] Sidebar hiển thị đúng tên user
  
- [ ] **Login với Veterinarian** (`vet1@pawlovers.com`)
  - [ ] Redirect đến `/dashboard/vet`
  - [ ] Dashboard hiển thị đúng tên bác sĩ
  
- [ ] **Login với Care Staff** (`care1@pawlovers.com`)
  - [ ] Redirect đến `/dashboard/staff`
  
- [ ] **Login với Receptionist** (`reception@pawlovers.com`)
  - [ ] Redirect đến `/dashboard/receptionist`
  
- [ ] **Login với Pet Owner** (`owner1@gmail.com`)
  - [ ] Redirect đến `/dashboard/owner`
  - [ ] Dashboard hiển thị đúng thông tin owner

- [ ] **Register Pet Owner mới**
  - [ ] Form validation hoạt động
  - [ ] Tạo account thành công
  - [ ] Có thể login với account mới

- [ ] **Logout**
  - [ ] Xóa token
  - [ ] Redirect về login page

---

## Nhóm 2: Pet Management ⭐⭐⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/pets?ownerId=X` | Tạo pet mới |
| GET | `/api/pets/owner/:ownerId` | Lấy pets của owner |
| GET | `/api/pets/:id` | Lấy chi tiết 1 pet |
| PUT | `/api/pets/:id` | Cập nhật pet |
| DELETE | `/api/pets/:id` | Xóa pet |

### Checklist
- [ ] **Xem danh sách pets của owner** (`/dashboard/owner/pets`)
  - [ ] Hiển thị đúng pets của owner đang login
  - [ ] Không hiện pets của owner khác
  - [ ] Statistics card hiện đúng số lượng
  
- [ ] **Thêm pet mới**
  - [ ] Modal AddPetModal mở đúng
  - [ ] Form fields: name, species, breed, gender, birthDate, weight, color
  - [ ] Submit thành công, pet xuất hiện trong danh sách
  - [ ] Dropdown species hiển thị: Dog, Cat, Bird, Hamster, Rabbit, etc.
  
- [ ] **Xem chi tiết pet**
  - [ ] Hiển thị đầy đủ thông tin
  
- [ ] **Sửa thông tin pet**
  - [ ] Form pre-fill đúng data
  - [ ] Lưu thành công
  
- [ ] **Xóa pet**
  - [ ] Confirm dialog hiện
  - [ ] Xóa thành công, pet biến mất khỏi list

---

## Nhóm 3: Services & Categories ⭐⭐⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/services` | Lấy tất cả services |
| POST | `/api/services` | Tạo service mới (Manager) |
| PUT | `/api/services/:id` | Cập nhật service |
| DELETE | `/api/services/:id` | Xóa service |
| GET | `/api/service-categories` | Lấy categories |

### Checklist
- [ ] **Dropdown services trong BookAppointmentModal**
  - [ ] Load được danh sách từ API
  - [ ] Hiển thị đúng tên service
  
- [ ] **Trang quản lý services (Manager)** (`/dashboard/manager/services`)
  - [ ] Hiển thị danh sách services
  - [ ] Filter theo category hoạt động
  
- [ ] **Thêm service mới (Manager)**
  - [ ] Form hiển thị đúng
  - [ ] Chọn category từ dropdown
  - [ ] Tạo thành công
  
- [ ] **Sửa/Xóa service**
  - [ ] Edit form pre-fill đúng
  - [ ] Delete confirmation hoạt động

---

## Nhóm 4: Appointments ⭐⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/appointments` | Lấy tất cả (filtered by role) |
| POST | `/api/appointments` | Đặt lịch mới |
| GET | `/api/appointments/:id` | Chi tiết appointment |
| PUT | `/api/appointments/:id` | Cập nhật appointment |
| POST | `/api/appointments/:id/cancel` | Hủy lịch |
| POST | `/api/appointments/:id/confirm` | Xác nhận (Receptionist) |
| POST | `/api/appointments/:id/complete` | Hoàn thành (Vet/Staff) |

### Checklist
- [ ] **Đặt lịch mới (Owner)** (`/dashboard/owner/appointments`)
  - [ ] Modal BookAppointment mở
  - [ ] Dropdown pet load đúng pets của owner
  - [ ] Dropdown service load từ API
  - [ ] Chọn date/time
  - [ ] Submit thành công
  - [ ] Appointment xuất hiện trong danh sách
  
- [ ] **Xem danh sách appointments (Owner)**
  - [ ] Hiển thị appointments của owner
  - [ ] Filter theo status hoạt động
  - [ ] Badge status đúng màu
  
- [ ] **Hủy appointment (Owner)**
  - [ ] Nhập lý do hủy
  - [ ] Status chuyển thành CANCELLED
  
- [ ] **Xác nhận appointment (Receptionist)**
  - [ ] Button confirm hiển thị cho PENDING
  - [ ] Status chuyển thành CONFIRMED
  
- [ ] **Bắt đầu/Hoàn thành (Vet/Staff)**
  - [ ] Chuyển status IN_PROGRESS → COMPLETED
  
- [ ] **Xem lịch (Vet/Staff Dashboard)**
  - [ ] Hiển thị appointments của ngày hôm nay

---

## Nhóm 5: Employees ⭐⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/employees` | Lấy tất cả employees |
| POST | `/api/employees` | Tạo employee mới (Manager) |
| GET | `/api/employees/:id` | Chi tiết employee |
| PUT | `/api/employees/:id` | Cập nhật employee |
| GET | `/api/employees/veterinarians` | Lấy danh sách vets |
| GET | `/api/employees/care-staff` | Lấy danh sách care staff |

### Checklist
- [ ] **Trang quản lý nhân viên (Manager)** (`/dashboard/manager/staff`)
  - [ ] Hiển thị danh sách employees
  - [ ] Filter theo role hoạt động
  - [ ] Hiển thị đúng thông tin: tên, email, phone, role
  
- [ ] **Thêm nhân viên mới**
  - [ ] Form với các fields: fullName, email, password, phoneNumber, role, hireDate, salary
  - [ ] Tạo thành công
  - [ ] Nhân viên mới có thể đăng nhập
  
- [ ] **Sửa thông tin nhân viên**
  - [ ] Pre-fill form đúng
  - [ ] Lưu thành công
  
- [ ] **Dropdown vets trong BookAppointment**
  - [ ] Load danh sách veterinarians

---

## Nhóm 6: Cages & Boarding ⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/cages` | Lấy tất cả cages |
| POST | `/api/cages` | Tạo cage mới |
| PUT | `/api/cages/:id` | Cập nhật cage |
| GET | `/api/cage-assignments` | Lấy assignments |
| POST | `/api/cage-assignments` | Tạo assignment (check-in) |
| PUT | `/api/cage-assignments/:id/checkout` | Check-out |

### Checklist
- [ ] **Trang quản lý chuồng** (`/dashboard/manager/cages`)
  - [ ] Hiển thị danh sách cages
  - [ ] Status badge đúng màu (Available/Occupied/Maintenance)
  - [ ] Filter theo size/status
  
- [ ] **Thêm cage mới**
  - [ ] Form với: cageNumber, size, dailyRate, location
  - [ ] Tạo thành công
  
- [ ] **Check-in pet (Care Staff/Receptionist)**
  - [ ] Chọn cage available
  - [ ] Chọn pet cần lưu trú
  - [ ] Cage status chuyển OCCUPIED
  
- [ ] **Check-out**
  - [ ] Cage status chuyển AVAILABLE

---

## Nhóm 7: Payments & Invoices ⭐

### Endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/invoices` | Lấy danh sách invoices |
| POST | `/api/invoices` | Tạo invoice |
| GET | `/api/invoices/:id` | Chi tiết invoice |
| POST | `/api/payments` | Xử lý thanh toán |

### Checklist
- [ ] **Xem hóa đơn (Owner)** (`/dashboard/owner/payments`)
  - [ ] Hiển thị invoices của owner
  - [ ] Status badge đúng (PENDING/PAID)
  
- [ ] **Tạo invoice (Receptionist)**
  - [ ] Liên kết với appointment
  - [ ] Tính tiền đúng
  
- [ ] **Thanh toán**
  - [ ] Chọn payment method
  - [ ] Invoice status chuyển PAID

---

## 📝 Ghi chú

### Test Accounts có sẵn:
| Email | Role |
|-------|------|
| manager@pawlovers.com | Manager |
| vet1@pawlovers.com | Veterinarian |
| vet2@pawlovers.com | Veterinarian |
| care1@pawlovers.com | Care Staff |
| care2@pawlovers.com | Care Staff |
| care3@pawlovers.com | Care Staff |
| reception@pawlovers.com | Receptionist |
| owner1@gmail.com | Pet Owner |
| owner2@gmail.com | Pet Owner |
| owner3@gmail.com | Pet Owner |
| owner4@gmail.com | Pet Owner |
| owner5@gmail.com | Pet Owner |

### Swagger API Docs:
http://localhost:3001/api/docs
