# 🐾 PAW LOVERS - KỊCH BẢN DEMO 60 PHÚT
## Hệ Thống Quản Lý Phòng Khám Thú Cưng

---

## 📋 THÔNG TIN TỔNG QUAN

| Thông tin | Chi tiết |
|-----------|----------|
| **Thời lượng** | 60 phút |
| **URL Frontend** | http://localhost:3000 |
| **URL Backend** | http://localhost:3001 |
| **Focus chính** | Business Flow - Quy trình nghiệp vụ |

---

## 🔐 TÀI KHOẢN DEMO

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| **Manager** | manager@pawlovers.com | password123 |
| **Receptionist** | receptionist@pawlovers.com | password123 |
| **Veterinarian** | vet@pawlovers.com | password123 |
| **Care Staff** | carestaff@pawlovers.com | password123 |
| **Pet Owner** | owner@pawlovers.com | password123 |

---

## ⏱️ PHÂN BỐ THỜI GIAN

| Phần | Nội dung | Thời gian |
|------|----------|-----------|
| 1 | Giới thiệu hệ thống & Đăng nhập | 5 phút |
| 2 | **Flow 1:** Đăng ký khách hàng mới + Thêm thú cưng | 8 phút |
| 3 | **Flow 2:** Đặt lịch hẹn khám | 10 phút |
| 4 | **Flow 3:** Tiếp nhận & Xác nhận lịch hẹn | 8 phút |
| 5 | **Flow 4:** Bác sĩ khám bệnh & Tạo hồ sơ y tế | 12 phút |
| 6 | **Flow 5:** Thanh toán & Xuất hóa đơn | 8 phút |
| 7 | **Flow 6:** Quản lý lưu trú (Boarding) | 5 phút |
| 8 | Báo cáo & Thống kê (Manager) | 4 phút |
| **Tổng** | | **60 phút** |

---

# 📍 PHẦN 1: GIỚI THIỆU HỆ THỐNG (5 phút)

## 1.1 Tổng quan hệ thống (2 phút)

**Mục tiêu:** Giới thiệu PAW LOVERS và các tính năng chính

**Script nói:**
> "PAW LOVERS là hệ thống quản lý phòng khám thú cưng toàn diện, hỗ trợ quy trình từ đặt lịch, khám bệnh đến thanh toán. Hệ thống phục vụ 5 nhóm người dùng: Chủ thú cưng, Lễ tân, Bác sĩ thú y, Nhân viên chăm sóc và Quản lý."

**Thao tác:**
1. Mở trang chủ: `http://localhost:3000`
2. Giới thiệu giao diện landing page
3. Highlight các tính năng nổi bật

## 1.2 Đăng nhập Manager (3 phút)

**Thao tác:**
1. Click **"Đăng nhập"**
2. Nhập: `manager@pawlovers.com` / `password123`
3. Giới thiệu nhanh Dashboard Manager:
   - Thống kê tổng quan
   - Menu điều hướng
   - Các module quản lý

---

# 📍 PHẦN 2: FLOW 1 - ĐĂNG KÝ KHÁCH HÀNG MỚI (8 phút)

## 2.1 Khách hàng đăng ký tài khoản (4 phút)

**Scenario:** Chị Nguyễn Thị Mai muốn đăng ký sử dụng dịch vụ cho chú mèo tên Miu

**Thao tác:**
1. **Đăng xuất** khỏi tài khoản Manager
2. Click **"Đăng ký"** trên trang chủ
3. Điền thông tin:
   - Họ tên: `Nguyễn Thị Mai`
   - Email: `mai.nguyen.demo@gmail.com`
   - Số điện thoại: `0901234567`
   - Mật khẩu: `Demo@123`
4. Click **"Đăng ký"**
5. ✅ Hiển thị thông báo thành công

## 2.2 Thêm thú cưng (4 phút)

**Thao tác:**
1. **Đăng nhập** với tài khoản vừa tạo
2. Vào **Dashboard Owner** → **Thú cưng của tôi**
3. Click **"+ Thêm thú cưng"**
4. Điền thông tin:
   - Tên: `Miu`
   - Loài: `Mèo`
   - Giống: `Mèo Anh lông ngắn`
   - Giới tính: `Cái`
   - Ngày sinh: `15/03/2023`
   - Cân nặng: `4.2 kg`
   - Màu lông: `Xám xanh`
5. Click **"Lưu"**
6. ✅ Thú cưng xuất hiện trong danh sách

**Điểm nhấn:**
> "Hệ thống tự động tạo mã thú cưng duy nhất, giúp theo dõi lịch sử khám bệnh xuyên suốt."

---

# 📍 PHẦN 3: FLOW 2 - ĐẶT LỊCH HẸN KHÁM (10 phút)

## 3.1 Chọn dịch vụ và đặt lịch (6 phút)

**Scenario:** Chị Mai muốn đặt lịch khám tổng quát cho Miu

**Thao tác:**
1. Vào **"Đặt lịch hẹn"** từ menu
2. Click **"+ Đặt lịch mới"**
3. **Bước 1 - Chọn thú cưng:**
   - Chọn `Miu`
4. **Bước 2 - Chọn dịch vụ:**
   - ✓ Khám tổng quát (200.000đ)
   - ✓ Tiêm vaccine 5 bệnh (350.000đ)
5. **Bước 3 - Chọn ngày giờ:**
   - Ngày: `[Ngày mai]`
   - Giờ: `09:30 - 10:00`
   - Bác sĩ: `BS. Phạm Minh Tuấn`
6. **Bước 4 - Xác nhận:**
   - Kiểm tra thông tin
   - Ghi chú: `Miu hay sợ tiêm, cần nhẹ nhàng`
7. Click **"Xác nhận đặt lịch"**

## 3.2 Xem lịch hẹn đã đặt (4 phút)

**Thao tác:**
1. Xem danh sách **"Lịch hẹn của tôi"**
2. Highlight các thông tin:
   - Mã lịch hẹn: `APT-xxx`
   - Trạng thái: `Chờ xác nhận` (màu vàng)
   - Chi tiết dịch vụ
   - Tổng chi phí dự kiến: `550.000đ`
3. Click vào lịch hẹn để xem chi tiết

**Điểm nhấn:**
> "Khách hàng có thể theo dõi trạng thái lịch hẹn theo thời gian thực và nhận thông báo khi có cập nhật."

---

# 📍 PHẦN 4: FLOW 3 - TIẾP NHẬN & XÁC NHẬN LỊCH HẸN (8 phút)

## 4.1 Lễ tân xem danh sách lịch hẹn (3 phút)

**Thao tác:**
1. **Đăng xuất** tài khoản Owner
2. **Đăng nhập** với: `receptionist@pawlovers.com` / `password123`
3. Vào **"Quản lý lịch hẹn"**
4. Lọc theo trạng thái: `Chờ xác nhận`
5. Tìm lịch hẹn của **Nguyễn Thị Mai - Miu**

## 4.2 Xác nhận lịch hẹn (3 phút)

**Thao tác:**
1. Click vào lịch hẹn để mở chi tiết
2. Kiểm tra thông tin:
   - Thông tin khách hàng
   - Thông tin thú cưng
   - Dịch vụ yêu cầu
   - Thời gian đặt
3. Click **"Xác nhận lịch hẹn"**
4. ✅ Trạng thái chuyển sang: `Đã xác nhận` (màu xanh)

## 4.3 Kiểm tra thông báo phía Owner (2 phút)

**Thao tác:**
1. Đăng nhập lại tài khoản Owner
2. Kiểm tra **"Lịch hẹn của tôi"**
3. ✅ Trạng thái đã cập nhật: `Đã xác nhận`

**Điểm nhấn:**
> "Email xác nhận được gửi tự động đến khách hàng với đầy đủ thông tin lịch hẹn."

---

# 📍 PHẦN 5: FLOW 4 - BÁC SĨ KHÁM BỆNH (12 phút)

## 5.1 Bác sĩ xem lịch khám trong ngày (3 phút)

**Thao tác:**
1. **Đăng nhập** với: `vet@pawlovers.com` / `password123`
2. Vào **"Lịch làm việc"** hoặc **Dashboard**
3. Xem các lịch hẹn được phân công
4. Tìm lịch hẹn của **Miu**
5. Click **"Bắt đầu khám"** → Trạng thái: `Đang khám`

## 5.2 Thực hiện khám và ghi nhận kết quả (6 phút)

**Thao tác:**
1. Vào **"Hồ sơ bệnh án"** → **"Tạo hồ sơ mới"**
2. Chọn lịch hẹn của **Miu**
3. Điền thông tin khám:
   
   **Thông tin chung:**
   - Cân nặng hiện tại: `4.3 kg`
   - Nhiệt độ: `38.5°C`
   - Nhịp tim: `120 bpm`
   
   **Chẩn đoán:**
   - Tình trạng: `Sức khỏe tốt, đủ điều kiện tiêm phòng`
   - Ghi chú: `Lông mượt, mắt sáng, phản xạ tốt`
   
   **Điều trị:**
   - Đã tiêm vaccine 5 bệnh
   - Hẹn tiêm nhắc lại sau 3 tuần

4. Click **"Lưu hồ sơ"**

## 5.3 Hoàn thành khám (3 phút)

**Thao tác:**
1. Quay lại danh sách lịch hẹn
2. Click **"Hoàn thành khám"**
3. ✅ Trạng thái: `Đã hoàn thành`
4. ✅ Hóa đơn tự động được tạo

**Điểm nhấn:**
> "Khi hoàn thành khám, hệ thống tự động tạo hóa đơn và chuyển sang bước thanh toán."

---

# 📍 PHẦN 6: FLOW 5 - THANH TOÁN & HÓA ĐƠN (8 phút)

## 6.1 Lễ tân xử lý thanh toán (4 phút)

**Thao tác:**
1. **Đăng nhập** Receptionist
2. Vào **"Quản lý thanh toán"**
3. Tìm hóa đơn của **Nguyễn Thị Mai**
4. Xem chi tiết hóa đơn:
   - Khám tổng quát: `200.000đ`
   - Tiêm vaccine 5 bệnh: `350.000đ`
   - **Tổng cộng: `550.000đ`**

## 6.2 Xác nhận thanh toán (4 phút)

**Thao tác:**
1. Chọn phương thức thanh toán:
   - ○ Tiền mặt
   - ○ Chuyển khoản
   - ● VNPay (Demo)
2. Click **"Thanh toán VNPay"**
3. (Demo) Redirect đến trang VNPay sandbox
4. Hoàn thành thanh toán
5. ✅ Trạng thái hóa đơn: `Đã thanh toán`
6. ✅ In/Xuất hóa đơn PDF

**Điểm nhấn:**
> "Hệ thống tích hợp VNPay giúp khách hàng thanh toán online tiện lợi và an toàn."

---

# 📍 PHẦN 7: FLOW 6 - QUẢN LÝ LƯU TRÚ (5 phút)

## 7.1 Đặt phòng lưu trú (3 phút)

**Scenario:** Chị Mai muốn gửi Miu 3 ngày khi đi công tác

**Thao tác (với tài khoản Owner):**
1. Vào **"Dịch vụ lưu trú"**
2. Click **"Đặt phòng"**
3. Điền thông tin:
   - Thú cưng: `Miu`
   - Ngày nhận: `[Ngày X]`
   - Ngày trả: `[Ngày X+3]`
   - Loại phòng: `Phòng VIP`
   - Dịch vụ thêm: ✓ Dắt dạo hàng ngày
4. Click **"Xác nhận đặt phòng"**

## 7.2 Care Staff quản lý chuồng (2 phút)

**Thao tác:**
1. **Đăng nhập** Care Staff: `carestaff@pawlovers.com`
2. Vào **"Quản lý chuồng"**
3. Xem sơ đồ chuồng trại
4. Kiểm tra tình trạng:
   - 🟢 Trống
   - 🟡 Đã đặt
   - 🔴 Đang có thú cưng

---

# 📍 PHẦN 8: BÁO CÁO & THỐNG KÊ (4 phút)

## 8.1 Dashboard Manager (2 phút)

**Thao tác:**
1. **Đăng nhập** Manager
2. Xem Dashboard tổng quan:
   - Doanh thu hôm nay/tuần/tháng
   - Số lượng lịch hẹn
   - Thú cưng đang lưu trú
   - Top dịch vụ

## 8.2 Báo cáo chi tiết (2 phút)

**Thao tác:**
1. Vào **"Báo cáo"**
2. Xem các loại báo cáo:
   - 📊 Báo cáo doanh thu
   - 📈 Báo cáo lịch hẹn
   - 📋 Báo cáo dịch vụ
3. Lọc theo khoảng thời gian
4. Xuất báo cáo Excel/PDF

---

# ✅ KẾT THÚC DEMO

## Tóm tắt các nghiệp vụ đã demo:

| # | Flow | Vai trò liên quan |
|---|------|-------------------|
| 1 | Đăng ký khách hàng + Thêm thú cưng | Owner |
| 2 | Đặt lịch hẹn khám | Owner |
| 3 | Tiếp nhận & Xác nhận lịch hẹn | Receptionist |
| 4 | Khám bệnh & Tạo hồ sơ y tế | Veterinarian |
| 5 | Thanh toán & Xuất hóa đơn | Receptionist |
| 6 | Quản lý lưu trú thú cưng | Care Staff |
| 7 | Báo cáo & Thống kê | Manager |

## Điểm mạnh của hệ thống:

- ✅ **Quy trình liền mạch** từ đặt lịch đến thanh toán
- ✅ **Phân quyền rõ ràng** cho từng vai trò
- ✅ **Theo dõi thời gian thực** trạng thái lịch hẹn
- ✅ **Tích hợp thanh toán** VNPay
- ✅ **Hồ sơ y tế** lưu trữ đầy đủ
- ✅ **Báo cáo thống kê** chi tiết

---

## 📞 HỖ TRỢ

> Cảm ơn quý vị đã theo dõi demo!
> Mọi thắc mắc xin liên hệ nhóm phát triển.

---

*Tài liệu demo - PAW LOVERS Pet Care System v1.0*
