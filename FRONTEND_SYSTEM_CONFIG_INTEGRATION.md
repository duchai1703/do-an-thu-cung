# Frontend Integration - System Config & Persistent Days Off

## ✅ What Was Added

### 1. **New API Client** - `system-config.js`

- Complete API client for system configuration endpoints
- Methods for persistent days off management
- Exported from main API index

### 2. **Holidays Page Updates** (`/dashboard/manager/holidays`)

#### New Features:

- **🔁 Recurring Days Off Section**: Interactive UI to toggle days of the week as persistent day-offs
- **Enhanced Calendar Preview**: Shows both specific holidays (amber) and recurring days off (purple)
- **Updated Legend**: Distinguishes between persistent days and specific holidays
- **Smart Holiday Detection**: Combines specific holidays with recurring weekly patterns

#### UI Components:

- 7 clickable day buttons (Sunday-Saturday) with visual feedback
- Selected days highlighted with color coding (red for Sunday, blue for Saturday)
- Info box explaining the impact of persistent days off
- Calendar now shows different colors for different holiday types

### 3. **Schedules Page Updates** (`/dashboard/manager/schedules`)

#### New Features:

- **Persistent Days Off Info Banner**: Shows configured recurring days off at the top
- **Visual Day-Off Indicators**: Calendar cells show locked status for persistent day-offs
- **Disabled "Add Schedule" Button**: Cannot add schedules on persistent day-off dates
- **Warning in Modal**: Alert shown when selecting a persistent day-off date
- **Grayed Out Columns**: Week view visually distinguishes persistent day-off days

#### Backend Integration:

- Loads persistent days off configuration on page load
- Validates dates before allowing schedule creation
- Shows clear error messages from backend validation

## 🎨 Visual Design

### Holidays Page

- **Recurring Days**: Purple theme with 🔁 icon
- **Specific Holidays**: Amber theme with 🎊 icon
- **Interactive Toggles**: Click to enable/disable persistent days
- **Calendar Colors**:
  - Purple ring = Recurring day off
  - Amber ring = Specific holiday

### Schedules Page

- **Day-Off Banner**: Purple/pink gradient at top
- **Locked Days**: Gray background with 🔒 icon
- **Warning Modal**: Red alert box for persistent day-off dates
- **Header Indicators**: Shows "🔒 Nghỉ" in week header

## 📋 User Flow

### Setting Up Persistent Days Off

1. Navigate to `/dashboard/manager/holidays`
2. See "🔁 Ngày Nghỉ Cố Định" section at top
3. Click on day buttons to toggle (e.g., Sunday, Saturday)
4. Changes save immediately with success toast
5. Calendar preview updates to show recurring patterns

### Creating Schedules

1. Navigate to `/dashboard/manager/schedules`
2. View info banner showing configured persistent days
3. Week view shows grayed-out days with lock icon
4. Cannot click "➕ Thêm ca" button on locked days
5. If date is selected in modal, warning appears
6. Backend validates and rejects schedules on persistent days

## 🧪 Testing Checklist

### Holidays Page

- [ ] Toggle Sunday as persistent day off
- [ ] Toggle Saturday as persistent day off
- [ ] Toggle multiple days
- [ ] Untoggle a day
- [ ] View calendar preview showing purple recurring days
- [ ] Navigate months to see pattern repeating
- [ ] Add specific holiday on same day as persistent day-off
- [ ] Calendar shows specific holiday taking precedence

### Schedules Page

- [ ] Info banner shows configured days (if any)
- [ ] Week view shows locked days visually
- [ ] Cannot add schedule on locked day from week view
- [ ] Modal shows warning when persistent day-off date selected
- [ ] Try to submit schedule on persistent day-off (should fail with error)
- [ ] Submit schedule on normal day (should succeed)
- [ ] View existing schedules on all days properly

### Integration

- [ ] Set Sunday as persistent day-off in holidays page
- [ ] Go to schedules page, verify Sunday is locked
- [ ] Try to create Sunday schedule, verify error message
- [ ] Remove Sunday from persistent days
- [ ] Go to schedules page, verify Sunday is unlocked
- [ ] Can now create Sunday schedule successfully

## 🔧 API Endpoints Used

```javascript
// Get persistent days off
GET /api/system-config/persistent-days-off
Response: [0, 6] // Array of day numbers

// Set persistent days off
PUT /api/system-config/persistent-days-off
Body: { "daysOff": [0] }
Response: SystemConfigResponseDto

// Create schedule (validates against persistent days)
POST /api/schedules
Body: { employeeId, workDate, startTime, endTime }
Error: 400 if workDate falls on persistent day-off
```

## 📱 Mobile Responsiveness

- Day toggle buttons stack properly
- Calendar stays scrollable
- Week view scrolls horizontally
- Modals resize for mobile screens

## 🎯 Benefits

1. **Prevents Scheduling Errors**: Automatically blocks schedules on configured days
2. **Flexible Configuration**: Easy for managers to adjust recurring days
3. **Clear Visual Feedback**: Users immediately see which days are restricted
4. **Consistent Enforcement**: Backend validates even if frontend bypassed
5. **Better UX**: Warnings before submission, not just errors after

## 🚀 Future Enhancements

Potential improvements:

- Export/import holiday configurations
- Recurring holidays (e.g., every first Monday)
- Department-specific persistent days
- Temporary overrides for specific dates
- Holiday templates (country-specific)
- Bulk schedule operations with validation

## 📝 Notes

- Day numbers: 0=Sunday, 1=Monday, ..., 6=Saturday
- Backend is the source of truth for validation
- Frontend provides preemptive UX to avoid errors
- Persistent days apply globally to all employees
- Specific holidays take precedence in calendar display
