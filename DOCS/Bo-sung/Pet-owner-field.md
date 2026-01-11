📋 TỔNG HỢP ĐẦY ĐỦ API & DTO FIELDS CHO PET OWNER
1. 🐾 Pet APIs (PetResponseDto)
Method	Endpoint	Access
GET	/pets/me	PET_OWNER only
POST	/pets	PET_OWNER
GET	/pets/:id	PET_OWNER
PUT	/pets/:id	PET_OWNER
DELETE	/pets/:id	PET_OWNER
PetResponseDto Fields (10 fields):

Field	Type	Đã hiển thị UI?
id
number	✅
ownerId	number	✅
name	string	✅
species	string	✅
breed	string	null
birthDate	Date	null
gender	string	✅
weight	number	null
color	string	null
createdAt	Date	✅
2. 👤 Pet Owner APIs (PetOwnerResponseDto)
Method	Endpoint	Access
GET	/pet-owners/me	PET_OWNER only
PUT	/pet-owners/me	PET_OWNER only
PetOwnerResponseDto Fields (8 fields):

Field	Type	Đã hiển thị UI?
petOwnerId	number	✅
accountId	number	✅
fullName	string	✅
phoneNumber	string	✅
address	string	null
preferredContactMethod	string	✅
emergencyContact	string	null
registrationDate	Date	✅
3. 📅 Appointment APIs (Appointment Entity - trả về trực tiếp)
Method	Endpoint	Access
POST	/appointments	PET_OWNER
GET	/appointments	PET_OWNER
GET	/appointments/:id	PET_OWNER
PUT	/appointments/:id/cancel	PET_OWNER
Appointment Entity Fields (16 fields):

Field	Type	Đã hiển thị UI?
appointmentId	number	✅
petId	number	✅
employeeId	number	⚠️ Chỉ hiện employee.fullName
serviceId	number	⚠️ Chỉ hiện service.serviceName
appointmentDate	Date	✅
startTime	string	✅
endTime	string	❌ THIẾU
status	enum	✅
notes	string	null
cancellationReason	string	null
estimatedCost	number	✅
actualCost	number	❌ THIẾU
createdAt	Date	❌ THIẾU
updatedAt	Date	❌ THIẾU
cancelledAt	Date	null
cageAssignmentId	number	null
4. 🏥 Medical Record APIs (MedicalRecordResponseDto)
Method	Endpoint	Access
GET	/medical-records/:id	PET_OWNER
GET	/medical-records/pet/:petId	PET_OWNER
MedicalRecordResponseDto Fields (12 fields):

Field	Type	Đã hiển thị UI?
id
number	✅
petId	number	✅
veterinarianId	number	✅
appointmentId	number	null
diagnosis	string	✅
treatment	string	✅
medicalSummary	object	null
followUpDate	Date	null
isFollowUpOverdue	boolean	✅
needsFollowUp	boolean	✅
examinationDate	Date	✅
createdAt	Date	✅
5. 💉 Vaccination APIs (VaccinationResponseDto)
Method	Endpoint	Access
GET	/pets/:petId/vaccinations	PET_OWNER
GET	/pets/:petId/vaccinations/upcoming	PET_OWNER
GET	/pets/:petId/vaccinations/overdue	PET_OWNER
VaccinationResponseDto Fields (13 fields):

Field	Type	Đã hiển thị UI?
id
number	✅
petId	number	✅
vaccineTypeId	number	⚠️ Chỉ hiện tên
administrationDate	Date	✅
nextDueDate	Date	null
isDue	boolean	✅
daysUntilDue	number	null
batchNumber	string	null
site	string	null
reactions	string	null
notes	string	null
administeredBy	number	null
createdAt	Date	✅
6. 🧾 Invoice APIs (InvoiceResponseDto)
Method	Endpoint	Access
GET	/invoices/me	PET_OWNER only
GET	/invoices/:id	PET_OWNER
InvoiceResponseDto Fields (17 fields):

Field	Type	Đã hiển thị UI?
invoiceId	number	✅
status	enum	✅
appointmentId	number	✅
invoiceNumber	string	✅
issueDate	Date	✅
subtotal	number	✅
discount	number	✅
tax	number	✅
totalAmount	number	✅
notes	string	null
paidAt	Date	null
createdAt	Date	✅
updatedAt	Date	✅
appointment	object	✅
petOwner	object	❌ Không cần hiện
pet	object	✅
service	object	✅
7. 💆 Service APIs (ServiceResponseDto) - PUBLIC
Method	Endpoint	Access
GET	/services	Public/Auth
ServiceResponseDto Fields (11 fields):

Field	Type	Đã hiển thị UI?
id
number	❌ THIẾU
serviceName	string	✅
categoryId	number	❌ THIẾU
categoryName	string	✅
description	string	null
basePrice	number	✅
estimatedDuration	number	✅
requiredStaffType	string	❌ THIẾU
isAvailable	boolean	✅ (status)
isBoardingService	boolean	❌ THIẾU
createdAt	Date	❌ THIẾU
8. 👨‍⚕️ Employee APIs (EmployeeResponseDto)
Method	Endpoint	Access
GET	/employees/veterinarians	PET_OWNER
EmployeeResponseDto Fields (13 fields):

Field	Type	Đã hiển thị UI?
employeeId	number	❌ THIẾU
accountId	number	❌ Không cần
userType	enum	❌ THIẾU
fullName	string	✅
phoneNumber	string	❌ THIẾU
address	string	null
hireDate	Date	❌ Không cần
salary	number	❌ Không hiện
isAvailable	boolean	❌ THIẾU
createdAt	Date	❌ Không cần
updatedAt	Date	❌ Không cần
licenseNumber	string	❌ THIẾU (Vet)
expertise	string	❌ THIẾU (Vet)
⚠️ CÁC FIELDS CÒN THIẾU TRONG UI:
Appointment Page:
endTime, actualCost, createdAt, updatedAt, cancelledAt, cancellationReason, cageAssignmentId
Services Page:
id
, categoryId, requiredStaffType, isBoardingService, createdAt