# User Account - Addresses & Notifications Feature ✅

## Overview
Created two complete new sections in the user account dashboard:
1. **Saved Addresses** - Manage delivery addresses
2. **Notifications** - View and manage notifications

Both features are fully functional with complete UI and API backends.

---

## 1. SAVED ADDRESSES FEATURE

### Frontend: `/account/addresses`
**File:** `src/app/(main)/account/addresses/page.tsx`

**Features:**
✅ View all saved addresses
✅ Add new address with form dialog
✅ Edit existing addresses
✅ Delete addresses
✅ Set default address
✅ Address labels (Home, Office, etc.)
✅ Full address management (Name, Phone, Full Address, City, State, Postal Code, Country)
✅ Loading states and error handling
✅ Responsive grid layout (Mobile, Tablet, Desktop)

**Key UI Components:**
- Empty state with call-to-action
- Address cards with all details
- Action buttons (Edit, Delete, Set as Default)
- Add Address form dialog
- Toast notifications for feedback

**Address Form Fields:**
- Label (e.g., Home, Office)
- Full Name (required)
- Phone Number (required)
- Address Line (required)
- City (required)
- State/Province (optional)
- Postal Code (optional)
- Country (Pakistan - read-only)
- Set as Default (checkbox)

### Backend APIs for Addresses

#### GET `/api/user/addresses`
**Purpose:** Fetch all addresses for the logged-in user
**Returns:** 
```json
{
  "addresses": [
    {
      "_id": "...",
      "label": "Home",
      "fullName": "John Doe",
      "phone": "+92 300 1234567",
      "address": "123 Main St",
      "city": "Lahore",
      "state": "Punjab",
      "postalCode": "54000",
      "country": "Pakistan",
      "isDefault": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### POST `/api/user/addresses`
**Purpose:** Create a new address
**Body:** Address object
**Returns:** Updated addresses list
**Note:** If `isDefault: true`, automatically unsets other defaults

#### PUT `/api/user/addresses/[id]`
**Purpose:** Update an address
**Body:** Updated address object
**Returns:** Updated addresses list

#### DELETE `/api/user/addresses/[id]`
**Purpose:** Delete an address
**Returns:** Updated addresses list

#### PUT `/api/user/addresses/[id]/default`
**Purpose:** Set an address as default
**Returns:** Updated addresses list
**Note:** Automatically unsets previous default address

**Files Created:**
- `src/app/api/user/addresses/route.ts` (GET, POST, DELETE)
- `src/app/api/user/addresses/[id]/route.ts` (PUT, DELETE)
- `src/app/api/user/addresses/[id]/default/route.ts` (PUT)

---

## 2. NOTIFICATIONS FEATURE

### Frontend: `/account/notifications`
**File:** `src/app/(main)/account/notifications/page.tsx`

**Features:**
✅ View all notifications
✅ Filter by read/unread status
✅ Mark individual notifications as read
✅ Mark all notifications as read
✅ Delete individual notifications
✅ Clear all notifications
✅ Notification type badges with icons
✅ Unread count indicator
✅ Clickable links to related orders/services
✅ Timestamp for each notification
✅ Color-coded by notification type

**Notification Types:**
- 🔵 ORDER_PLACED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
- 💚 PAYMENT_RECEIVED, PAYMENT_FAILED
- 🔧 SERVICE_REQUEST_SUBMITTED, SERVICE_REQUEST_UPDATED, SERVICE_COMPLETED
- 📢 PROMOTIONAL, WELCOME
- ⚠️ SYSTEM messages

**Key UI Components:**
- Unread count display
- Filter tabs (All / Unread)
- Empty states
- Notification cards with:
  - Type icon with color
  - Title and message
  - Timestamp
  - Type badge
  - Unread indicator (dot)
  - View button (if link exists)
  - Mark as read button
  - Delete button

**Color Coding:**
- Blue: Orders, System
- Green: Payments, Delivery
- Purple: Shipping
- Orange: Service Updates
- Red: Alerts, Failed Payments
- Pink: Promotions

### Backend APIs for Notifications

#### GET `/api/user/notifications`
**Purpose:** Fetch all notifications for the user
**Query Parameters:**
- `limit` (default: 50) - Results per page
- `page` (default: 1) - Page number
**Returns:**
```json
{
  "notifications": [
    {
      "_id": "...",
      "type": "ORDER_PLACED",
      "title": "Order Placed Successfully!",
      "message": "Your order #ORD001 has been placed",
      "link": "/account/orders/123",
      "isRead": false,
      "createdAt": "..."
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

#### PUT `/api/user/notifications/[id]/read`
**Purpose:** Mark a notification as read
**Returns:** `{ "success": true }`

#### DELETE `/api/user/notifications/[id]`
**Purpose:** Delete a notification
**Returns:** `{ "success": true }`

#### PUT `/api/user/notifications/mark-all-read`
**Purpose:** Mark all notifications as read
**Returns:** `{ "success": true }`

#### DELETE `/api/user/notifications`
**Purpose:** Delete all notifications
**Returns:** `{ "success": true }`

**Files Created:**
- `src/app/api/user/notifications/route.ts` (GET, DELETE, PUT for mark all)
- `src/app/api/user/notifications/[id]/route.ts` (PUT for mark read, DELETE)
- `src/app/api/user/notifications/mark-all-read/route.ts` (PUT)

---

## Database Models Used

### Address Model (Existing)
```typescript
interface IAddress {
  _id: ObjectId;
  userId: ObjectId; // Reference to User
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Model (Existing)
```typescript
interface INotification {
  _id: ObjectId;
  userId: ObjectId; // Reference to User
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  orderId?: string;
  serviceRequestId?: string;
  createdAt: Date;
}
```

---

## Navigation Integration

Both pages are automatically available in the account sidebar:

**Path:** `/account` → Sidebar → "Addresses" or "Notifications"

The sidebar in `src/app/(main)/account/layout.tsx` already includes these navigation items with icons.

---

## Authentication & Security

✅ All APIs require user authentication
✅ Users can only access their own addresses and notifications
✅ Validation on all inputs
✅ Error handling with appropriate status codes

---

## How to Use

### For Users - Addresses:
1. Navigate to `/account`
2. Click "Addresses" in sidebar
3. Click "Add Address" button
4. Fill in address details
5. Check "Set as Default" if desired
6. Click "Save Address"
7. View all addresses in grid
8. Edit or Delete as needed

### For Users - Notifications:
1. Navigate to `/account`
2. Click "Notifications" in sidebar
3. View all notifications
4. Filter by "All" or "Unread"
5. Click "View" on notification to go to order/service
6. Click ✓ to mark as read
7. Click 🗑️ to delete
8. Use "Mark all as read" or "Clear all" buttons

---

## Technical Details

### Dependencies Used:
- Next.js 14.1.0
- React (hooks: useState, useEffect)
- NextAuth (auth session)
- Mongoose (database)
- Zod (validation)
- Lucide React (icons)
- Custom UI components

### Security Features:
✅ Authentication required for all endpoints
✅ User ownership verification
✅ Input validation with Zod
✅ Error handling
✅ Proper HTTP status codes

### Performance:
✅ Pagination for notifications (50 per page default)
✅ Proper indexing on MongoDB collections
✅ Lean queries for read operations
✅ Efficient sorting

---

## File Structure Created

```
src/
├── app/
│   ├── (main)/
│   │   └── account/
│   │       ├── addresses/
│   │       │   └── page.tsx ✅
│   │       └── notifications/
│   │           └── page.tsx ✅
│   └── api/
│       └── user/
│           ├── addresses/
│           │   ├── route.ts ✅
│           │   ├── [id]/
│           │   │   ├── route.ts ✅
│           │   │   └── default/
│           │   │       └── route.ts ✅
│           └── notifications/
│               ├── route.ts ✅
│               ├── [id]/
│               │   └── route.ts ✅
│               └── mark-all-read/
│                   └── route.ts ✅
```

---

## Testing

To test the features:

1. **Login** as a user at `/auth/login`
2. **Navigate** to `/account/addresses`
   - Try adding, editing, deleting addresses
   - Test setting default address
3. **Navigate** to `/account/notifications`
   - Mark notifications as read
   - Delete notifications
   - Filter by unread

---

## Status: ✅ COMPLETE

All features have been fully implemented with:
- ✅ Complete UI with proper styling
- ✅ Full CRUD operations
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Database integration
- ✅ Authentication
- ✅ Validation

The Addresses and Notifications sections are now ready to use in the user account dashboard!
