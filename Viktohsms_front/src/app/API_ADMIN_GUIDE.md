# 📱 Viktohs SMS - Admin API Integration Guide

**Base URL:** `https://app.viktohs-sms.com/api`

**Authentication:** Bearer Token (sent in `Authorization` header)

**Required Role:** Admin

---

## 📄 Overview

This guide covers **ONLY 2 admin pages**:
1. **Orders Page** - View all user orders/purchases with pagination and search
2. **Top-Up Rate Page** - Manage exchange rates and top-up percentages

---

## 📦 ADMIN ORDERS PAGE

### **API Flow:**

```
1. Page loads
   ↓
2. Fetch orders (page 1)
   GET /auth/admin/getOrder?page=1
   ↓
3. Display orders in table
   ↓
4. User can:
   - Search by email/phone/service
   - Navigate between pages
   - View order details (phone, service, status, OTP, etc.)
```

---

### **1️⃣ Get All Orders (Paginated)**

**Endpoint:** `GET /auth/admin/getOrder?page={page}&search={search}`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `page` (required): Page number (default: 1)
- `search` (optional): Search term (email, phone number, service code)

**Example Requests:**
```
GET /auth/admin/getOrder?page=1
GET /auth/admin/getOrder?page=2
GET /auth/admin/getOrder?page=1&search=john@example.com
GET /auth/admin/getOrder?page=1&search=whatsapp
GET /auth/admin/getOrder?page=1&search=+1202555
```

**Success Response (200):**
```json
{
  "status": true,
  "message": "Orders retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1234,
        "phone_number": "+12025551234",
        "service_code": "wa",
        "country_code": "US",
        "cost": "850.50",
        "otp_code": "123456",
        "status": "received",
        "provider": "smsactivate",
        "created_at": "2024-03-25T10:30:00.000000Z",
        "user": {
          "email": "john@example.com"
        }
      },
      {
        "id": 1233,
        "phone_number": "+79123456789",
        "service_code": "tg",
        "country_code": "RU",
        "cost": "450.00",
        "otp_code": null,
        "status": "waiting",
        "provider": "smsactivate",
        "created_at": "2024-03-25T10:25:00.000000Z",
        "user": {
          "email": "jane@example.com"
        }
      },
      {
        "id": 1232,
        "phone_number": "+16475551111",
        "service_code": "ig",
        "country_code": "CA",
        "cost": "720.00",
        "otp_code": "654321",
        "status": "completed",
        "provider": "smsactivate",
        "created_at": "2024-03-25T10:20:00.000000Z",
        "user": {
          "email": "bob@example.com"
        }
      },
      {
        "id": 1231,
        "phone_number": "+12025559999",
        "service_code": "fb",
        "country_code": "US",
        "cost": "680.00",
        "otp_code": null,
        "status": "cancelled",
        "provider": "smsactivate",
        "created_at": "2024-03-25T10:15:00.000000Z",
        "user": {
          "email": "alice@example.com"
        }
      },
      {
        "id": 1230,
        "phone_number": "+447123456789",
        "service_code": "go",
        "country_code": "GB",
        "cost": "920.00",
        "otp_code": null,
        "status": "expired",
        "provider": "smsactivate",
        "created_at": "2024-03-25T10:10:00.000000Z",
        "user": {
          "email": "mike@example.com"
        }
      }
    ],
    "first_page_url": "https://app.viktohs-sms.com/api/auth/admin/getOrder?page=1",
    "from": 1,
    "last_page": 42,
    "last_page_url": "https://app.viktohs-sms.com/api/auth/admin/getOrder?page=42",
    "next_page_url": "https://app.viktohs-sms.com/api/auth/admin/getOrder?page=2",
    "path": "https://app.viktohs-sms.com/api/auth/admin/getOrder",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 623
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Order ID |
| `phone_number` | string | Purchased phone number |
| `service_code` | string | Service code (wa, tg, ig, fb, etc.) |
| `country_code` | string | Country code (US, RU, GB, etc.) |
| `cost` | string | Cost in Naira (₦) |
| `otp_code` | string or null | OTP/verification code (null if not received) |
| `status` | string | Order status (waiting, received, completed, cancelled, expired) |
| `provider` | string | Provider name (smsactivate) |
| `created_at` | string | ISO 8601 timestamp |
| `user.email` | string | User's email address |

**Status Values:**
- `waiting` - Waiting for SMS code
- `received` - SMS code received
- `completed` - User marked as completed
- `cancelled` - Activation cancelled (refunded)
- `expired` - Activation expired without receiving code

**Pagination Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `current_page` | number | Current page number |
| `data` | array | Array of order objects |
| `first_page_url` | string | URL to first page |
| `from` | number | Starting record number on current page |
| `last_page` | number | Total number of pages |
| `last_page_url` | string | URL to last page |
| `next_page_url` | string or null | URL to next page (null if last page) |
| `path` | string | Base API path |
| `per_page` | number | Records per page (15) |
| `prev_page_url` | string or null | URL to previous page (null if first page) |
| `to` | number | Ending record number on current page |
| `total` | number | Total number of orders |

**No Caching** - Always fetch fresh data

---

### **Implementation Example:**

```javascript
// State management
const [orders, setOrders] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalOrders, setTotalOrders] = useState(0);
const [searchTerm, setSearchTerm] = useState('');
const [isLoading, setIsLoading] = useState(false);

// Fetch orders
const fetchOrders = async (page = 1, search = '') => {
  try {
    setIsLoading(true);
    const response = await api.getAdminOrders(page, search);
    
    if (response.status) {
      setOrders(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
      setTotalOrders(response.data.total);
    }
  } catch (error) {
    toast.error('Failed to load orders');
  } finally {
    setIsLoading(false);
  }
};

// Load orders on mount
useEffect(() => {
  fetchOrders(1);
}, []);

// Handle search
const handleSearch = (searchValue) => {
  setSearchTerm(searchValue);
  setCurrentPage(1);
  fetchOrders(1, searchValue);
};

// Handle pagination
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  fetchOrders(newPage, searchTerm);
};
```

---

### **Search Functionality:**

**Search works on:**
- User email (e.g., `john@example.com`)
- Phone number (e.g., `+12025551234` or `2025551234`)
- Service code (e.g., `wa`, `whatsapp`)
- Country code (e.g., `US`, `RU`)

**Implementation:**
```javascript
// Debounced search (wait 500ms after user stops typing)
const [searchDebounce, setSearchDebounce] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchDebounce !== searchTerm) {
      handleSearch(searchDebounce);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [searchDebounce]);
```

---

### **Error Responses:**

**Unauthorized (401):**
```json
{
  "message": "Unauthenticated."
}
```

**Forbidden (403):**
```json
{
  "status": false,
  "message": "Unauthorized. Admin access required."
}
```

---

## ⚙️ ADMIN TOP-UP RATE PAGE

### **API Flow:**

```
1. Page loads
   ↓
2. Fetch current settings
   GET /auth/admin/settings/rate-topup
   ↓
3. Display current rates in form
   ↓
4. Admin updates values
   ↓
5. Submit updated settings
   PUT /auth/admin/settings/rate-topup
   ↓
6. Show success message
   ↓
7. Refresh settings
```

---

### **1️⃣ Get Current Settings**

**Endpoint:** `GET /auth/admin/settings/rate-topup`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sms_activate_exc_rate": "1300.00",
    "sms_activate_top_up": "30.00",
    "daisy_sms_exc_rate": "1300.00",
    "daisy_sms_top_up": "35.00",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-03-25T10:30:00.000000Z"
  }
}
```

**Field Descriptions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | number | Settings record ID | 1 |
| `sms_activate_exc_rate` | string | USD to Naira exchange rate for SMSActivate | "1300.00" means $1 = ₦1,300 |
| `sms_activate_top_up` | string | Top-up percentage for SMSActivate | "30.00" means 30% markup |
| `daisy_sms_exc_rate` | string | USD to Naira exchange rate for DaisySMS | "1300.00" means $1 = ₦1,300 |
| `daisy_sms_top_up` | string | Top-up percentage for DaisySMS | "35.00" means 35% markup |
| `created_at` | string | ISO 8601 timestamp | When settings were first created |
| `updated_at` | string | ISO 8601 timestamp | When settings were last updated |

**How Pricing Works:**
```
Final Price = (Provider Price in USD × Exchange Rate) + (Top-Up %)

Example:
- Provider price: $0.65
- Exchange rate: ₦1,300
- Top-up: 30%

Calculation:
1. Convert to Naira: $0.65 × 1300 = ₦845
2. Add top-up: ₦845 + (₦845 × 0.30) = ₦845 + ₦253.50 = ₦1,098.50
3. Final price: ₦1,098.50
```

**No Caching** - Always fetch fresh data

---

### **2️⃣ Update Settings**

**Endpoint:** `PUT /auth/admin/settings/rate-topup`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "sms_activate_exc_rate": 1350.00,
  "sms_activate_top_up": 35.00,
  "daisy_sms_exc_rate": 1350.00,
  "daisy_sms_top_up": 40.00
}
```

**Request Fields (All Optional):**

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `sms_activate_exc_rate` | number | No | SMSActivate exchange rate | Must be > 0 |
| `sms_activate_top_up` | number | No | SMSActivate top-up % | Must be >= 0 and <= 100 |
| `daisy_sms_exc_rate` | number | No | DaisySMS exchange rate | Must be > 0 |
| `daisy_sms_top_up` | number | No | DaisySMS top-up % | Must be >= 0 and <= 100 |

**Note:** You can update just one field or all fields at once.

**Example - Update Only SMSActivate Rate:**
```json
{
  "sms_activate_exc_rate": 1400.00
}
```

**Example - Update Only Top-Up Percentages:**
```json
{
  "sms_activate_top_up": 25.00,
  "daisy_sms_top_up": 30.00
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "id": 1,
    "sms_activate_exc_rate": "1350.00",
    "sms_activate_top_up": "35.00",
    "daisy_sms_exc_rate": "1350.00",
    "daisy_sms_top_up": "40.00",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-03-25T11:45:00.000000Z"
  }
}
```

**Error Response - Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "sms_activate_exc_rate": ["The exchange rate must be greater than 0."],
    "sms_activate_top_up": ["The top up percentage must be between 0 and 100."]
  }
}
```

**No Caching** - This is a PUT request

---

### **Implementation Example:**

```javascript
// State management
const [settings, setSettings] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [isSaving, setIsSaving] = useState(false);

// Form state
const [formData, setFormData] = useState({
  sms_activate_exc_rate: '',
  sms_activate_top_up: '',
  daisy_sms_exc_rate: '',
  daisy_sms_top_up: ''
});

// Fetch current settings
const fetchSettings = async () => {
  try {
    setIsLoading(true);
    const response = await api.getAdminSettings();
    
    if (response.success) {
      setSettings(response.data);
      setFormData({
        sms_activate_exc_rate: response.data.sms_activate_exc_rate,
        sms_activate_top_up: response.data.sms_activate_top_up,
        daisy_sms_exc_rate: response.data.daisy_sms_exc_rate,
        daisy_sms_top_up: response.data.daisy_sms_top_up
      });
    }
  } catch (error) {
    toast.error('Failed to load settings');
  } finally {
    setIsLoading(false);
  }
};

// Load settings on mount
useEffect(() => {
  fetchSettings();
}, []);

// Handle input change
const handleChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Update settings
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setIsSaving(true);
    
    // Convert strings to numbers
    const data = {
      sms_activate_exc_rate: parseFloat(formData.sms_activate_exc_rate),
      sms_activate_top_up: parseFloat(formData.sms_activate_top_up),
      daisy_sms_exc_rate: parseFloat(formData.daisy_sms_exc_rate),
      daisy_sms_top_up: parseFloat(formData.daisy_sms_top_up)
    };
    
    const response = await api.updateAdminSettings(data);
    
    if (response.success) {
      toast.success('Settings updated successfully');
      setSettings(response.data);
      // Optionally refresh
      fetchSettings();
    }
  } catch (error) {
    if (error.errors) {
      // Show validation errors
      Object.keys(error.errors).forEach(key => {
        toast.error(error.errors[key][0]);
      });
    } else {
      toast.error(error.message || 'Failed to update settings');
    }
  } finally {
    setIsSaving(false);
  }
};
```

---

### **Form Validation (Frontend):**

```javascript
// Validate before submit
const validateForm = () => {
  const errors = [];
  
  // Exchange rates must be > 0
  if (parseFloat(formData.sms_activate_exc_rate) <= 0) {
    errors.push('SMSActivate exchange rate must be greater than 0');
  }
  
  if (parseFloat(formData.daisy_sms_exc_rate) <= 0) {
    errors.push('DaisySMS exchange rate must be greater than 0');
  }
  
  // Top-up percentages must be between 0 and 100
  if (parseFloat(formData.sms_activate_top_up) < 0 || 
      parseFloat(formData.sms_activate_top_up) > 100) {
    errors.push('SMSActivate top-up must be between 0 and 100');
  }
  
  if (parseFloat(formData.daisy_sms_top_up) < 0 || 
      parseFloat(formData.daisy_sms_top_up) > 100) {
    errors.push('DaisySMS top-up must be between 0 and 100');
  }
  
  // Check for valid numbers
  if (isNaN(parseFloat(formData.sms_activate_exc_rate))) {
    errors.push('SMSActivate exchange rate must be a valid number');
  }
  
  if (errors.length > 0) {
    errors.forEach(error => toast.error(error));
    return false;
  }
  
  return true;
};

// Use in handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // ... continue with API call
};
```

---

### **Error Responses:**

**Unauthorized (401):**
```json
{
  "message": "Unauthenticated."
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Unauthorized. Admin access required."
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "sms_activate_exc_rate": [
      "The sms activate exc rate must be greater than 0."
    ],
    "sms_activate_top_up": [
      "The sms activate top up must be between 0 and 100."
    ]
  }
}
```

---

## 🔐 Admin Authentication

### **How to detect if user is admin:**

```javascript
// After login, check user role
const user = api.getUser();

if (user.role === 'admin') {
  // User is admin - allow access to admin routes
  navigate('/admin/dashboard');
} else {
  // Regular user - deny admin access
  navigate('/dashboard');
}
```

### **Protect Admin Routes:**

```javascript
// AdminRoute component
const AdminRoute = ({ children }) => {
  const user = api.getUser();
  
  if (!user) {
    // Not logged in
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    // Not admin
    toast.error('Unauthorized. Admin access required.');
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Use in routes
<Route path="/admin/orders" element={
  <AdminRoute>
    <AdminOrdersPage />
  </AdminRoute>
} />
```

---

## 🔄 OTHER THINGS INVOLVED

### **1. Authentication Token**

**All requests require Bearer token:**

```javascript
// Get token from localStorage
const token = localStorage.getItem('auth_token');

// Add to headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**Token expiration:**
```json
{
  "message": "Unauthenticated."
}
```

When this happens:
1. Clear localStorage
2. Redirect to login page

---

### **2. Role-Based Access Control**

**User object structure:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@viktohssms.com",
  "role": "admin"
}
```

**Check role before API calls:**
```javascript
const user = api.getUser();

if (user?.role !== 'admin') {
  toast.error('Unauthorized access');
  navigate('/dashboard');
  return;
}

// Proceed with admin API call
```

---

### **3. Error Handling**

**Common error codes:**

| Error Code | Meaning | Action |
|------------|---------|--------|
| `UNAUTHENTICATED` | Token expired | Clear storage, redirect to login |
| `UNAUTHORIZED` | Not an admin | Redirect to user dashboard |
| `VALIDATION_ERROR` | Invalid input data | Show validation errors |
| `TIMEOUT` | Request timeout | Show error, suggest retry |

**Implementation:**
```javascript
try {
  const response = await api.getAdminOrders(page, search);
} catch (error) {
  if (error.message === 'Unauthenticated') {
    localStorage.clear();
    navigate('/login');
  } else if (error.message?.includes('Unauthorized')) {
    toast.error('Admin access required');
    navigate('/dashboard');
  } else if (error.errors) {
    // Validation errors
    Object.keys(error.errors).forEach(key => {
      toast.error(error.errors[key][0]);
    });
  } else {
    toast.error(error.message || 'Something went wrong');
  }
}
```

---

### **4. Pagination Best Practices**

**Calculate total pages:**
```javascript
const totalPages = response.data.last_page;
const currentPage = response.data.current_page;
const hasNextPage = response.data.next_page_url !== null;
const hasPrevPage = response.data.prev_page_url !== null;
```

**Generate page numbers:**
```javascript
const getPageNumbers = (currentPage, totalPages) => {
  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
};
```

---

### **5. Timeout & Retry Logic**

**Settings:**
- Default timeout: **30 seconds**
- Max retries: **2 attempts**
- Retry delay: **Exponential backoff** (1s, 2s, 3s)

**What gets retried:**
- Network errors
- Timeout errors

**What doesn't get retried:**
- 4xx client errors (bad request, unauthorized, etc.)
- 5xx server errors (to avoid overwhelming server)

---

## 📋 SUMMARY

### **Admin Orders Page:**
- ✅ 1 endpoint: `GET /auth/admin/getOrder?page={page}&search={search}`
- ✅ Pagination: 15 orders per page
- ✅ Search: Email, phone number, service code, country code
- ✅ No caching (real-time data)

### **Admin Top-Up Rate Page:**
- ✅ 1 endpoint: `GET /auth/admin/settings/rate-topup`
- ✅ 1 endpoint: `PUT /auth/admin/settings/rate-topup`
- ✅ Fields: Exchange rates and top-up percentages
- ✅ Validation: Rates > 0, Top-up 0-100%
- ✅ No caching

### **Other Involved:**
- ✅ Bearer token authentication
- ✅ Role-based access control (admin only)
- ✅ Timeout & retry (30s, 2 retries)
- ✅ Error handling with codes
- ✅ Pagination support

---

**That's it! Just these 2 admin pages with their specific endpoints.** 🎯
