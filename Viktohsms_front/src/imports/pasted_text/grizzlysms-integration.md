GrizzlySMS Frontend Integration Guide
This document is written for an AI frontend builder (e.g. Figma Make) to implement the "Buy Virtual Number" flow for the GrizzlySMS provider against an already-built Laravel backend. All backend work is done — you only need to build the UI/UX and call these endpoints.

The app already supports two other providers (SMS-Activate, DaisySMS) with near-identical flows, so if the app already has a "buy number" screen for those, GrizzlySMS should reuse the same visual pattern — just pointed at the /grizzlysms/* endpoints below and tagged with provider: "grizzlysms".

0. Endpoint quick reference
Method	Endpoint	Purpose
GET	/grizzlysms/countries	List countries
GET	/grizzlysms/services	List services (optionally ?country=)
GET	/grizzlysms/prices?service=&country=	Live price (₦) + stock count
POST	/grizzlysms/purchase	Buy a number, debit wallet
GET	/grizzlysms/{id}/status	Poll for OTP code
POST	/grizzlysms/{id}/request-sms	Ask for a 2nd code, same number
POST	/grizzlysms/{id}/complete	Finalize a received order
POST	/grizzlysms/{id}/cancel	Cancel a waiting order, refund wallet
GET	/numbers/my-numbers	Order history (all providers)
GET	/dashboard/balance	Wallet balance
All paths are relative to /api/v1. {id} is always the local purchase id returned from /purchase, never GrizzlySMS's own activation_id.

1. Base URL & Auth
Base API path: /api/v1
Auth: Laravel Sanctum bearer tokens. Every endpoint below (except none — all GrizzlySMS endpoints require auth) needs this header:
Authorization: Bearer <token>
Accept: application/json
Get a token via the existing login flow:

POST /api/v1/auth/login
Body: { "email": "...", "password": "..." }

Response 200:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "1|xxxxxxxxxxxxxxxxxxxx",
    "token_type": "Bearer"
  }
}
Store token, send it as Authorization: Bearer <token> on every request below.

Important: All costs returned by these endpoints are already converted from USD to Naira (NGN) and have the platform's markup applied server-side. The frontend should never do currency math — just display the cost field as-is, prefixed with ₦.

2. The end-to-end flow
1. GET  /grizzlysms/countries        → user picks a country
2. GET  /grizzlysms/services         → user picks a service (WhatsApp, Telegram, etc.)
3. GET  /grizzlysms/prices           → show live price (₦) + how many numbers are in stock
4. POST /grizzlysms/purchase         → buy the number, debits wallet, returns phone number
5. GET  /grizzlysms/{id}/status      → poll every 3-5s until an OTP code arrives
6. (optional) POST /grizzlysms/{id}/request-sms  → ask for a 2nd code on the same number
7. POST /grizzlysms/{id}/complete    → user confirms they used the code (finalizes the order)
      -- or --
   POST /grizzlysms/{id}/cancel      → user gives up before any code arrives (refunds wallet)
State machine for a purchased number (status field):

waiting  --(sms arrives)-->  received  --(user confirms)-->  completed
   |                             |
   |--(user/timeout cancels)-->  cancelled
   |--(20 min countdown hits 0)-->  expired   (auto-refunded)
waiting: number bought, no code yet. Show countdown timer using expires_at.
received: code arrived. Show the OTP code prominently, with a "Copy" button.
completed: user is done, order archived. No more actions available.
cancelled / expired: order dead, wallet was refunded automatically. Show as failed/greyed out in history.
3. Endpoints
3.1 Get countries
GET /api/v1/grizzlysms/countries
Response 200:

{
  "success": true,
  "data": {
    "countries": [
      {
        "id": 187,
        "name": "USA",
        "retry_available": true,
        "rent_available": false,
        "multi_service_available": true
      }
    ]
  }
}
Render as a searchable country picker (flag + name). Use id as the value you pass to every later call as country.

3.2 Get services
GET /api/v1/grizzlysms/services
GET /api/v1/grizzlysms/services?country=187   (optional filter)
Response 200:

{
  "success": true,
  "data": {
    "services": [
      { "code": "wa", "name": "WhatsApp" },
      { "code": "tg", "name": "Telegram" }
    ]
  }
}
Render as a searchable service picker (icon + name). Use code as the value you pass as service in the next steps. If you want an icon per service and none is provided by the API, fall back to a generic "SMS" icon or maintain a small local code→icon map (wa → WhatsApp logo, tg → Telegram logo, etc.) the same way the existing SMS-Activate screen likely already does.

3.3 Get live price + stock
GET /api/v1/grizzlysms/prices?service=wa&country=187
Response 200 (shape mirrors GrizzlySMS's raw API, keyed by country then service):

{
  "success": true,
  "data": {
    "187": {
      "wa": {
        "cost": 750.5,
        "original_cost": 0.35,
        "count": 124
      }
    }
  }
}
cost → already in Naira with markup applied. This is what you show the user, e.g. ₦750.50.
original_cost → raw USD price from GrizzlySMS (for admin/debug views only — do not show to end users).
count → how many numbers are currently in stock for that country/service combo. If count is 0, disable the "Buy" button and show "Out of stock".
Call this whenever the country or service selection changes, to keep the displayed price live.

3.4 Purchase a number
POST /api/v1/grizzlysms/purchase
Body:
{
  "service_code": "wa",
  "country": 187,
  "max_price": 1.00     // optional, in USD — omit unless you expose a "max price" advanced option
}
Success response 201:

{
  "success": true,
  "message": "Number purchased successfully",
  "data": {
    "purchased_number": {
      "id": 482,
      "activation_id": "495357953",
      "phone_number": "18036181752",
      "service": "Whatsapp",
      "cost": 750.50,
      "status": "waiting",
      "provider": "grizzlysms",
      "expires_at": "2026-07-27 01:15:00",
      "can_request_another_sms": false
    },
    "balance": {
      "previous": 5000.00,
      "current": 4249.50
    }
  }
}
Failure 400 (insufficient balance):

{
  "success": false,
  "message": "Insufficient balance",
  "required": 750.50,
  "available": 300.00
}
→ Show a "Top up wallet" prompt/CTA instead of a generic error.

Failure 400 (no numbers in stock / provider error):

{
  "success": false,
  "message": "Failed to purchase number",
  "error": "No numbers available"
}
→ Show "No numbers currently available for this country/service, try another combination."

After a successful purchase, navigate to the "waiting for code" screen. Save id (the local purchase id, NOT activation_id) — that's what you use for every following call. Start a countdown to expires_at and start polling status (next section).

3.5 Poll for the OTP code
GET /api/v1/grizzlysms/{id}/status
Poll this every 3–5 seconds while status is waiting. Stop polling once you get received, expired, or cancelled — or once the user navigates away.

While waiting, 200:

{
  "success": true,
  "data": {
    "status": "waiting",
    "message": "Waiting for OTP code",
    "expires_at": "2026-07-27 01:15:00"
  }
}
Once code arrives, 200:

{
  "success": true,
  "data": {
    "status": "received",
    "otp_code": "852508",
    "sms_text": "852508",
    "received_at": "2026-07-27 00:58:16"
  }
}
→ Stop polling. Show the code in large text with a copy-to-clipboard button. Show "Complete" and (if can_request_another_sms was true on purchase) "Request another code" buttons.

If expired, 400:

{ "success": false, "message": "Activation expired", "status": "expired" }
→ Stop polling, show "Number expired — refunded to your wallet", update the wallet balance display (fetch /dashboard/balance), let the user try a new purchase.

If the order was cancelled server-side (rare — provider-side cancellation), 400:

{ "success": false, "message": "Activation cancelled by provider", "status": "cancelled" }
3.6 Request another SMS on the same number
Only show this button if can_request_another_sms was true in the purchase response and current status is waiting (i.e. before the first code, if the number supports multiple sends) or after received if you want to support repeat codes on the same number — check can_request_another_sms from the latest status/purchase payload.

POST /api/v1/grizzlysms/{id}/request-sms
Response 200:

{ "success": true, "message": "Another SMS requested successfully" }
→ Resume polling GET /grizzlysms/{id}/status.

3.7 Complete the order
Call this once the user confirms they've used the OTP code successfully (e.g. they tap "Done" after pasting the code into WhatsApp/Telegram/etc). This finalizes the order on GrizzlySMS's side and archives it.

POST /api/v1/grizzlysms/{id}/complete
Response 200:

{ "success": true, "message": "Activation completed successfully" }
→ Navigate back to the buy-number screen or order history. Order now shows as completed and is final (money already spent, no refund).

Only callable while status is received — hide/disable the button otherwise.

3.8 Cancel the order
Let the user cancel manually while still waiting (before any code arrives) — e.g. they picked the wrong service, or don't want to wait. This refunds the wallet.

POST /api/v1/grizzlysms/{id}/cancel
Response 200:

{
  "success": true,
  "message": "Activation cancelled and balance refunded",
  "data": {
    "refunded_amount": 750.50,
    "current_balance": 5000.00
  }
}
→ Update the displayed wallet balance immediately from current_balance. Only callable while status is waiting — hide/disable the button otherwise (e.g. once a code has been received, cancel is no longer available — only complete is).