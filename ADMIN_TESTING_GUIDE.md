# Admin Dashboard - Quick Reference & Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
python manage.py runserver
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Admin Dashboard
- URL: `http://localhost:5173/admin/login`
- Email: `admin@example.com`
- Password: `Admin@123`

## 📍 Navigation Map

```
Admin Dashboard
├── /admin/dashboard ..................... Main Dashboard
├── /admin/users ......................... User Management
├── /admin/signatures .................... Signature Management
├── /admin/verification .................. Verification Management
├── /admin/reports ....................... Reports & Analytics
├── /admin/notifications ................. Notifications
├── /admin/activity ...................... Activity Logs
├── /admin/model ......................... ML Models
├── /admin/fraud ......................... Fraud Monitoring
├── /admin/audit ......................... Audit Trail
└── /admin/settings ...................... Settings
```

## ✅ Component Checklist

### Dashboard (`/admin/dashboard`)
- [ ] Page loads with 4 metric cards
- [ ] Metric cards show correct values
- [ ] Trend indicators visible (up/down arrows)
- [ ] Area chart displays 7-day data
- [ ] Pie chart shows genuine vs forged ratio
- [ ] Recent verifications table shows 5 items
- [ ] Top users leaderboard visible
- [ ] Refresh button works (shows spinner)
- [ ] Export button clickable
- [ ] All hover effects work

### User Management (`/admin/users`)
- [ ] Page loads with user list
- [ ] Search field filters users in real-time
- [ ] Status filter works (Active, Blocked, Inactive)
- [ ] Role filter works (User, Analyst, Admin)
- [ ] User count updates with filters
- [ ] View button opens user details dialog
- [ ] Edit button opens edit dialog
- [ ] Block button changes status to blocked
- [ ] Unblock button changes status to active
- [ ] Delete button removes user
- [ ] Add User button clickable
- [ ] Export button downloads user list
- [ ] Refresh button reloads users
- [ ] Table rows have hover effects
- [ ] Avatar shows user initials
- [ ] MFA status visible

### Verification Management (`/admin/verification`)
- [ ] Page loads with verification list
- [ ] Statistics cards show correct counts
- [ ] Search field filters verifications
- [ ] Result filter works (Genuine, Forged, Pending)
- [ ] Status filter works (Completed, Flagged, Pending)
- [ ] Confidence score shows with progress bar
- [ ] View button opens details dialog
- [ ] Approve button marks as genuine
- [ ] Reject button marks as forged
- [ ] Export button downloads verifications
- [ ] Refresh button reloads verifications
- [ ] Color coding correct (green/red/yellow)
- [ ] Icons display correctly

## 🎯 Interactive Elements Testing

### Buttons
- [ ] All buttons have hover effects
- [ ] All buttons are clickable
- [ ] Buttons show loading state when needed
- [ ] Buttons have correct colors

### Filters
- [ ] Search filters work in real-time
- [ ] Dropdown filters work
- [ ] Multiple filters work together
- [ ] Filter results update table

### Dialogs
- [ ] Dialogs open smoothly
- [ ] Dialogs close on close button
- [ ] Dialogs close on backdrop click
- [ ] Dialog content displays correctly
- [ ] Dialog buttons work

### Navigation
- [ ] Sidebar items navigate correctly
- [ ] Active item highlighted
- [ ] Mobile menu toggle works
- [ ] User menu opens/closes
- [ ] Logout works

## 🎨 UI/UX Testing

### Visual Design
- [ ] Colors match design system
- [ ] Spacing is consistent
- [ ] Typography is correct
- [ ] Icons are visible
- [ ] Gradients display correctly
- [ ] Borders visible
- [ ] Shadows visible

### Responsiveness
- [ ] Mobile view (< 600px)
  - [ ] Sidebar collapses
  - [ ] Grid becomes single column
  - [ ] Buttons stack vertically
  - [ ] Text readable
  
- [ ] Tablet view (600px - 1200px)
  - [ ] Sidebar visible
  - [ ] Grid becomes 2 columns
  - [ ] Layout balanced
  
- [ ] Desktop view (> 1200px)
  - [ ] Sidebar persistent
  - [ ] Grid 4 columns
  - [ ] Full layout visible

### Animations
- [ ] Hover effects smooth
- [ ] Transitions smooth
- [ ] Loading spinner rotates
- [ ] Dialog opens smoothly
- [ ] No lag or stuttering

## 📊 Data Verification

### Dashboard Metrics
- Total Users: 1,286
- Total Verifications: 4,588
- Genuine Signatures: 3,286
- Forged Detected: 521
- Avg Confidence: 91.7%

### Sample Users
1. Ibrahim Ali (USR-1001) - Active
2. Aisha Khan (USR-1002) - Blocked
3. Daniel Smith (USR-1003) - Active
4. Priya Nair (USR-1004) - Inactive
5. Omar Haddad (USR-1005) - Active

### Sample Verifications
1. VER-2401 - Genuine (96%)
2. VER-2402 - Forged (12%)
3. VER-2403 - Genuine (94%)
4. VER-2404 - Pending (0%)
5. VER-2405 - Genuine (98%)

## 🔍 Common Issues & Solutions

### Issue: Page not loading
**Solution**: 
- Check backend is running
- Check frontend dev server is running
- Clear browser cache
- Check console for errors

### Issue: Filters not working
**Solution**:
- Refresh page
- Check data is loaded
- Verify filter values
- Check console for errors

### Issue: Buttons not clickable
**Solution**:
- Check button is not disabled
- Check no overlapping elements
- Try different browser
- Check console for errors

### Issue: Dialogs not opening
**Solution**:
- Check dialog component is rendered
- Verify onClick handler
- Check z-index values
- Check console for errors

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🎯 Performance Targets

- Page Load: < 2s
- Search Response: < 100ms
- Filter Response: < 50ms
- Dialog Open: < 300ms
- Hover Effect: < 200ms

## 📝 Test Scenarios

### Scenario 1: User Search
1. Go to User Management
2. Type "Ibrahim" in search
3. Verify only Ibrahim Ali appears
4. Clear search
5. Verify all users appear

### Scenario 2: Filter Users
1. Go to User Management
2. Select "Active" status
3. Verify only active users shown
4. Select "Admin" role
5. Verify only admin users shown
6. Clear filters
7. Verify all users appear

### Scenario 3: View User Details
1. Go to User Management
2. Click View button on any user
3. Verify dialog opens
4. Verify all user info displayed
5. Click Close button
6. Verify dialog closes

### Scenario 4: Block User
1. Go to User Management
2. Click Block button on active user
3. Verify status changes to "blocked"
4. Verify Unblock button appears
5. Click Unblock button
6. Verify status changes to "active"

### Scenario 5: Verification Approval
1. Go to Verification Management
2. Find pending verification
3. Click Approve button
4. Verify status changes to "Completed"
5. Verify result changes to "Genuine"

## 🚨 Error Handling

### Expected Errors
- [ ] Invalid search returns no results
- [ ] Invalid filter shows empty table
- [ ] Delete shows confirmation
- [ ] Network error shows message
- [ ] Validation error shows message

## ✨ Features Highlight

### Dashboard
- Real-time metrics
- 7-day trend chart
- Genuine vs forged ratio
- Recent activity
- Top performers

### User Management
- Advanced search
- Multi-filter system
- User details view
- Block/Unblock
- Delete users
- Export data

### Verification Management
- Verification tracking
- Confidence scoring
- Status management
- Approve/Reject
- Export reports

## 📞 Support

For issues:
1. Check this guide
2. Review component documentation
3. Check browser console
4. Check network tab
5. Contact support

---

**Last Updated**: 2024-09-20  
**Version**: 1.0.0  
**Status**: Ready for Testing ✅
