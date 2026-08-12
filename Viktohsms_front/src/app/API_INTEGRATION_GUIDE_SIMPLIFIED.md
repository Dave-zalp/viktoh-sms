# 📱 Viktohs SMS - API Integration Guide (3 Pages Only)

**Base URL:** `https://app.viktohs-sms.com/api`

**Authentication:** Bearer Token (sent in `Authorization` header)

**Provider:** SMSActivate only

---

## 📄 Overview

This guide covers **ONLY 3 pages**:
1. **USA Numbers Page** - Buy US numbers with auto-routing
2. **All Countries Page** - Buy numbers from 187+ countries
3. **Number History Page** - View past purchases and receive SMS codes

---

## 🇺🇸 USA NUMBERS PAGE

### **API Flow:**

```
1. Page loads
   ↓
2. Fetch services for USA (Country ID = 187)
   GET /auth/services/by-country?country=187
   ↓
3. User selects service (e.g., WhatsApp)
   ↓
4. Check if service code = "wa"
   - If WhatsApp: Use Canada (ID = 36)
   - If Other: Use USA (ID = 187)
   ↓
5. Fetch price
   GET /auth/services/prices?service={code}&country={countryId}
   ↓
6. User clicks "Buy Number Now"
   ↓
7. Purchase number
   POST /auth/numbers/purchase
   ↓
8. Redirect to Number History page
```

---

### **1️⃣ Get USA Services**

**Endpoint:** `GET /auth/services/by-country?country=187`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
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
      }
    ],
    "total_services": 3
  }
}
```

**Caching:** ✅ Cached for **10 minutes**

---

### **2️⃣ Get Service Price**

**Endpoint:** `GET /auth/services/prices?service={serviceCode}&country={countryId}`

**Example Request:**
```
GET /auth/services/prices?service=wa&country=36
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "36": {
      "wa": {
        "cost": 850.50,
        "original_cost": "0.65",
        "count": 245
      }
    }
  }
}
```

**Caching:** ✅ Cached for **2 minutes**

**⚠️ SPECIAL LOGIC - WhatsApp Routing:**
```javascript
// Helper function
const getActiveCountryId = () => {
  if (selectedService?.code === 'wa') {
    return 36; // Canada for WhatsApp
  }
  return 187; // USA for everything else
};

// Use this in:
// 1. fetchPrice() - to get correct pricing
// 2. handleBuyNumber() - to purchase from correct country
```

---

### **3️⃣ Purchase Number**

**Endpoint:** `POST /auth/numbers/purchase`

**Request Body:**
```json
{
  "service_code": "wa",
  "country": 36
}
```

**Success Response:**
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
      "expires_at": "2024-03-25T11:00:00.000000Z"
    },
    "balance": {
      "previous": 5000.50,
      "current": 4150.00
    }
  }
}
```

**Error Response - Insufficient Balance:**
```json
{
  "success": false,
  "message": "Insufficient balance",
  "error": "NO_BALANCE",
  "required": 850.50,
  "available": 500.00
}
```

**Error Response - No Numbers:**
```json
{
  "success": false,
  "message": "No numbers available for this service",
  "error": "NO_NUMBERS"
}
```

**No Caching** - This is a POST request

---

## 🌍 ALL COUNTRIES PAGE

### **API Flow:**

```
1. Page loads
   ↓
2. Fetch all countries
   GET /auth/services/countries
   ↓
3. User selects country (e.g., Russia - ID: 0)
   ↓
4. Fetch services for selected country
   GET /auth/services/by-country?country=0
   ↓
5. User selects service (e.g., Telegram)
   ↓
6. Fetch price
   GET /auth/services/prices?service=tg&country=0
   ↓
7. User clicks "Buy Number"
   ↓
8. Purchase number
   POST /auth/numbers/purchase
   ↓
9. Redirect to Number History page
```

---

### **1️⃣ Get All Countries**

**Endpoint:** `GET /auth/services/countries`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
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
      },
      {
        "id": 19,
        "name": "Nigeria",
        "retry_available": true,
        "rent_available": false,
        "multi_service_available": true
      }
    ]
  }
}
```

**Caching:** ✅ Cached for **30 minutes**

---

### **2️⃣ Get Services by Country**

**Endpoint:** `GET /auth/services/by-country?country={countryId}`

**Example Request:**
```
GET /auth/services/by-country?country=0
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "code": "tg",
        "name": "Telegram",
        "available_count": 512
      },
      {
        "code": "wa",
        "name": "WhatsApp",
        "available_count": 345
      },
      {
        "code": "vk",
        "name": "VKontakte",
        "available_count": 789
      }
    ],
    "total_services": 3
  }
}
```

**Caching:** ✅ Cached for **10 minutes** (per country)

---

### **3️⃣ Get Service Price**

**Endpoint:** `GET /auth/services/prices?service={serviceCode}&country={countryId}`

**Example Request:**
```
GET /auth/services/prices?service=tg&country=0
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "0": {
      "tg": {
        "cost": 450.00,
        "original_cost": "0.35",
        "count": 512
      }
    }
  }
}
```

**Caching:** ✅ Cached for **2 minutes**

---

### **4️⃣ Purchase Number**

**Endpoint:** `POST /auth/numbers/purchase`

**Request Body:**
```json
{
  "service_code": "tg",
  "country": 0
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Number purchased successfully",
  "data": {
    "purchased_number": {
      "id": 1235,
      "activation_id": 987654322,
      "phone_number": "+79123456789",
      "service": "Telegram",
      "cost": 450.00,
      "status": "waiting",
      "expires_at": "2024-03-25T11:00:00.000000Z"
    },
    "balance": {
      "previous": 4150.00,
      "current": 3700.00
    }
  }
}
```

**No Caching** - This is a POST request

---

## 📞 NUMBER HISTORY PAGE

### **API Flow:**

```
1. Page loads
   ↓
2. Fetch number history
   GET /auth/numbers/my-numbers
   ↓
3. Display all purchased numbers
   ↓
4. Start polling for "waiting" numbers (every 3 seconds)
   GET /auth/numbers/{id}/status
   ↓
5. When code received, show notification
   ↓
6. User can:
   - Copy phone number
   - Copy OTP code
   - Cancel activation (if waiting)
   - Complete activation (if received)
```

---

### **1️⃣ Get Number History**

**Endpoint:** `GET /auth/numbers/my-numbers`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response:**
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
        "status": "received",
        "otp_code": "123456",
        "sms_text": "Your WhatsApp verification code is: 123456",
        "activation_time": "2024-03-25T10:30:00.000000Z",
        "code_received_at": "2024-03-25T10:32:15.000000Z",
        "expires_at": "2024-03-25T11:00:00.000000Z",
        "created_at": "2024-03-25T10:30:00.000000Z",
        "provider": "smsactivate",
        "daisy_service_name": null,
        "service": {
          "id": 5,
          "code": "wa",
          "name": "WhatsApp"
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
        "status": "waiting",
        "otp_code": null,
        "sms_text": null,
        "activation_time": "2024-03-25T10:25:00.000000Z",
        "code_received_at": null,
        "expires_at": "2024-03-25T10:55:00.000000Z",
        "created_at": "2024-03-25T10:25:00.000000Z",
        "provider": "smsactivate",
        "daisy_service_name": null,
        "service": {
          "id": 8,
          "code": "tg",
          "name": "Telegram"
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
- `waiting` - Waiting for SMS code
- `received` - SMS code received
- `completed` - User marked as completed
- `cancelled` - Activation cancelled
- `expired` - Activation expired without code

**No Caching** - Always fetch fresh data

---

### **2️⃣ Get Number Status (Polling)**

**Endpoint:** `GET /auth/numbers/{numberId}/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
GET /auth/numbers/1234/status
```

**Success Response - Code Received:**
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

**Success Response - Still Waiting:**
```json
{
  "success": true,
  "data": {
    "status": "waiting"
  }
}
```

**Error Response - Expired:**
```json
{
  "success": false,
  "message": "Activation has expired",
  "status": "expired"
}
```

**No Caching** - Real-time polling

**Polling Logic:**
```javascript
// Poll every 3 seconds for waiting numbers
useEffect(() => {
  const waitingNumbers = numberHistory.filter(
    item => item.status === 'waiting' || item.status === 'pending'
  );

  if (waitingNumbers.length > 0) {
    const intervalId = setInterval(() => {
      waitingNumbers.forEach(number => {
        pollNumberStatus(number.id);
      });
    }, 3000); // 3 seconds

    return () => clearInterval(intervalId);
  }
}, [numberHistory]);

const pollNumberStatus = async (id) => {
  try {
    const response = await api.getNumberStatus(id);
    
    if (response.success && response.data.status === 'received') {
      // Update number in list
      setNumberHistory(prev => 
        prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                status: 'received',
                otp_code: response.data.otp_code,
                sms_text: response.data.sms_text,
                code_received_at: response.data.received_at
              } 
            : item
        )
      );
      
      // Show notification
      toast.success(`OTP received! Code: ${response.data.otp_code}`);
    }
  } catch (error) {
    console.error('Polling error:', error);
  }
};
```

---

### **3️⃣ Cancel Activation**

**Endpoint:** `POST /auth/numbers/{numberId}/cancel`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
POST /auth/numbers/1234/cancel
```

**Success Response:**
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

**Error Response:**
```json
{
  "success": false,
  "message": "Can only cancel waiting activations"
}
```

**No Caching** - This is a POST request

---

### **4️⃣ Complete Activation**

**Endpoint:** `POST /auth/numbers/{numberId}/complete`

**Headers:**
```
Authorization: Bearer {token}
```

**Example Request:**
```
POST /auth/numbers/1234/complete
```

**Success Response:**
```json
{
  "success": true,
  "message": "Activation marked as completed successfully",
  "data": {
    "status": "completed"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Cannot complete activation without receiving OTP first"
}
```

**No Caching** - This is a POST request

---

## 💾 CACHING METHOD

### **How Caching Works:**

```javascript
// Simple in-memory cache with TTL (Time To Live)

class SimpleCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  remove(key: string) {
    this.cache.delete(key);
  }

  clearAll() {
    this.cache.clear();
  }
}
```

### **Cache Keys:**

```javascript
const CACHE_KEYS = {
  COUNTRIES: 'countries',
  SERVICES: (countryId: number) => `services_${countryId}`,
  PRICE: (serviceCode: string, countryId: number) => `price_${serviceCode}_${countryId}`
};
```

### **Cache TTLs (Time To Live):**

| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| `GET /auth/services/countries` | `countries` | **30 minutes** |
| `GET /auth/services/by-country?country={id}` | `services_{countryId}` | **10 minutes** |
| `GET /auth/services/prices?service={code}&country={id}` | `price_{serviceCode}_{countryId}` | **2 minutes** |

### **Why These TTLs?**

1. **Countries (30 min)** - Countries rarely change
2. **Services (10 min)** - Services are relatively stable
3. **Prices (2 min)** - Prices can change frequently based on availability

### **Force Refresh:**

```javascript
// Pass forceRefresh = true to bypass cache
await api.getCountries(true);
await api.getServicesByCountry(187, true);
await api.getServicePrice('wa', 36, true);
```

### **Clear Cache:**

```javascript
// Clear specific cache
api.clearCountriesCache();
api.clearServicesCache(187);

// Clear all cache
api.clearAllCache();
```

---

## 🔄 OTHER THINGS INVOLVED IN THESE 3 PAGES

### **1. User Balance Checking**

**Endpoint:** `GET /auth/dashboard/balance`

**Used in:** USA Numbers, All Countries (before purchase)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "wallet_balance": 5000.50
  }
}
```

**Why needed:**
- Check if user has enough balance before purchase
- Show current balance on page
- Update balance after purchase

---

### **2. Authentication Token**

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

### **3. Request Deduplication**

**Prevents redundant API calls:**

```javascript
// Multiple simultaneous GET requests to same endpoint
// will share the same promise

// Example:
api.getCountries(); // Makes API call
api.getCountries(); // Returns same promise, no new call
api.getCountries(); // Returns same promise, no new call
```

**Only applies to GET requests** - POST requests are never deduplicated.

---

### **4. Timeout & Retry Logic**

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

### **5. Error Handling**

**Common error codes:**

| Error Code | Meaning | Action |
|------------|---------|--------|
| `NO_BALANCE` | Insufficient balance | Redirect to fund wallet |
| `NO_NUMBERS` | No numbers available | Show error, suggest retry later |
| `BAD_SERVICE` | Service unavailable | Show error, suggest different service |
| `TIMEOUT` | Request timeout | Show error, suggest retry |
| `UNAUTHENTICATED` | Token expired | Clear storage, redirect to login |

**Implementation:**
```javascript
try {
  const response = await api.purchaseNumber(serviceCode, countryId);
} catch (error) {
  if (error.error === 'NO_BALANCE') {
    toast.error('Insufficient balance');
    navigate('/fund-wallet');
  } else if (error.error === 'NO_NUMBERS') {
    toast.error('No numbers available. Try again later.');
  } else if (error.message === 'Unauthenticated') {
    localStorage.clear();
    navigate('/login');
  } else {
    toast.error(error.message || 'Something went wrong');
  }
}
```

---

## 📋 SUMMARY

### **USA Numbers Page:**
- ✅ 1 endpoint: `GET /auth/services/by-country?country=187`
- ✅ 1 endpoint: `GET /auth/services/prices?service={code}&country={id}`
- ✅ 1 endpoint: `POST /auth/numbers/purchase`
- ✅ Special WhatsApp routing (Canada vs USA)
- ✅ Caching: Services (10 min), Prices (2 min)

### **All Countries Page:**
- ✅ 1 endpoint: `GET /auth/services/countries`
- ✅ 1 endpoint: `GET /auth/services/by-country?country={id}`
- ✅ 1 endpoint: `GET /auth/services/prices?service={code}&country={id}`
- ✅ 1 endpoint: `POST /auth/numbers/purchase`
- ✅ Caching: Countries (30 min), Services (10 min), Prices (2 min)

### **Number History Page:**
- ✅ 1 endpoint: `GET /auth/numbers/my-numbers`
- ✅ 1 endpoint: `GET /auth/numbers/{id}/status` (polling every 3 seconds)
- ✅ 1 endpoint: `POST /auth/numbers/{id}/cancel`
- ✅ 1 endpoint: `POST /auth/numbers/{id}/complete`
- ✅ No caching (real-time data)

### **Other Involved:**
- ✅ Balance checking: `GET /auth/dashboard/balance`
- ✅ Bearer token authentication
- ✅ In-memory caching with TTL
- ✅ Request deduplication (GET only)
- ✅ Timeout & retry (30s, 2 retries)
- ✅ Error handling with codes

---

**That's it! Just these 3 pages with their specific endpoints.** 🎯