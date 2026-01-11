# API Dành Cho Bác Sĩ Thú Y (VETERINARIAN)

📊 Phân Tích Gap: API Backend vs UI Veterinarian
✅ APIs ĐANG ĐƯỢC SỬ DỤNG:
API Module	Endpoints Đã Dùng
Appointment	getMyAppointments, getByEmployee, start
Medical Record	getMyRecords, getByPet, getVaccineTypes, getAll
Cage	getAll, getActiveAssignments, assignPet, checkOutPet
Schedule	getByEmployee
❌ APIs CHƯA ĐƯỢC SỬ DỤNG TRÊN UI:
1. Appointment APIs (2 missing)
API	Mô tả	Cần thiết?
PUT /appointments/:id/complete	Hoàn thành với actualCost	⚠️ Có thể thêm
GET /appointments/by-pet/:petId	Xem lịch hẹn theo pet	⚠️ Có thể thêm
2. Medical Record APIs (3 missing)
API	Mô tả	Cần thiết?
POST /medical-records	Tạo bệnh án (có form nhưng check logic)	✅ Quan trọng
PUT /medical-records/:id	Cập nhật bệnh án	✅ Quan trọng
GET /medical-records/pet/:petId/overdue-followups	Tái khám quá hạn	⚠️ Có thể thêm alert
3. Vaccination APIs (3 missing)
API	Mô tả	Cần thiết?
GET /pets/:petId/vaccinations/upcoming	Sắp đến hạn tiêm	⚠️ Dashboard alert
GET /pets/:petId/vaccinations/overdue	Quá hạn tiêm	⚠️ Dashboard alert
POST /pets/:petId/vaccinations	Thêm tiêm chủng	✅ Có form nhưng thiếu fields
4. Schedule APIs (2 missing)
API	Mô tả	Cần thiết?
PUT /schedules/:id/unavailable	Đánh dấu không khả dụng	⚠️ Có thể thêm nút
PUT /schedules/:id/available	Đánh dấu khả dụng	⚠️ Có thể thêm nút
5. Cage APIs (3 missing)
API	Mô tả	Cần thiết?
GET /cages/available	Lọc chuồng trống	⚠️ UI có filter local
GET /cages/:id	Chi tiết chuồng	⚠️ Ít cần thiết
GET /cages/:id/assignments	Lịch sử sử dụng	⚠️ Ít cần thiết
❌ FIELDS CHƯA HIỂN THỊ TRÊN UI:
📋 Medical Record Response:
Field	Mô tả	Vị trí cần thêm
isFollowUpOverdue	Đã quá hạn tái khám?	Badge đỏ trong bảng
needsFollowUp	Cần tái khám?	Badge vàng trong bảng
medicalSummary	JSONB tổng kết (symptoms, prescription, notes)	Modal chi tiết
💉 Vaccination (Create & Response):
Field	Mô tả	Vị trí cần thêm
batchNumber	Số lô vaccine	Form tiêm chủng
site	Vị trí tiêm	Form tiêm chủng
reactions	Phản ứng sau tiêm	Form tiêm chủng
isDue	Đã đến hạn?	Badge trong cards
daysUntilDue	Số ngày đến hạn	Hiển thị countdown
🏠 Cage Assignment:
Field	Mô tả	Vị trí cần thêm
dailyRate	Giá theo ngày	Form nhập chuồng
assignedById	Nhân viên phân bổ	Modal chi tiết
📅 Work Schedule:
Field	Mô tả	Vị trí cần thêm
breakStart/End	Giờ nghỉ trưa	Chi tiết lịch làm việc
workingHours	Số giờ làm (computed)	Stats trong dashboard
notes	Ghi chú lịch	Card chi tiết
📌 ĐỀ XUẤT ƯU TIÊN:
🔴 Cao: Thêm fields batchNumber, site, reactions vào form tiêm chủng
🔴 Cao: Hiển thị isFollowUpOverdue badge trong bảng hồ sơ bệnh án
🟡 Trung bình: Thêm nút toggle available/unavailable cho lịch làm việc
🟡 Trung bình: Thêm field dailyRate vào form nhập chuồng
🟢 Thấp: Hiển thị daysUntilDue countdown cho vaccinations