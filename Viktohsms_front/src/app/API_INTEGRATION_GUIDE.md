# 📱 Viktohs SMS - Complete API Integration Guide

**Base URL:** `https://app.viktohs-sms.com/api`

**Authentication:** Bearer Token (sent in `Authorization` header)

---

## 🔐 Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "phone_number": "+2348012345678",
  "password": "SecurePassword123",
  "password_confirmation": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "is_email_verified": false,
      "balance": "0.00",
      "created_at": "2024-03-25T10:30:00.000000Z",
      "role": "user"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

**Error Response (422):**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["The email has already been taken."],
    "username": ["The username has already been taken."]
  }
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "login": "johndoe",  // Can be username or email
  "password": "SecurePassword123",
  "remember": true     // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "is_email_verified": true,
      "balance": "5000.50",
      "created_at": "2024-03-25T10:30:00.000000Z",
      "role": "user"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Logout Current Device
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Logout All Devices
**Endpoint:** `POST /auth/logout-all`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## 📊 Dashboard Endpoints

### 1. Get Dashboard Stats
**Endpoint:** `GET /auth/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "wallet_balance": 5000.50,
    "total_sms_purchases": 42,
    "total_recharge": 25000.00
  }
}
```

---

### 2. Get User Balance
**Endpoint:** `GET /auth/dashboard/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "wallet_balance": 5000.50
  }
}
```

---

## 🌍 Country & Service Endpoints

### 1. Get All Countries
**Endpoint:** `GET /auth/services/countries`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "countries": [
      {
        "id": 187,
        "name": "United States",
        "retry_available": true,
        "rent_available": false,
        "multi_service_available": true
      },
      {
        "id": 36,
        "name": "Canada",
        "retry_available": true,
        "rent_available": true,
        "multi_service_available": false
      },
      {
        "id": 0,
        "name": "Russia",
        "retry_available": false,
        "rent_available": true,
        "multi_service_available": true
      }
    ]
  }
}
```

**Field Descriptions:**
- `id`: Country ID used for API requests
- `name`: Display name of the country
- `retry_available`: If true, user can request another SMS for same activation
- `rent_available`: If true, country supports long-term number rental
- `multi_service_available`: If true, supports multiple services on same number

---

### 2. Get Services by Country
**Endpoint:** `GET /auth/services/by-country?country={countryId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `country` (required): Country ID (e.g., 187 for USA)

**Example Request:**
```
GET /auth/services/by-country?country=187
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "code": "wa",
        "name": "WhatsApp",
        "available_count": 245
      },
      {
        "code": "tg",
        "name": "Telegram",
        "available_count": 312
      },
      {
        "code": "ig",
        "name": "Instagram",
        "available_count": 156
      },
      {
        "code": "fb",
        "name": "Facebook",
        "available_count": 89
      },
      {
        "code": "go",
        "name": "Google",
        "available_count": 421
      }
    ],
    "total_services": 5
  }
}
```

**Field Descriptions:**
- `code`: Service code (used for API requests)
- `name`: Display name of the service
- `available_count`: Number of available phone numbers for this service

---

### 3. Get Service Price
**Endpoint:** `GET /auth/services/prices?service={serviceCode}&country={countryId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `service` (required): Service code (e.g., "wa", "tg", "ig")
- `country` (required): Country ID (e.g., 187)

**Example Request:**
```
GET /auth/services/prices?service=wa&country=187
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "187": {
      "wa": {
        "cost": 850.50,
        "original_cost": "0.65",
        "count": 245,
        "physicalCount": 240,
        "freePriceMap": {}
      }
    }
  }
}
```

**Field Descriptions:**
- `cost`: Price in Nigerian Naira (₦)
- `original_cost`: Original price in USD (from provider)
- `count`: Total available numbers
- `physicalCount`: Physical SIM numbers available
- `freePriceMap`: Mapping of free price options (usually empty)

**Error Response (404):**
```json
{
  "success": false,
  "message": "Price not available for this service and country combination"
}
```

---

## 💳 Purchase Number Endpoints

### 1. Purchase Number (SMSActivate)
**Endpoint:** `POST /auth/numbers/purchase`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "service_code": "wa",
  "country": 187
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Number purchased successfully",
  "data": {
    "purchased_number": {
      "id": 1234,
      "activation_id": 987654321,
      "phone_number": "+12025551234",
      "service": "WhatsApp",
      "cost": 850.50,
      "status": "waiting",
      "expires_at": "2024-03-25T11:00:00.000000Z",
      "can_request_another_sms": true
    },
    "balance": {
      "previous": 5000.50,
      "current": 4150.00
    }
  }
}
```

**Error Response - Insufficient Balance (400):**
```json
{
  "success": false,
  "message": "Insufficient balance",
  "error": "NO_BALANCE",
  "required": 850.50,
  "available": 500.00
}
```

**Error Response - No Numbers Available (400):**
```json
{
  "success": false,
  "message": "No numbers available for this service",
  "error": "NO_NUMBERS"
}
```

**Error Response - Service Unavailable (400):**
```json
{
  "success": false,
  "message": "Service is currently unavailable",
  "error": "BAD_SERVICE"
}
```

**All Possible Error Codes:**
- `NO_BALANCE`: Insufficient wallet balance
- `NO_NUMBERS`: No available numbers for this service/country
- `BAD_SERVICE`: Service is temporarily unavailable
- `TIMEOUT`: Request timeout, try again

---

## 📞 Number Management Endpoints

### 1. Get Number History
**Endpoint:** `GET /auth/numbers/my-numbers`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "numbers": [
      {
        "id": 1234,
        "user_id": 1,
        "service_id": 5,
        "activation_id": "987654321",
        "phone_number": "+12025551234",
        "service_code": "wa",
        "country_code": "US",
        "operator": "T-Mobile",
        "cost": "850.50",
        "currency": 566,
        "status": "received",
        "otp_code": "123456",
        "sms_text": "Your WhatsApp verification code is: 123456",
        "activation_time": "2024-03-25T10:30:00.000000Z",
        "code_received_at": "2024-03-25T10:32:15.000000Z",
        "expires_at": "2024-03-25T11:00:00.000000Z",
        "can_request_another_sms": true,
        "created_at": "2024-03-25T10:30:00.000000Z",
        "updated_at": "2024-03-25T10:32:15.000000Z",
        "provider": "smsactivate",
        "daisy_service_name": null,
        "service": {
          "id": 5,
          "code": "wa",
          "name": "WhatsApp",
          "description": "WhatsApp Messenger",
          "icon": "https://example.com/whatsapp.png",
          "is_active": true,
          "display_order": 1,
          "created_at": "2024-01-01T00:00:00.000000Z",
          "updated_at": "2024-01-01T00:00:00.000000Z"
        }
      },
      {
        "id": 1233,
        "user_id": 1,
        "service_id": 8,
        "activation_id": "987654320",
        "phone_number": "+12025551233",
        "service_code": "tg",
        "country_code": "US",
        "operator": "AT&T",
        "cost": "750.00",
        "currency": 566,
        "status": "waiting",
        "otp_code": null,
        "sms_text": null,
        "activation_time": "2024-03-25T10:25:00.000000Z",
        "code_received_at": null,
        "expires_at": "2024-03-25T10:55:00.000000Z",
        "can_request_another_sms": true,
        "created_at": "2024-03-25T10:25:00.000000Z",
        "updated_at": "2024-03-25T10:25:00.000000Z",
        "provider": "smsactivate",
        "daisy_service_name": null,
        "service": {
          "id": 8,
          "code": "tg",
          "name": "Telegram",
          "description": "Telegram Messenger",
          "icon": "https://example.com/telegram.png",
          "is_active": true,
          "display_order": 2,
          "created_at": "2024-01-01T00:00:00.000000Z",
          "updated_at": "2024-01-01T00:00:00.000000Z"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 42,
      "last_page": 3
    }
  }
}
```

**Status Values:**
- `waiting`: Waiting for SMS code
- `pending`: Same as waiting
- `received`: SMS code received
- `completed`: User marked as completed
- `cancelled`: Activation cancelled
- `expired`: Activation expired without receiving code
- `timeout`: Activation timed out

---

### 2. Get Number Status (Polling)
**Endpoint:** `GET /auth/numbers/{numberId}/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
GET /auth/numbers/1234/status
```

**Success Response - Code Received (200):**
```json
{
  "success": true,
  "data": {
    "status": "received",
    "otp_code": "123456",
    "sms_text": "Your WhatsApp verification code is: 123456",
    "received_at": "2024-03-25T10:32:15.000000Z"
  }
}
```

**Success Response - Still Waiting (200):**
```json
{
  "success": true,
  "data": {
    "status": "waiting"
  }
}
```

**Error Response - Expired (400):**
```json
{
  "success": false,
  "message": "Activation has expired",
  "status": "expired"
}
```

**Error Response - Cancelled (400):**
```json
{
  "success": false,
  "message": "Activation was cancelled",
  "status": "cancelled"
}
```

**Frontend Implementation:**
```javascript
// Poll every 3 seconds for waiting numbers
useEffect(() => {
  const waitingNumbers = numbers.filter(n => n.status === 'waiting');
  
  if (waitingNumbers.length > 0) {
    const interval = setInterval(() => {
      waitingNumbers.forEach(number => {
        pollNumberStatus(number.id);
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }
}, [numbers]);
```

---

### 3. Cancel Activation
**Endpoint:** `POST /auth/numbers/{numberId}/cancel`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
POST /auth/numbers/1234/cancel
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activation cancelled successfully. Amount refunded to wallet.",
  "data": {
    "refunded_amount": 850.50,
    "current_balance": 5851.00
  }
}
```

**Error Response - Already Completed (400):**
```json
{
  "success": false,
  "message": "Can only cancel waiting activations",
  "error": "INVALID_STATUS"
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Number not found"
}
```

---

### 4. Complete Activation
**Endpoint:** `POST /auth/numbers/{numberId}/complete`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
POST /auth/numbers/1234/complete
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activation marked as completed successfully",
  "data": {
    "status": "completed"
  }
}
```

**Error Response - No OTP Received (400):**
```json
{
  "success": false,
  "message": "Cannot complete activation without receiving OTP first",
  "error": "NO_OTP"
}
```

---

## 🇺🇸 USA Numbers Page Flow

### **Flow Overview:**

```
1. User lands on USA Numbers page
   ↓
2. Auto-fetch USA services (Country ID = 187)
   → API: GET /auth/services/by-country?country=187
   ↓
3. User selects a service (e.g., WhatsApp)
   ↓
4. Check if service code = "wa" (WhatsApp)
   → If YES: Use Canada (Country ID = 36)
   → If NO: Use USA (Country ID = 187)
   ↓
5. Fetch price for service
   → API: GET /auth/services/prices?service=wa&country=36
   ↓
6. Display price and available count
   ↓
7. User clicks "Buy Number Now"
   ↓
8. Check balance >= price
   → If NO: Show error, prompt to fund wallet
   → If YES: Continue
   ↓
9. Purchase number
   → API: POST /auth/numbers/purchase
   → Body: { "service_code": "wa", "country": 36 }
   ↓
10. Show success toast
    ↓
11. Redirect to Numbers History page
    ↓
12. Auto-poll for SMS code (every 3 seconds)
    → API: GET /auth/numbers/{id}/status
```

### **Special Logic - WhatsApp Routing:**

```javascript
// Helper function in USA Numbers page
const getActiveCountryId = () => {
  // If WhatsApp is selected, use Canada (36)
  // Otherwise use USA (187)
  if (selectedService?.code?.toLowerCase() === 'wa') {
    return 36; // Canada
  }
  return 187; // USA
};

// Use this helper in:
// 1. fetchPrice() - to get correct pricing
// 2. handleBuyNumber() - to purchase from correct country
```

**Why this logic?**
- WhatsApp numbers work better through Canada provider
- All other services use USA provider
- User sees "USA Numbers 🇺🇸" but backend routes correctly

---

## 🌍 All Countries Page Flow

### **Flow Overview:**

```
1. User lands on All Countries page
   ↓
2. Fetch all countries
   → API: GET /auth/services/countries
   ↓
3. Display country dropdown (187+ countries)
   ↓
4. User selects a country (e.g., Russia - ID: 0)
   ↓
5. Fetch services for selected country
   → API: GET /auth/services/by-country?country=0
   ↓
6. Display service dropdown
   ↓
7. User selects a service (e.g., Telegram - code: "tg")
   ↓
8. Fetch price for service
   → API: GET /auth/services/prices?service=tg&country=0
   ↓
9. Display price and available count
   ↓
10. User clicks "Buy Number"
    ↓
11. Check balance >= price
    → If NO: Show error, prompt to fund wallet
    → If YES: Continue
    ↓
12. Purchase number
    → API: POST /auth/numbers/purchase
    → Body: { "service_code": "tg", "country": 0 }
    ↓
13. Show success toast
    ↓
14. Redirect to Numbers History page
    ↓
15. Auto-poll for SMS code
    → API: GET /auth/numbers/{id}/status
```

**Key Difference from USA Page:**
- No special routing logic
- Uses selected country ID directly
- Supports 187+ countries worldwide

---

## 📝 Transaction History Endpoint

### Get User Transactions
**Endpoint:** `GET /auth/transactions/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "numbers": [
      {
        "id": 567,
        "user_id": 1,
        "purchased_number_id": 1234,
        "type": "debit",
        "amount": "850.50",
        "balance_before": "5000.50",
        "balance_after": "4150.00",
        "description": "Number purchase - WhatsApp",
        "reference": "TXN-1711363800-1",
        "metadata": {
          "service": "WhatsApp",
          "phone_number": "+12025551234",
          "country": "US"
        },
        "created_at": "2024-03-25T10:30:00.000000Z",
        "updated_at": "2024-03-25T10:30:00.000000Z"
      },
      {
        "id": 566,
        "user_id": 1,
        "purchased_number_id": null,
        "type": "credit",
        "amount": "5000.00",
        "balance_before": "0.50",
        "balance_after": "5000.50",
        "description": "Wallet funding via bank transfer",
        "reference": "TXN-1711360200-1",
        "metadata": {
          "payment_method": "bank_transfer",
          "account_number": "1234567890"
        },
        "created_at": "2024-03-25T09:30:00.000000Z",
        "updated_at": "2024-03-25T09:30:00.000000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 156,
      "last_page": 8
    }
  }
}
```

**Transaction Types:**
- `credit`: Wallet funding/refund
- `debit`: Number purchase
- `refund`: Cancelled activation refund

---

## 💰 Wallet/Payment Endpoints

### Generate Virtual Account
**Endpoint:** `POST /auth/virtual-account/generate`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Virtual account generated successfully",
  "data": {
    "virtual_account": {
      "bank_name": "Wema Bank",
      "account_number": "7890123456",
      "account_name": "VIKTOHS SMS - JOHN DOE",
      "bank_code": "035"
    }
  }
}
```

**How it works:**
1. User clicks "Fund Wallet"
2. Frontend calls this endpoint
3. Backend creates dedicated virtual account
4. User transfers money to this account
5. Payment is auto-detected and credited to wallet

---

## 🎯 DaisySMS Endpoints (Alternative Provider)

### 1. Get DaisySMS Services
**Endpoint:** `GET /auth/daisysms/services`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "DaisySMS services retrieved successfully",
  "total_services": 150,
  "data": [
    {
      "service_code": "whatsapp",
      "service_name": "WhatsApp",
      "final_cost": 1200.00,
      "time_to_live": 1800
    },
    {
      "service_code": "telegram",
      "service_name": "Telegram",
      "final_cost": 950.00,
      "time_to_live": 1200
    }
  ]
}
```

**Field Descriptions:**
- `service_code`: Service identifier for DaisySMS
- `service_name`: Display name
- `final_cost`: Price in Naira (₦)
- `time_to_live`: Validity period in seconds

---

### 2. Rent DaisySMS Number
**Endpoint:** `POST /auth/daisysms/rent`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "service": "whatsapp"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Number rented successfully",
  "data": {
    "id": 5678,
    "activation_id": "DY-123456789",
    "phone_number": "+12025559999",
    "service_code": "whatsapp",
    "cost": 1200.00,
    "status": "waiting",
    "expires_at": "2024-03-25T11:00:00.000000Z"
  }
}
```

**Error Response - Insufficient Balance (400):**
```json
{
  "success": false,
  "message": "Insufficient balance",
  "error": "NO_BALANCE",
  "required": 1200.00,
  "available": 500.00
}
```

---

### 3. Get DaisySMS Code (Polling)
**Endpoint:** `GET /auth/daisysms/{numberId}/get-code`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response - Code Received (200):**
```json
{
  "success": true,
  "data": {
    "status": "received",
    "otp_code": "654321",
    "sms_text": "Your WhatsApp code is: 654321",
    "received_at": "2024-03-25T10:35:20.000000Z"
  }
}
```

---

### 4. Mark DaisySMS Done
**Endpoint:** `POST /auth/daisysms/{numberId}/mark-done`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activation marked as done successfully"
}
```

---

### 5. Cancel DaisySMS Activation
**Endpoint:** `POST /auth/daisysms/{numberId}/cancel`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Activation cancelled successfully",
  "data": {
    "refunded_amount": 1200.00,
    "current_balance": 6200.00
  }
}
```

---

## 🔄 Dual Provider System Logic

Your app uses **TWO providers** for maximum availability:

### **Provider 1: SMSActivate (Primary)**
- Used for country-based services
- API endpoints: `/auth/numbers/*` and `/auth/services/*`
- Supports 187+ countries
- Status polling: `GET /auth/numbers/{id}/status`

### **Provider 2: DaisySMS (Alternative)**
- Used for specific services or as fallback
- API endpoints: `/auth/daisysms/*`
- Service-focused (not country-focused)
- Status polling: `GET /auth/daisysms/{id}/get-code`

### **How to identify provider in Number History:**
```javascript
const number = {
  id: 1234,
  provider: "smsactivate",  // or "daisysms"
  // ...
};

// Use different API based on provider
if (number.provider === 'daisysms') {
  // Use DaisySMS endpoints
  await api.getDaisySMSCode(number.id);
  await api.cancelDaisySMSActivation(number.id);
  await api.markDaisySMSDone(number.id);
} else {
  // Use SMSActivate endpoints
  await api.getNumberStatus(number.id);
  await api.cancelActivation(number.id);
  await api.completeActivation(number.id);
}
```

---

## 🚨 Error Handling Guide

### Common HTTP Status Codes:

**200 OK** - Request successful
```json
{
  "success": true,
  "data": { ... }
}
```

**400 Bad Request** - Client error (invalid data, insufficient balance)
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

**401 Unauthorized** - Invalid or expired token
```json
{
  "message": "Unauthenticated."
}
```

**422 Validation Error** - Form validation failed
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

**500 Server Error** - Internal server error
```json
{
  "success": false,
  "message": "Server error occurred"
}
```

### Error Handling Implementation:

```javascript
try {
  const response = await api.purchaseNumber(serviceCode, countryId);
  
  if (response.success) {
    // Handle success
    toast.success('Number purchased!');
  }
} catch (error) {
  // Handle specific errors
  if (error.error === 'NO_BALANCE') {
    toast.error('Insufficient balance');
    navigate('/fund-wallet');
  } else if (error.error === 'NO_NUMBERS') {
    toast.error('No numbers available. Try again later.');
  } else if (error.message === 'Unauthenticated') {
    // Token expired - redirect to login
    localStorage.clear();
    navigate('/login');
  } else {
    // Generic error
    toast.error(error.message || 'Something went wrong');
  }
}
```

---

## ⏱️ Timeout & Retry Logic

### Request Timeout Settings:
- **Default timeout:** 30 seconds
- **Max retries:** 2 attempts
- **Retry delay:** Exponential backoff (1s, 2s, 3s)

### Timeout Error Response:
```json
{
  "success": false,
  "message": "Request timeout. Please check your internet connection and try again.",
  "error": "TIMEOUT"
}
```

### Implementation:
```javascript
// Automatically handled in ApiClient
// Retries network errors and timeouts up to 2 times
// Shows user-friendly timeout message after all retries fail
```

---

## 💾 Caching Strategy

To improve performance, certain endpoints are cached:

### Cached Endpoints:
1. **Countries** - 30 minutes TTL
   - `GET /auth/services/countries`
   
2. **Services** - 10 minutes TTL
   - `GET /auth/services/by-country?country={id}`
   
3. **Prices** - 2 minutes TTL
   - `GET /auth/services/prices?service={code}&country={id}`

### Force Refresh:
```javascript
// Pass forceRefresh parameter to bypass cache
await api.getCountries(true);  // Force refresh
await api.getServicesByCountry(187, true);  // Force refresh
await api.getServicePrice('wa', 36, true);  // Force refresh
```

### Clear Cache:
```javascript
// Clear specific cache
api.clearCountriesCache();
api.clearServicesCache(187);  // Clear for specific country

// Clear all cache
api.clearAllCache();
```

---

## 🎨 Complete Purchase Flow Example

### Frontend Implementation:

```javascript
// 1. Load countries on page mount
useEffect(() => {
  fetchCountries();
  fetchUserBalance();
}, []);

const fetchCountries = async () => {
  try {
    const response = await api.getCountries();
    setCountries(response.data.countries);
  } catch (error) {
    toast.error('Failed to load countries');
  }
};

// 2. User selects country
const handleCountrySelect = (countryId) => {
  setSelectedCountry(countryId);
  fetchServices(countryId);
};

const fetchServices = async (countryId) => {
  try {
    const response = await api.getServicesByCountry(countryId);
    setServices(response.data.services);
  } catch (error) {
    toast.error('Failed to load services');
  }
};

// 3. User selects service
const handleServiceSelect = (serviceCode) => {
  setSelectedService(serviceCode);
  fetchPrice(serviceCode, selectedCountry);
};

const fetchPrice = async (serviceCode, countryId) => {
  try {
    const response = await api.getServicePrice(serviceCode, countryId);
    const priceData = response.data[countryId][serviceCode];
    setPrice(priceData.cost);
    setAvailableCount(priceData.count);
  } catch (error) {
    setPriceError('Price unavailable');
  }
};

// 4. User clicks buy button
const handleBuyNumber = async () => {
  // Validate balance
  if (price > userBalance) {
    toast.error('Insufficient balance');
    const shouldFund = confirm('Would you like to fund your wallet?');
    if (shouldFund) {
      navigate('/fund-wallet');
    }
    return;
  }
  
  try {
    setIsPurchasing(true);
    
    // Purchase number
    const response = await api.purchaseNumber(
      selectedService,
      selectedCountry
    );
    
    // Update local balance
    setUserBalance(response.data.balance.current);
    
    // Show success
    toast.success(
      `Number purchased! Phone: ${response.data.purchased_number.phone_number}`
    );
    
    // Redirect to history
    navigate('/numbers-history', {
      state: { newPurchase: response.data.purchased_number }
    });
    
  } catch (error) {
    // Handle errors
    if (error.error === 'NO_BALANCE') {
      toast.error('Insufficient balance');
    } else if (error.error === 'NO_NUMBERS') {
      toast.error('No numbers available');
    } else {
      toast.error(error.message || 'Purchase failed');
    }
  } finally {
    setIsPurchasing(false);
  }
};

// 5. Poll for SMS code on history page
useEffect(() => {
  const waitingNumbers = numbers.filter(
    n => n.status === 'waiting' || n.status === 'pending'
  );
  
  if (waitingNumbers.length > 0) {
    const interval = setInterval(() => {
      waitingNumbers.forEach(number => {
        pollNumberStatus(number);
      });
    }, 3000);  // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }
}, [numbers]);

const pollNumberStatus = async (number) => {
  try {
    let response;
    
    // Use correct API based on provider
    if (number.provider === 'daisysms') {
      response = await api.getDaisySMSCode(number.id);
    } else {
      response = await api.getNumberStatus(number.id);
    }
    
    if (response.success && response.data.status === 'received') {
      // Update number in list
      updateNumber(number.id, {
        status: 'received',
        otp_code: response.data.otp_code,
        sms_text: response.data.sms_text
      });
      
      // Show notification
      toast.success(
        `OTP received! Code: ${response.data.otp_code}`,
        { duration: 10000 }
      );
    }
  } catch (error) {
    console.error('Polling error:', error);
  }
};
```

---

## 📌 Important Notes

### 1. **Authentication Required**
All endpoints (except `/auth/register` and `/auth/login`) require Bearer token:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 2. **Token Expiration**
- When token expires, API returns `401 Unauthorized`
- Frontend should clear localStorage and redirect to login
- Message will be: `"Unauthenticated."` or `"Unauthenticated"`

### 3. **Content-Type Headers**
Always send:
```
Content-Type: application/json
Accept: application/json
```

### 4. **Naira Currency**
All prices and balances are in **Nigerian Naira (₦)**:
```javascript
// Format for display
const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

console.log(formatNaira(5000.50)); // "₦5,000.50"
```

### 5. **Status Polling**
- Poll **every 3 seconds** for waiting numbers
- Stop polling when status changes to: `received`, `completed`, `cancelled`, `expired`
- Use `setTimeout` or `setInterval` for polling

### 6. **Request Deduplication**
- GET requests are automatically deduplicated
- Multiple identical GET requests will share the same promise
- Prevents redundant API calls

### 7. **USA WhatsApp Special Routing**
```javascript
// In USA Numbers page only
const getCountryId = () => {
  return selectedService.code === 'wa' ? 36 : 187;
};
// WhatsApp → Canada (36)
// All others → USA (187)
```

### 8. **Balance Checks**
Always check balance before purchase:
```javascript
if (price > userBalance) {
  // Show error and offer to fund wallet
  toast.error(`Insufficient balance. Required: ₦${price}`);
}
```

---

## 🎯 Quick Reference

### Base URL:
```
https://app.viktohs-sms.com/api
```

### Key Endpoints:
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/services/countries
GET    /auth/services/by-country?country={id}
GET    /auth/services/prices?service={code}&country={id}
POST   /auth/numbers/purchase
GET    /auth/numbers/my-numbers
GET    /auth/numbers/{id}/status
POST   /auth/numbers/{id}/cancel
POST   /auth/numbers/{id}/complete
GET    /auth/dashboard/stats
GET    /auth/dashboard/balance
GET    /auth/transactions/me
POST   /auth/virtual-account/generate
```

### DaisySMS Endpoints:
```
GET    /auth/daisysms/services
POST   /auth/daisysms/rent
GET    /auth/daisysms/{id}/get-code
POST   /auth/daisysms/{id}/mark-done
POST   /auth/daisysms/{id}/cancel
```

### Country IDs:
- **USA:** 187
- **Canada:** 36 (used for WhatsApp on USA page)
- **Russia:** 0
- **Nigeria:** 19
- **UK:** 16
- (187+ countries available via `/auth/services/countries`)

### Common Service Codes:
- **WhatsApp:** wa
- **Telegram:** tg
- **Instagram:** ig
- **Facebook:** fb
- **Google:** go
- **Twitter:** tw
- **LinkedIn:** li

---

## ✅ Testing Checklist

### Before submitting to backend team:

- [ ] Test authentication flow (register, login, logout)
- [ ] Test fetching countries
- [ ] Test fetching services for different countries
- [ ] Test fetching prices
- [ ] Test purchase number with sufficient balance
- [ ] Test purchase number with insufficient balance
- [ ] Test number history fetching
- [ ] Test status polling for waiting numbers
- [ ] Test cancel activation
- [ ] Test complete activation
- [ ] Test DaisySMS endpoints
- [ ] Test virtual account generation
- [ ] Test transaction history
- [ ] Test token expiration handling
- [ ] Test USA WhatsApp routing (Canada vs USA)
- [ ] Test error handling for all endpoints
- [ ] Test cache behavior
- [ ] Test timeout and retry logic

---

## 📞 Support

For API issues or questions, contact your backend team with:
1. Endpoint URL
2. Request method and body
3. Response received
4. Expected behavior
5. User ID (if applicable)

---

**Last Updated:** March 25, 2024
**API Version:** 1.0
**Base URL:** https://app.viktohs-sms.com/api
