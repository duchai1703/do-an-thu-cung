# Receptionist APIs & DTOs Documentation

> Tài liệu chi tiết về các API và DTO cho giao diện Receptionist (Lễ tân)
> 
> **Base URL**: `http://localhost:3001/api`  
> **Authentication**: Bearer Token (JWT)

---

## Mục lục

1. [Appointments API](#1-appointments-api)
2. [Pet Owners (Customers) API](#2-pet-owners-customers-api)
3. [Invoices API](#3-invoices-api)
4. [Payments API](#4-payments-api)
5. [Services API](#5-services-api)
6. [Entity Types & Enums](#6-entity-types--enums)

---

## 1. Appointments API

**Base**: `/api/appointments`

### 1.1 Lấy tất cả lịch hẹn

```http
GET /api/appointments
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | AppointmentStatus | No | Filter theo trạng thái |
| `petId` | number | No | Filter theo thú cưng |
| `employeeId` | number | No | Filter theo nhân viên |
| `date` | string (YYYY-MM-DD) | No | Filter theo ngày |

**Response:**
```json
[
  {
    "appointmentId": 1,
    "appointmentDate": "2026-01-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "PENDING",
    "notes": "Ghi chú",
    "estimatedCost": 250000,
    "actualCost": null,
    "pet": {
      "petId": 1,
      "name": "Milu",
      "species": "DOG",
      "breed": "Poodle",
      "owner": {
        "petOwnerId": 1,
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0901234567",
        "account": {
          "email": "owner@example.com"
        }
      }
    },
    "service": {
      "serviceId": 1,
      "serviceName": "Khám tổng quát",
      "price": 250000,
      "serviceCategory": {
        "categoryId": 1,
        "categoryName": "Khám bệnh"
      }
    },
    "employee": {
      "employeeId": 1,
      "fullName": "Bác sĩ Trần B"
    }
  }
]
```

---

### 1.2 Lấy lịch hẹn theo trạng thái

```http
GET /api/appointments/status?status=CONFIRMED
Authorization: Bearer <token>
```

**Response:** Mảng appointments như trên

---

### 1.3 Tạo lịch hẹn mới

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body - CreateAppointmentDto:**
```typescript
{
  petId: number;           // Required - ID thú cưng
  employeeId: number;      // Required - ID nhân viên
  serviceId: number;       // Required - ID dịch vụ
  appointmentDate: string; // Required - Format: "YYYY-MM-DD"
  startTime: string;       // Required - Format: "HH:MM" (09:00)
  endTime: string;         // Required - Format: "HH:MM" (10:00)
  notes?: string;          // Optional - Ghi chú
  estimatedCost?: number;  // Optional - Chi phí ước tính
}
```

**Example:**
```json
{
  "petId": 1,
  "employeeId": 2,
  "serviceId": 1,
  "appointmentDate": "2026-01-20",
  "startTime": "10:00",
  "endTime": "11:00",
  "notes": "Khách hàng VIP",
  "estimatedCost": 300000
}
```

---

### 1.4 Cập nhật lịch hẹn

```http
PUT /api/appointments/:id
Authorization: Bearer <token>
```

**Request Body - UpdateAppointmentDto:**
```typescript
{
  employeeId?: number;     // Optional
  appointmentDate?: string;// Optional - "YYYY-MM-DD"
  startTime?: string;      // Optional - "HH:MM"
  endTime?: string;        // Optional - "HH:MM"
  notes?: string;          // Optional
  status?: AppointmentStatus; // Optional
  estimatedCost?: number;  // Optional
  actualCost?: number;     // Optional
}
```

---

### 1.5 Xác nhận lịch hẹn

```http
PUT /api/appointments/:id/confirm
Authorization: Bearer <token>
```

Đổi trạng thái từ `PENDING` → `CONFIRMED`

---

### 1.6 Hủy lịch hẹn

```http
PUT /api/appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Khách hàng yêu cầu hủy"
}
```

---

## 2. Pet Owners (Customers) API

**Base**: `/api/pet-owners`

### 2.1 Lấy tất cả khách hàng

```http
GET /api/pet-owners
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `fullName` | string | Tìm theo tên |
| `phoneNumber` | string | Tìm theo SĐT |

**Response - PetOwnerResponseDto[]:**
```json
[
  {
    "petOwnerId": 1,
    "accountId": 10,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0901234567",
    "address": "123 Đường ABC, Quận 1",
    "preferredContactMethod": "PHONE",
    "emergencyContact": "0909876543",
    "registrationDate": "2025-06-15T00:00:00.000Z",
    "account": {
      "accountId": 10,
      "email": "owner@example.com",
      "isActive": true
    },
    "pets": [
      {
        "petId": 1,
        "name": "Milu",
        "species": "DOG",
        "breed": "Poodle"
      }
    ]
  }
]
```

---

### 2.2 Tìm kiếm khách hàng

```http
GET /api/pet-owners/search?fullName=nguyen&phoneNumber=090
Authorization: Bearer <token>
```

---

### 2.3 Lấy thông tin khách hàng theo ID

```http
GET /api/pet-owners/:accountId
Authorization: Bearer <token>
```

**Roles**: PET_OWNER, MANAGER, RECEPTIONIST

---

### 2.4 Lấy lịch hẹn của khách hàng

```http
GET /api/pet-owners/:id/appointments?status=CONFIRMED
Authorization: Bearer <token>
```

---

### 2.5 Lấy hóa đơn của khách hàng

```http
GET /api/pet-owners/:id/invoices?status=PAID
Authorization: Bearer <token>
```

---

## 3. Invoices API

**Base**: `/api/invoices`

### 3.1 Lấy tất cả hóa đơn

```http
GET /api/invoices/all
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | InvoiceStatus | PENDING, PAID, CANCELLED, OVERDUE |
| `startDate` | string | Từ ngày (YYYY-MM-DD) |
| `endDate` | string | Đến ngày (YYYY-MM-DD) |
| `includeAppointment` | boolean | Include appointment data |
| `includePetOwner` | boolean | Include pet owner data |
| `includePet` | boolean | Include pet data |

**Response - InvoiceResponseDto[]:**
```json
[
  {
    "invoiceId": 1,
    "invoiceNumber": "INV-20260111-001",
    "appointmentId": 5,
    "totalAmount": 350000,
    "status": "PENDING",
    "issueDate": "2026-01-11T10:00:00.000Z",
    "dueDate": "2026-01-18T10:00:00.000Z",
    "paidDate": null,
    "notes": null,
    "appointment": {
      "appointmentId": 5,
      "appointmentDate": "2026-01-11",
      "service": {
        "serviceName": "Tắm spa"
      }
    },
    "petOwner": {
      "petOwnerId": 1,
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0901234567"
    },
    "payments": []
  }
]
```

---

### 3.2 Tạo hóa đơn

```http
POST /api/invoices/generate
Authorization: Bearer <token>
```

**Request Body - CreateInvoiceDto:**
```typescript
{
  appointmentId: number;  // Required - ID của appointment đã hoàn thành
  discountCode?: string;  // Optional - Mã giảm giá
  notes?: string;         // Optional - Ghi chú (max 500 chars)
}
```

---

### 3.3 Thống kê khách hàng

```http
GET /api/invoices/customer-statistics
Authorization: Bearer <token>
```

**Response - CustomerStatisticsResponseDto[]:**
```json
[
  {
    "petOwnerId": 1,
    "totalVisits": 15,
    "totalSpent": 4500000,
    "lastVisit": "2026-01-10T00:00:00.000Z"
  }
]
```

---

### 3.4 Đánh dấu đã thanh toán

```http
PUT /api/invoices/:id/mark-paid
Authorization: Bearer <token>
```

---

## 4. Payments API

**Base**: `/api/payments`

### 4.1 Xử lý thanh toán

```http
POST /api/payments
Authorization: Bearer <token>
```

**Roles**: MANAGER, RECEPTIONIST

**Request Body - CreatePaymentDto:**
```typescript
{
  invoiceId: number;         // Required - ID hóa đơn
  amount: number;            // Required - Số tiền (>= 0)
  paymentMethod: PaymentMethod; // Required - CASH, BANK_TRANSFER, VNPAY
  receivedBy?: number;       // Optional - ID nhân viên nhận tiền
  notes?: string;            // Optional - Ghi chú (max 500)
}
```

**Example:**
```json
{
  "invoiceId": 5,
  "amount": 350000,
  "paymentMethod": "CASH",
  "receivedBy": 3,
  "notes": "Khách thanh toán tiền mặt"
}
```

**Response - PaymentResponseDto:**
```json
{
  "paymentId": 1,
  "invoiceId": 5,
  "amount": 350000,
  "paymentMethod": "CASH",
  "paymentDate": "2026-01-11T10:30:00.000Z",
  "transactionId": "TXN-20260111-001",
  "status": "COMPLETED",
  "processedBy": null,
  "notes": "Khách thanh toán tiền mặt"
}
```

---

### 4.2 Lấy tất cả thanh toán

```http
GET /api/payments
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | PENDING, COMPLETED, FAILED, REFUNDED |
| `method` | string | CASH, BANK_TRANSFER, VNPAY |
| `startDate` | string | Từ ngày |
| `endDate` | string | Đến ngày |

---

### 4.3 Khởi tạo thanh toán online (VNPay)

```http
POST /api/payments/online/initiate
Authorization: Bearer <token>
```

**Roles**: MANAGER, RECEPTIONIST, PET_OWNER

**Request Body - InitiateOnlinePaymentDto:**
```typescript
{
  invoiceId: number;     // Required
  returnUrl: string;     // Required - URL redirect sau thanh toán
  cancelUrl: string;     // Optional - URL khi hủy
}
```

**Response:**
```json
{
  "paymentUrl": "https://vnpay.vn/pay?...",
  "paymentId": 10
}
```

---

### 4.4 Lịch sử thanh toán

```http
GET /api/payments/history
Authorization: Bearer <token>
```

**Roles**: MANAGER, RECEPTIONIST

---

### 4.5 Tạo biên nhận

```http
GET /api/payments/:id/receipt
Authorization: Bearer <token>
```

---

## 5. Services API

**Base**: `/api/services`

### 5.1 Lấy tất cả dịch vụ

```http
GET /api/services
```

**Response:**
```json
[
  {
    "serviceId": 1,
    "serviceName": "Khám tổng quát",
    "description": "Kiểm tra sức khỏe toàn diện",
    "price": 250000,
    "duration": 30,
    "isActive": true,
    "serviceCategory": {
      "categoryId": 1,
      "categoryName": "Khám bệnh"
    }
  }
]
```

---

## 6. Entity Types & Enums

### AppointmentStatus
```typescript
enum AppointmentStatus {
  PENDING = "PENDING",       // Chờ xác nhận
  CONFIRMED = "CONFIRMED",   // Đã xác nhận
  IN_PROGRESS = "IN_PROGRESS", // Đang thực hiện
  COMPLETED = "COMPLETED",   // Hoàn thành
  CANCELLED = "CANCELLED"    // Đã hủy
}
```

### InvoiceStatus
```typescript
enum InvoiceStatus {
  PENDING = "PENDING",       // Chờ thanh toán
  PAID = "PAID",             // Đã thanh toán
  CANCELLED = "CANCELLED",   // Đã hủy
  OVERDUE = "OVERDUE"        // Quá hạn
}
```

### PaymentMethod
```typescript
enum PaymentMethod {
  CASH = "CASH",                   // Tiền mặt
  BANK_TRANSFER = "BANK_TRANSFER", // Chuyển khoản
  VNPAY = "VNPAY"                  // VNPay online
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}
```

### PetSpecies
```typescript
enum PetSpecies {
  DOG = "DOG",
  CAT = "CAT",
  BIRD = "BIRD",
  RABBIT = "RABBIT",
  OTHER = "OTHER"
}
```

### PreferredContactMethod
```typescript
type PreferredContactMethod = "PHONE" | "EMAIL" | "SMS";
```

---

## Frontend API Integration

Tham khảo file: `do-an-thu-cung/lib/api/`

```javascript
// Appointments
import { appointmentApi } from '@/lib/api';
await appointmentApi.getAll();
await appointmentApi.getByStatus('CONFIRMED');
await appointmentApi.update(id, { status: 'CONFIRMED' });

// Pet Owners (Customers)
import { petOwnerApi } from '@/lib/api';
await petOwnerApi.getAll();
await petOwnerApi.search({ fullName, phoneNumber });

// Invoices
import { invoiceApi } from '@/lib/api';
await invoiceApi.getAll();
await invoiceApi.getCustomerStatistics();

// Payments
import { paymentApi } from '@/lib/api';
await paymentApi.create({ invoiceId, amount, paymentMethod });
await paymentApi.getAll();
```

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "petId",
      "message": "petId must be a number"
    }
  ]
}
```

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (token expired/invalid) |
| 403 | Forbidden (không đủ quyền) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

> **Last Updated**: 2026-01-11
