/**
 * Holiday Utility Functions
 * 
 * Manages holiday/day-off settings using localStorage (frontend-only solution)
 * Used by:
 * - Manager: Set recurring days off (Saturday/Sunday) and specific holidays
 * - Owner: Check if selected date is a holiday when booking appointments
 */

const STORAGE_KEY = 'paw_lovers_holiday_settings';

// Default settings
const DEFAULT_SETTINGS = {
    holidays: [],
    recurringDaysOff: {
        saturday: { enabled: false, reason: 'Thứ Bảy - Nghỉ cuối tuần' },
        sunday: { enabled: false, reason: 'Chủ Nhật - Nghỉ cuối tuần' }
    }
};

/**
 * Get holiday settings from localStorage
 * @returns {Object} Holiday settings
 */
export function getHolidaySettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_SETTINGS;

        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            recurringDaysOff: {
                ...DEFAULT_SETTINGS.recurringDaysOff,
                ...(parsed.recurringDaysOff || {})
            }
        };
    } catch (error) {
        console.error('Error loading holiday settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save holiday settings to localStorage
 * @param {Object} settings - Holiday settings to save
 */
export function saveHolidaySettings(settings) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving holiday settings:', error);
    }
}

/**
 * Check if a date is a holiday (specific or recurring)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Object} { isHoliday: boolean, reason: string | null }
 */
export function getHolidayInfo(dateString) {
    if (!dateString) return { isHoliday: false, reason: null };

    const settings = getHolidaySettings();

    // Parse date parts manually to avoid timezone issues
    // dateString format: YYYY-MM-DD
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date at noon local time to avoid timezone shifts
    const date = new Date(year, month - 1, day, 12, 0, 0);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    console.log('[HolidayUtils] Checking date:', dateString, 'dayOfWeek:', dayOfWeek, 'settings:', settings);

    // Check specific holidays first
    const specificHoliday = settings.holidays.find(h => h.date === dateString);
    if (specificHoliday) {
        console.log('[HolidayUtils] Found specific holiday:', specificHoliday);
        return { isHoliday: true, reason: specificHoliday.reason, type: 'specific' };
    }

    // Check recurring days off
    if (dayOfWeek === 0 && settings.recurringDaysOff.sunday?.enabled) {
        console.log('[HolidayUtils] Sunday is enabled as day off');
        return {
            isHoliday: true,
            reason: settings.recurringDaysOff.sunday.reason || 'Chủ Nhật - Nghỉ cuối tuần',
            type: 'recurring'
        };
    }

    if (dayOfWeek === 6 && settings.recurringDaysOff.saturday?.enabled) {
        console.log('[HolidayUtils] Saturday is enabled as day off');
        return {
            isHoliday: true,
            reason: settings.recurringDaysOff.saturday.reason || 'Thứ Bảy - Nghỉ cuối tuần',
            type: 'recurring'
        };
    }

    return { isHoliday: false, reason: null };
}

/**
 * Simple check if date is a holiday
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {boolean}
 */
export function isHoliday(dateString) {
    return getHolidayInfo(dateString).isHoliday;
}

/**
 * Get reason for a holiday date
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string|null}
 */
export function getHolidayReason(dateString) {
    return getHolidayInfo(dateString).reason;
}

/**
 * Add a specific holiday
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} reason - Reason for the holiday
 */
export function addHoliday(date, reason) {
    const settings = getHolidaySettings();

    // Check if already exists
    const existingIndex = settings.holidays.findIndex(h => h.date === date);
    if (existingIndex >= 0) {
        settings.holidays[existingIndex].reason = reason;
    } else {
        settings.holidays.push({ date, reason, type: 'specific' });
    }

    // Sort by date
    settings.holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveHolidaySettings(settings);
    return settings;
}

/**
 * Remove a specific holiday
 * @param {string} date - Date in YYYY-MM-DD format
 */
export function removeHoliday(date) {
    const settings = getHolidaySettings();
    settings.holidays = settings.holidays.filter(h => h.date !== date);
    saveHolidaySettings(settings);
    return settings;
}

/**
 * Set recurring day off (Saturday or Sunday)
 * @param {'saturday' | 'sunday'} day - Day of week
 * @param {boolean} enabled - Whether to enable
 * @param {string} reason - Custom reason
 */
export function setRecurringDayOff(day, enabled, reason) {
    const settings = getHolidaySettings();

    if (day === 'saturday' || day === 'sunday') {
        settings.recurringDaysOff[day] = {
            enabled,
            reason: reason || (day === 'saturday' ? 'Thứ Bảy - Nghỉ cuối tuần' : 'Chủ Nhật - Nghỉ cuối tuần')
        };
    }

    saveHolidaySettings(settings);
    return settings;
}

/**
 * Get all holidays for a specific month (for calendar display)
 * @param {number} year 
 * @param {number} month - 0-indexed (0 = January)
 * @returns {Array} Array of { date, reason, type }
 */
export function getHolidaysInMonth(year, month) {
    const holidays = [];

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        // Format date string manually to avoid timezone issues
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const holidayInfo = getHolidayInfo(dateString);

        if (holidayInfo.isHoliday) {
            holidays.push({
                date: dateString,
                day,
                reason: holidayInfo.reason,
                type: holidayInfo.type
            });
        }
    }

    return holidays;
}

/**
 * Format date to Vietnamese readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string}
 */
export function formatDateVN(dateString) {
    // Parse date parts manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
