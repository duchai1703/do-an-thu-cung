// ============================================================================
// ENUMS
// ============================================================================

export enum UserType {
  PET_OWNER = "PET_OWNER",
  MANAGER = "MANAGER",
  VETERINARIAN = "VETERINARIAN",
  CARE_STAFF = "CARE_STAFF",
  RECEPTIONIST = "RECEPTIONIST",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  VNPAY = "VNPAY",
  MOMO = "MOMO",
  ZALOPAY = "ZALOPAY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum InvoiceStatus {
  PENDING = "PENDING",
  PROCESSING_ONLINE = "PROCESSING_ONLINE",
  PAID = "PAID",
  FAILED = "FAILED",
}

export enum CageSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export enum CageStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
  RESERVED = "RESERVED",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

export enum CageAssignmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum AuditOperation {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum ActorType {
  EMPLOYEE = "EMPLOYEE",
  PET_OWNER = "PET_OWNER",
  SYSTEM = "SYSTEM",
  WEBHOOK = "WEBHOOK",
}

export enum VaccineCategory {
  CORE = "Core",
  NON_CORE = "Non-core",
  OPTIONAL = "Optional",
}

// ============================================================================
// API RESPONSE WRAPPER
// ============================================================================

export interface ApiResponse<T> {
  statusCode: number;
  timestamp: string;
  message?: string;
  data: T | null;
  path?: string;
}

// ============================================================================
// ACCOUNT & AUTHENTICATION TYPES
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address?: string;
  userType: UserType;
  preferredContactMethod?: string;
  emergencyContact?: string;
  specialization?: string;
  licenseNumber?: string;
  hireDate?: string;
  salary?: number;
  skills?: string[];
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
  preferredContactMethod?: string;
  emergencyContact?: string;
  specialization?: string;
  isAvailable?: boolean;
}

export interface AccountResponse {
  accountId: number;
  email: string;
  userType: UserType;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  petOwner?: any;
  employee?: any;
}

export interface LoginResponse {
  accessToken: string;
  account: AccountResponse;
}

export interface JwtPayload {
  id: number;
  email: string;
}

// ============================================================================
// PET TYPES
// ============================================================================

export interface CreatePetDto {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  gender?: string;
  weight?: number;
  color?: string;
  initialHealthStatus?: string;
  specialNotes?: string;
}

export interface UpdatePetDto {
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: string;
  gender?: string;
  weight?: number;
  color?: string;
  initialHealthStatus?: string;
  specialNotes?: string;
}

export interface PetResponse {
  id: number;
  ownerId: number;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  gender: string;
  weight: number | null;
  color: string | null;
  age: number;
  createdAt: string;
}

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export interface CreateAppointmentDto {
  petId: number;
  employeeId: number;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  estimatedCost?: number;
}

export interface UpdateAppointmentDto {
  employeeId?: number;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface AppointmentResponse {
  id: number;
  petId: number;
  employeeId: number;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SERVICE TYPES
// ============================================================================

export interface CreateServiceDto {
  serviceName: string;
  categoryId: number;
  description?: string;
  basePrice: number;
  estimatedDuration: number;
  requiredStaffType: string;
  isBoardingService?: boolean;
}

export interface UpdateServiceDto {
  serviceName?: string;
  categoryId?: number;
  description?: string;
  basePrice?: number;
  estimatedDuration?: number;
  requiredStaffType?: string;
  isBoardingService?: boolean;
}

export interface ServiceResponse {
  id: number;
  serviceName: string;
  categoryId: number;
  categoryName?: string;
  description: string | null;
  basePrice: number;
  estimatedDuration: number;
  requiredStaffType: string;
  isAvailable: boolean;
  isBoardingService: boolean;
  createdAt: string;
}

// ============================================================================
// SERVICE CATEGORY TYPES
// ============================================================================

export interface CreateServiceCategoryDto {
  categoryName: string;
  description?: string;
}

export interface UpdateServiceCategoryDto {
  categoryName?: string;
  description?: string;
}

export interface ServiceCategoryResponse {
  id: number;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  serviceCount: number;
  createdAt: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface CreatePaymentDto {
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  receivedBy?: number;
  notes?: string;
}

export interface InitiateOnlinePaymentDto {
  invoiceId: number;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  ipAddress?: string;
  locale?: string;
}

export interface ProcessRefundDto {
  amount: number;
  reason: string;
}

export interface GetPaymentHistoryQuery {
  customerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface VNPayCallbackDto {
  vnp_TmnCode: string;
  vnp_Amount: string;
  vnp_BankCode?: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
  vnp_SecureHashType?: string;
  vnp_PaymentType?: string;
}

export interface PaymentResponse {
  paymentId: number;
  invoiceId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId: string | null;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  receivedBy: number | null;
  refundAmount: number;
  refundDate: string | null;
  refundReason: string | null;
  notes: string | null;
  createdAt: string;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export interface CreateInvoiceDto {
  appointmentId: number;
  discountCode?: string;
  notes?: string;
}

export interface UpdateInvoiceDto {
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface InvoiceResponse {
  invoiceId: number;
  status: InvoiceStatus;
  appointmentId: number;
  invoiceNumber: string;
  issueDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface CreateEmployeeDto {
  email: string;
  password: string;
  userType: UserType;
  fullName: string;
  phoneNumber: string;
  address?: string | null;
  hireDate: string;
  salary: number;
  licenseNumber?: string;
  expertise?: string;
  skills?: string[];
}

export interface UpdateEmployeeDto {
  fullName?: string;
  phoneNumber?: string;
  address?: string | null;
  salary?: number;
  isAvailable?: boolean;
  licenseNumber?: string;
  expertise?: string;
  skills?: string[];
}

export interface EmployeeResponse {
  employeeId: number;
  accountId: number;
  userType: UserType;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  hireDate: string;
  salary: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  licenseNumber?: string;
  expertise?: string;
  skills?: string[];
}

// ============================================================================
// PET OWNER TYPES
// ============================================================================

export interface RegisterPetOwnerDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address?: string | null;
  preferredContactMethod?: string;
  emergencyContact?: string | null;
}

export interface UpdatePetOwnerDto {
  fullName?: string;
  phoneNumber?: string;
  address?: string | null;
  preferredContactMethod?: string;
  emergencyContact?: string | null;
}

export interface PetOwnerResponse {
  petOwnerId: number;
  accountId: number;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  preferredContactMethod: string;
  emergencyContact: string | null;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MEDICAL RECORD TYPES
// ============================================================================

export interface CreateMedicalRecordDto {
  petId: number;
  veterinarianId: number;
  diagnosis: string;
  treatment: string;
  appointmentId?: number;
  medicalSummary?: Record<string, unknown>;
  followUpDate?: string;
}

export interface UpdateMedicalRecordDto {
  diagnosis?: string;
  treatment?: string;
  appointmentId?: number;
  medicalSummary?: Record<string, unknown>;
  followUpDate?: string;
}

export interface MedicalRecordResponse {
  id: number;
  petId: number;
  veterinarianId: number;
  appointmentId: number | null;
  diagnosis: string;
  treatment: string;
  medicalSummary: object | null;
  followUpDate: string | null;
  isFollowUpOverdue: boolean;
  needsFollowUp: boolean;
  examinationDate: string;
  createdAt: string;
}

// ============================================================================
// WORK SCHEDULE TYPES
// ============================================================================

export interface CreateWorkScheduleDto {
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

export interface UpdateWorkScheduleDto {
  employeeId?: number;
  workDate?: string;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
  notes?: string;
}

export interface WorkScheduleResponse {
  id: number;
  employeeId: number;
  workDate: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isAvailable: boolean;
  notes: string | null;
  workingHours: number;
  createdAt: string;
}

// ============================================================================
// CAGE TYPES
// ============================================================================

export interface CreateCageDto {
  cageNumber: string;
  size: CageSize;
  location?: string;
  dailyRate: number;
  notes?: string;
}

export interface UpdateCageDto {
  cageNumber?: string;
  size?: CageSize;
  location?: string;
  status?: CageStatus;
  dailyRate?: number;
  notes?: string;
}

export interface AssignCageDto {
  petId: number;
  checkInDate: string;
  expectedCheckOutDate?: string;
  dailyRate?: number;
  notes?: string;
  assignedById?: number;
}

export interface CageResponse {
  id: number;
  cageNumber: string;
  size: CageSize;
  location: string | null;
  status: CageStatus;
  dailyRate: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CageAssignmentResponse {
  id: number;
  cageId: number;
  petId: number;
  checkInDate: string;
  checkOutDate: string | null;
  expectedCheckOutDate: string | null;
  dailyRate: number;
  totalCost: number;
  status: CageAssignmentStatus;
  notes: string | null;
  assignedById: number | null;
  createdAt: string;
}

// ============================================================================
// VACCINATION TYPES
// ============================================================================

export interface CreateVaccinationDto {
  vaccineTypeId: number;
  administeredBy: number;
  administrationDate: string;
  batchNumber?: string;
  site?: string;
  reactions?: string;
  notes?: string;
  medicalRecordId?: number;
}

export interface VaccinationResponse {
  id: number;
  petId: number;
  vaccineTypeId: number;
  administrationDate: string;
  nextDueDate: string | null;
  isDue: boolean;
  daysUntilDue: number | null;
  batchNumber: string | null;
  site: string | null;
  reactions: string | null;
  notes: string | null;
  administeredBy: number | null;
  createdAt: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface CreateAuditLogDto {
  tableName: string;
  recordId: number;
  operation: AuditOperation;
  changes?: object;
  actorAccountId?: number;
  actorType?: ActorType;
  ipAddress?: string;
}

export interface AuditLogResponse {
  id: number;
  tableName: string;
  recordId: number;
  operation: AuditOperation;
  changes: object | null;
  actorAccountId: number | null;
  actorType: ActorType | null;
  ipAddress: string | null;
  timestamp: string;
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

/**
 * Query parameters for GET /api/appointments
 */
export interface GetAppointmentsQuery {
  status?: AppointmentStatus;
  petId?: number;
  employeeId?: number;
  date?: string;
}

/**
 * Query parameters for GET /api/appointments/by-date-range
 */
export interface GetAppointmentsByDateRangeQuery {
  startDate: string;
  endDate: string;
  employeeId?: number;
}

/**
 * Query parameters for GET /api/appointments/by-status
 */
export interface GetAppointmentsByStatusQuery {
  status: AppointmentStatus;
}

/**
 * Query parameters for GET /api/invoices
 */
export interface GetInvoicesQuery {
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Query parameters for GET /api/payments
 */
export interface GetPaymentsQuery {
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

/**
 * Query parameters for GET /api/cages
 */
export interface GetCagesQuery {
  size?: CageSize;
  isAvailable?: boolean;
}

/**
 * Query parameters for GET /api/cages/available
 */
export interface GetAvailableCagesQuery {
  size?: CageSize;
  dateRange?: string;
}

/**
 * Query parameters for GET /api/reports/financial
 */
export interface GetFinancialReportQuery {
  startDate: string;
  endDate: string;
}

/**
 * Query parameters for GET /api/reports/revenue
 */
export interface GetRevenueByPeriodQuery {
  period: "month" | "quarter" | "year";
  year: number;
}

/**
 * Query parameters for GET /api/reports/appointments
 */
export interface GetAppointmentStatisticsQuery {
  startDate: string;
  endDate: string;
}

/**
 * Query parameters for GET /api/reports/services/top
 */
export interface GetTopServicesQuery {
  limit?: number;
  startDate: string;
  endDate: string;
  sortBy?: "count" | "revenue";
}

/**
 * Query parameters for GET /api/reports/services/performance
 */
export interface GetServicePerformanceQuery {
  startDate: string;
  endDate: string;
}

/**
 * Query parameters for GET /api/reports/employees/workload
 */
export interface GetEmployeeWorkloadQuery {
  startDate: string;
  endDate: string;
}

/**
 * Query parameters for GET /api/reports/customers/retention
 */
export interface GetCustomerRetentionQuery {
  startDate: string;
  endDate: string;
}

// ============================================================================
// REPORT TYPES (Ad-hoc structures)
// ============================================================================

export interface RevenueReportQuery {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

export interface AppointmentStatsQuery {
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
}

export interface ServiceStatsQuery {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

export interface EmployeePerformanceQuery {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}
