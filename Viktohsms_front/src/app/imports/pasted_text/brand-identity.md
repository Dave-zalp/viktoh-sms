Brand Identity

Brand Name: Viktohs SMS
Logo: Script-style "Viktohs" wordmark in glossy purple + "SMS" in a speech bubble badge + flying envelope icon with speed lines + orbital swoosh ring
Brand Personality: Bold, fast, trustworthy, tech-forward with a premium edge
Logo Placement: Top-left in navbar. Always on dark or white background — never on busy patterns


Color System
Primary Purple:       #8B00FF  (match logo's vivid violet)
Mid Purple:           #A020F0
Light Purple:         #C77DFF
Purple Glow:          #BF5FFF  (for glows/shadows)
White:                #FFFFFF
Off-white:            #F8F4FF
Soft Lavender:        #EDE7FF  (light mode cards)

— Dark Mode —
Dark BG:              #0A0710
Dark Surface:         #120D1E
Dark Card:            #1C1530
Dark Border:          #2E2050

Typography
Display/Hero Font:    "Clash Display" — bold headlines
Sub-heading Font:     "Syne" — section titles
Body Font:            "DM Sans" — paragraphs, UI labels
Code/Number Font:     "JetBrains Mono" — phone numbers, OTP codes

Import all from Google Fonts or CDN


Page Structure & Layout (Full Redesign)

1. Navbar

Left: Viktohs SMS logo (use uploaded logo asset, trim black background)
Center: Navigation links — Features · How It Works · Pricing · FAQ
Right: 🌙/☀️ Dark Mode Toggle + "Get Started →" button (purple fill, white text, pill-shaped)
Style: Frosted glass effect (backdrop-filter: blur), thin purple bottom glow line on scroll
Mobile: Hamburger menu with full-screen slide-in drawer


2. Hero Section — Asymmetric Split

Layout: 55% left / 45% right — NOT centered
Left side:

Small badge pill: ⚡ "Trusted by 100,000+ users worldwide"
H1: "SMS Verification" (large, Clash Display)
H1 accent line: "Without Limits" (same size, glowing purple)
Body: "Get temporary phone numbers from 150+ countries. Verify any account, protect your privacy, and receive SMS codes instantly."
CTA: "Get Started →" (large pill button, purple gradient) + ghost secondary button "See How It Works"
Trust row: 3 small icon+text badges — ✅ Instant · 🔒 Private · 💰 Affordable


Right side:

Floating dark card UI mockup showing a fake dashboard — country dropdown, a phone number display, an incoming SMS code box
Subtle purple radial glow behind the card
A small animated pulsing dot to suggest "live"


Background: Deep dark with a mesh gradient blob of purple bottom-right (dark mode) / clean white with soft lavender blob (light mode)


3. Features — Horizontal Scrollable Cards

Section label pill: "Why Viktohs SMS"
Section title: "Everything You Need, Nothing You Don't"
6 cards in a horizontally scrollable row (not grid):

🌍 150+ Countries
⚡ Instant Delivery
💸 Best Pricing
🛡️ Complete Privacy
📱 All Platforms
🚫 No Commitments


Card style: Glassmorphism — light purple frosted glass (light) / dark purple frosted (dark), purple icon badge top-left, title, 1-line description
Hover: card lifts + purple drop shadow blooms


4. Supported Platforms — Marquee Strip

Full-width dark purple band
Two rows of platform logos (Twitter/X, Facebook, Instagram, WhatsApp, Telegram, Gmail, TikTok, Snapchat, etc.)
Row 1 scrolls left → Row 2 scrolls right →
Each logo in a rounded white/dark pill chip
Title above: "Works With 150+ Platforms"


5. How It Works — Vertical Timeline

Section label: "Simple Process"
Section title: "Get Started in 3 Easy Steps"
Layout: Timeline down the center with a glowing purple vertical line
Each step node: Purple numbered circle + icon + title + description
Alternating sides: Step 1 content LEFT, Step 2 RIGHT, Step 3 LEFT
Beside each step: small illustrated UI element

Step 1: Country + service dropdown UI
Step 2: Phone number card with copy button
Step 3: OTP code box with checkmark


CTA at bottom: "Start Verifying Now →"


6. FAQ — Two-Column Accordion

Section label: "Got Questions?"
Title: "Frequently Asked Questions"
Two-column layout (2 FAQs per row, 4 total visible)
Active state: left purple border + soft lavender/dark purple bg
Questions:

How does Viktohs SMS work?
What platforms can I verify?
How much does it cost?
Is my personal information safe?




7. CTA Banner

Full-width section, purple gradient background
Big headline: "Ready to Verify Without Limits?"
Subtext: "Join 100,000+ users. No credit card needed."
Button: White fill, purple text — "Get Started Free →"
Decorative: faint envelope icon and swoosh from the logo repeated large in background at low opacity


8. Footer — Four Column

Col 1: Viktohs SMS logo + tagline + social icons (WhatsApp, Telegram)
Col 2: Quick Links (Features, How It Works, FAQ)
Col 3: Legal (Privacy Policy, Terms of Service)
Col 4: "Stay Updated" — email input + Subscribe button
Bottom bar: © 2025 Viktohs SMS. All rights reserved. — centered, purple separator line above


Dark / Light Mode Specs
ElementLight ModeDark ModeBackground#F8F4FF#0A0710Cards#EDE7FF with blur#1C1530 with blurText#1A0A2E#F8F4FFAccent#8B00FF#BF5FFFNavwhite + blurdark + blur

Micro-interactions

CTA button: shimmer sweep left→right on hover
Marquee: pauses on hover
Timeline line: draws downward on scroll (use Figma Smart Animate)
FAQ: smooth expand/collapse with height transition
Dark mode toggle: sun/moon swap with rotation animation
Cards: scale(1.03) + shadow bloom on hover