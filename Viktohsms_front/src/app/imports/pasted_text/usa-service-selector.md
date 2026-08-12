Redesign the “USA Service” section service selector dropdown for a web dashboard to be fully responsive and optimized for mobile devices.

🔹 Core Constraints

Maintain all existing API calls, service data, and backend structure exactly as they are.

Only redesign the UI/UX of the service selection component.

The section name remains “USA Service”.

📱 Mobile UX Redesign (Critical)

Replace the current dropdown with a:

👉 Bottom Sheet Service Selector

When user taps “Select a service” in the USA Service section:

Open a bottom sheet modal

Smooth slide-up animation

Occupies 80–100% of screen height

Rounded top corners for modern feel

🔍 Inside the USA Service Selector
1. Header

Title: “Select USA Service”

Close (X) icon at top right

2. Search Functionality

Sticky search bar at the top

Placeholder: “Search services…”

Real-time filtering (for 200+ services)

3. Service List

Scrollable vertical list

Each item includes:

Service name (e.g., Rappi, Coca-Cola, Taptap Send)

Optional icon/logo

Large touch targets (mobile-friendly spacing)

4. Selection State

Highlight selected service

Add checkmark or active indicator

Auto-fill selected value back into the USA Service field

❌ Close Interactions

Tap outside to close

Swipe down to dismiss

Close button (X)

🎨 Design Guidelines

Maintain existing dark theme + purple gradient colors

Improve:

Spacing

Readability

Touch accessibility

Use soft shadows and smooth transitions

⚙️ States to Design

Default (no service selected)

Open (bottom sheet active)

Selected service

Empty search state (“No services found”)

Loading state (if services are being fetched)

📐 Responsiveness Behavior

Mobile: Bottom sheet (primary experience)

Tablet: Centered modal or wider bottom sheet

Desktop: Can remain dropdown OR upgraded to searchable modal

🧩 Component Requirement

Make this a reusable “Service Selector” component

Can be used across:

USA Numbers

Other country services

Any future dropdowns

🚀 Expected Outcome

Smooth, modern mobile experience

Easy selection from large service list

Completely replaces the current non-responsive dropdown

Clean and developer-friendly structure