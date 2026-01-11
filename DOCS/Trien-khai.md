📋 Tổng quan Project PAW LOVERS
🎯 Mục tiêu hệ thống
Hệ thống quản lý dịch vụ chăm sóc thú cưng toàn diện cho trung tâm PAW LOVERS, phục vụ:

Bác sĩ thú y và nhân viên
Chủ nuôi (Pet Owners)
Quản lý
✅ Đã triển khai trong Backend (Pet_BE)
Module	Entities	Controllers	Services
Tài khoản	Account, Manager, Veterinarian, CareStaff, Receptionist, PetOwner	✅	✅
Thú cưng	Pet	✅	✅
Hồ sơ bệnh án	MedicalRecord	✅	✅
Tiêm phòng	VaccinationHistory, VaccineType	✅	✅
Dịch vụ	Service, ServiceCategory	✅	✅
Lịch hẹn	Appointment	✅	✅
Chuồng nuôi	Cage, CageAssignment	✅	✅
Thanh toán	Invoice, Payment	✅	✅
Lịch làm việc	WorkSchedule	✅	✅
Báo cáo	(report.service)	✅	✅
VNPay	(vnpay.service)	-	✅
❌ Chưa triển khai (theo mô tả đề tài)
Chức năng	Mô tả	Độ ưu tiên
Danh sách chờ (Waitlist)	Khi lịch bác sĩ kín, chủ nuôi đăng ký chờ	🟡
Đặt cọc & Hoàn tiền	Hệ thống đặt cọc khi đặt lịch, hoàn trả nếu hủy đúng hạn	🟡
Quản lý vi phạm	Cảnh báo, giới hạn tài khoản hủy lịch nhiều lần	🟠
Khách hàng thân thiết	Loại tài khoản (thường/thân thiết), ưu đãi	🟡
Phiếu đặt lịch	Tạo phiếu in/điện tử khi đặt lịch tại quầy	🟢
Quản lý vị trí hồ sơ vật lý	Khu vực – Quầy – Kệ – Vị trí	🟢
Quản lý thuốc/vật tư y tế	Tồn kho, cảnh báo hết hạn	🟠
Báo cáo nâng cao	Hiệu suất NV, bệnh thường gặp, vật tư sử dụng	🟡
Thông báo tự động	Email/SMS nhắc lịch tiêm, lịch hẹn	🟠
Cách ly thú cưng	Ưu tiên chuồng riêng cho thú bệnh truyền nhiễm	🟢