/**
 * ID Formatter Utilities
 * 
 * Provides consistent ID formatting functions for different entity types
 * across the application. All IDs are converted to padded strings with
 * appropriate prefixes.
 * 
 * @module lib/utils/id-formatter
 */

/**
 * Format customer (pet owner) ID
 * @param {number|string} id - The customer ID
 * @returns {string} Formatted ID (e.g., "CUS0001")
 * @example
 * formatCustomerId(1) // => "CUS0001"
 * formatCustomerId(123) // => "CUS0123"
 */
export const formatCustomerId = (id) => {
  if (id == null) return 'N/A';
  return `CUS${String(id).padStart(4, '0')}`;
};

/**
 * Format appointment ID
 * @param {number|string} id - The appointment ID
 * @returns {string} Formatted ID (e.g., "APT001")
 * @example
 * formatAppointmentId(1) // => "APT001"
 * formatAppointmentId(123) // => "APT123"
 */
export const formatAppointmentId = (id) => {
  if (id == null) return 'N/A';
  return `APT${String(id).padStart(3, '0')}`;
};

/**
 * Format invoice ID
 * @param {number|string} id - The invoice ID
 * @returns {string} Formatted ID (e.g., "INV0001")
 * @example
 * formatInvoiceId(1) // => "INV0001"
 * formatInvoiceId(999) // => "INV0999"
 */
export const formatInvoiceId = (id) => {
  if (id == null) return 'N/A';
  return `INV${String(id).padStart(4, '0')}`;
};

/**
 * Format service ID
 * @param {number|string} id - The service ID
 * @returns {string} Formatted ID (e.g., "SRV001")
 * @example
 * formatServiceId(1) // => "SRV001"
 * formatServiceId(50) // => "SRV050"
 */
export const formatServiceId = (id) => {
  if (id == null) return 'N/A';
  return `SRV${String(id).padStart(3, '0')}`;
};

/**
 * Format pet ID
 * @param {number|string} id - The pet ID
 * @returns {string} Formatted ID (e.g., "PET001")
 * @example
 * formatPetId(1) // => "PET001"
 * formatPetId(42) // => "PET042"
 */
export const formatPetId = (id) => {
  if (id == null) return 'N/A';
  return `PET${String(id).padStart(3, '0')}`;
};

/**
 * Format employee ID
 * @param {number|string} id - The employee ID
 * @returns {string} Formatted ID (e.g., "NV0001")
 * @example
 * formatEmployeeId(1) // => "NV0001"
 * formatEmployeeId(250) // => "NV0250"
 */
export const formatEmployeeId = (id) => {
  if (id == null) return 'N/A';
  return `NV${String(id).padStart(4, '0')}`;
};

/**
 * Format medical record ID
 * @param {number|string} id - The medical record ID
 * @returns {string} Formatted ID (e.g., "REC001")
 * @example
 * formatMedicalRecordId(1) // => "REC001"
 * formatMedicalRecordId(99) // => "REC099"
 */
export const formatMedicalRecordId = (id) => {
  if (id == null) return 'N/A';
  return `REC${String(id).padStart(3, '0')}`;
};

/**
 * Format cage ID/code
 * @param {number|string} id - The cage ID or code
 * @returns {string} Formatted ID (e.g., "CAGE001")
 * @example
 * formatCageId(1) // => "CAGE001"
 * formatCageId("A01") // => "A01"
 */
export const formatCageId = (id) => {
  if (id == null) return 'N/A';
  // If already a cage code (contains letters), return as-is
  if (typeof id === 'string' && /[A-Z]/i.test(id)) {
    return id.toUpperCase();
  }
  return `CAGE${String(id).padStart(3, '0')}`;
};

/**
 * Format payment ID
 * @param {number|string} id - The payment ID
 * @returns {string} Formatted ID (e.g., "PAY0001")
 * @example
 * formatPaymentId(1) // => "PAY0001"
 * formatPaymentId(500) // => "PAY0500"
 */
export const formatPaymentId = (id) => {
  if (id == null) return 'N/A';
  return `PAY${String(id).padStart(4, '0')}`;
};

/**
 * Format account ID
 * @param {number|string} id - The account ID
 * @returns {string} Formatted ID (e.g., "ACC001")
 * @example
 * formatAccountId(1) // => "ACC001"
 * formatAccountId(25) // => "ACC025"
 */
export const formatAccountId = (id) => {
  if (id == null) return 'N/A';
  return `ACC${String(id).padStart(3, '0')}`;
};

/**
 * Format owner ID (alternative to customer ID)
 * @param {number|string} id - The owner ID
 * @returns {string} Formatted ID (e.g., "OWN0000001")
 * @example
 * formatOwnerId(1) // => "OWN0000001"
 * formatOwnerId(123) // => "OWN0000123"
 */
export const formatOwnerId = (id) => {
  if (id == null) return 'N/A';
  return `OWN${String(id).padStart(7, '0')}`;
};

/**
 * Generic ID formatter that detects the entity type and formats accordingly
 * @param {string} entityType - The type of entity ('customer', 'appointment', 'invoice', etc.)
 * @param {number|string} id - The ID to format
 * @returns {string} Formatted ID
 * @example
 * formatId('customer', 1) // => "CUS0001"
 * formatId('appointment', 5) // => "APT005"
 */
export const formatId = (entityType, id) => {
  if (id == null) return 'N/A';
  
  const formatters = {
    customer: formatCustomerId,
    petowner: formatCustomerId,
    'pet-owner': formatCustomerId,
    appointment: formatAppointmentId,
    invoice: formatInvoiceId,
    service: formatServiceId,
    pet: formatPetId,
    employee: formatEmployeeId,
    staff: formatEmployeeId,
    record: formatMedicalRecordId,
    medical: formatMedicalRecordId,
    'medical-record': formatMedicalRecordId,
    cage: formatCageId,
    payment: formatPaymentId,
    account: formatAccountId,
    owner: formatOwnerId,
  };

  const formatter = formatters[entityType.toLowerCase()];
  return formatter ? formatter(id) : String(id);
};

/**
 * Format multiple IDs of the same type
 * @param {string} entityType - The type of entity
 * @param {Array<number|string>} ids - Array of IDs to format
 * @returns {Array<string>} Array of formatted IDs
 * @example
 * formatIds('appointment', [1, 2, 3]) // => ["APT001", "APT002", "APT003"]
 */
export const formatIds = (entityType, ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => formatId(entityType, id));
};

// Default export with all formatters
export default {
  formatCustomerId,
  formatAppointmentId,
  formatInvoiceId,
  formatServiceId,
  formatPetId,
  formatEmployeeId,
  formatMedicalRecordId,
  formatCageId,
  formatPaymentId,
  formatAccountId,
  formatOwnerId,
  formatId,
  formatIds,
};
