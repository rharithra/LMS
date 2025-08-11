# Attendance & Time Tracking Features

This document outlines the new attendance and time tracking features that have been integrated into the Leave Management System.

## Features Overview

### 1. Daily Attendance Marking
- **Manual Check-in/Check-out**: Employees can manually mark their attendance
- **Biometric Integration Ready**: System is designed to support biometric devices
- **Location Tracking**: Optional location tracking for check-in/check-out
- **Method Tracking**: Records whether attendance was marked manually, via biometric, or system

### 2. Shift Scheduling & Rotation
- **Shift Management**: Create and manage different work shifts
- **Shift Assignment**: Assign shifts to departments or specific employees
- **Flexible Timing**: Support for overnight shifts and custom break times
- **Visual Indicators**: Color-coded shifts for easy identification

### 3. Overtime Calculation
- **Automatic Calculation**: System automatically calculates overtime hours
- **Configurable Standards**: 8-hour standard work day (configurable)
- **Overtime Tracking**: Separate tracking for overtime hours and regular hours

### 4. Late Arrival & Early Leave Tracking
- **Late Detection**: Automatically detects late arrivals (30+ minutes after start time)
- **Early Leave Detection**: Tracks early departures (60+ minutes before end time)
- **Minute-level Precision**: Tracks exact minutes of lateness/early departure
- **Status Classification**: Automatic status assignment (present, late, early_leave, etc.)

### 5. Monthly Attendance Reports
- **Comprehensive Reports**: Detailed monthly attendance reports
- **Employee Filtering**: Filter reports by specific employees
- **Export Functionality**: Export reports to CSV format
- **Summary Statistics**: Overview of attendance patterns and trends

## Database Models

### Attendance Model
```javascript
{
  userId: ObjectId,           // Reference to User
  date: Date,                 // Attendance date
  checkIn: {
    time: Date,               // Check-in time
    method: String,           // 'manual', 'biometric', 'system'
    location: String          // Optional location
  },
  checkOut: {
    time: Date,               // Check-out time
    method: String,           // 'manual', 'biometric', 'system'
    location: String          // Optional location
  },
  shift: ObjectId,            // Reference to Shift
  status: String,             // 'present', 'late', 'absent', 'early_leave', 'overtime'
  totalHours: Number,         // Total hours worked
  overtimeHours: Number,      // Overtime hours
  lateMinutes: Number,        // Minutes late
  earlyLeaveMinutes: Number,  // Minutes early departure
  notes: String,              // Additional notes
  approvedBy: ObjectId,       // Reference to approving manager
  approvedAt: Date            // Approval timestamp
}
```

### Shift Model
```javascript
{
  name: String,               // Shift name
  startTime: String,          // Start time (HH:MM format)
  endTime: String,            // End time (HH:MM format)
  breakTime: Number,          // Break time in minutes
  totalHours: Number,         // Calculated total hours
  isActive: Boolean,          // Whether shift is active
  description: String,        // Shift description
  color: String,              // Color for UI display
  department: ObjectId        // Reference to Department (optional)
}
```

## API Endpoints

### Attendance Endpoints
- `GET /api/attendance` - Get all attendance records (admin only)
- `GET /api/attendance/my-attendance` - Get user's own attendance
- `POST /api/attendance/check-in` - Check in for the day
- `POST /api/attendance/check-out` - Check out for the day
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/monthly-report` - Get monthly attendance report
- `PUT /api/attendance/:id` - Update attendance record (admin only)
- `DELETE /api/attendance/:id` - Delete attendance record (admin only)

### Shift Endpoints
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/:id` - Get single shift
- `POST /api/shifts` - Create new shift (admin only)
- `PUT /api/shifts/:id` - Update shift (admin only)
- `DELETE /api/shifts/:id` - Delete shift (admin only)

## Frontend Components

### 1. Attendance Page (`/attendance`)
- Daily check-in/check-out functionality
- Real-time attendance status
- Attendance history table
- Statistics cards showing attendance metrics

### 2. Shifts Page (`/shifts`)
- Shift management interface (admin only)
- Create, edit, and delete shifts
- Visual shift cards with color coding
- Department assignment options

### 3. Attendance Reports Page (`/attendance-reports`)
- Monthly attendance reports (managers and admins)
- Employee filtering options
- CSV export functionality
- Detailed attendance breakdowns

### 4. Dashboard Integration
- Attendance statistics in dashboard
- Quick overview of attendance metrics
- Integration with existing dashboard layout

## User Roles & Permissions

### Employee
- View own attendance records
- Check in/out daily
- View attendance statistics
- Access attendance history

### Manager
- All employee permissions
- View team attendance reports
- Generate monthly reports
- Export attendance data

### Admin
- All manager permissions
- Manage shifts
- Create/edit/delete shifts
- Full attendance management
- System-wide attendance reports

## Configuration Options

### Time Settings
- Standard work day: 8 hours (configurable)
- Late threshold: 30 minutes (configurable)
- Early leave threshold: 60 minutes (configurable)
- Default shift times: 9:00 AM - 5:00 PM

### Shift Settings
- Break time: 60 minutes (configurable per shift)
- Overnight shift support
- Department-specific shifts
- Color coding for visual identification

## Future Enhancements

### Planned Features
1. **Biometric Integration**: Direct integration with biometric devices
2. **Mobile App**: Mobile check-in/out functionality
3. **Geofencing**: Location-based attendance validation
4. **Real-time Notifications**: Alerts for late arrivals/early departures
5. **Advanced Analytics**: Attendance trend analysis and predictions
6. **Integration with Payroll**: Automatic overtime calculation for payroll
7. **Leave Integration**: Attendance impact on leave calculations

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live attendance updates
2. **Offline Support**: Offline attendance marking with sync
3. **API Rate Limiting**: Enhanced security for attendance endpoints
4. **Audit Trail**: Comprehensive logging of attendance changes
5. **Data Export**: Additional export formats (PDF, Excel)

## Usage Instructions

### For Employees
1. Navigate to the Attendance page
2. Click "Check In" when arriving at work
3. Click "Check Out" when leaving work
4. View your attendance history and statistics

### For Managers
1. Access Attendance Reports page
2. Select employee and month/year
3. Generate reports and export as needed
4. Monitor team attendance patterns

### For Admins
1. Manage shifts in the Shifts page
2. Create and configure work schedules
3. Monitor system-wide attendance
4. Generate comprehensive reports

## Troubleshooting

### Common Issues
1. **Check-in fails**: Ensure you haven't already checked in today
2. **Check-out fails**: Ensure you have checked in first
3. **No shifts available**: Contact admin to create shifts
4. **Report not loading**: Check date range and employee selection

### Support
For technical issues or questions about the attendance system, please contact your system administrator or refer to the system documentation. 