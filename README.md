# ULink Valet — Itihaas Restaurant & Banquets

> **Created by UCreates** for **Itihaas Restaurant & Banquets**

ULink Valet is an interactive customer-engagement and valet management prototype. It provides a seamless bridge between restaurant valet staff and dining guests via a simulated WhatsApp interface, live vehicle status synchronization, deterministic review generation, and digital menu access.

---

## 🎨 Brand Aesthetics

Designed specifically for **Itihaas Restaurant & Banquets** using their signature royal palette:
- **Cream / Off-White**: `#FFFDF7`, `#FBF7EE`
- **Deep Burgundy / Wine**: `#4A150B`, `#3B0F07`
- **Burnt Orange / Gold**: `#D97706`, `#E07A5F`
- **Warm Beige / Tan**: `#F3EAD8`, `#EADBC8`

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 / 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL (with automatic zero-friction fallback store for instant local demo)
- **Icons**: Lucide React
- **Effects**: Canvas Confetti

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

`.env.local` contents:
```env
# Optional: Supabase Database Integration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Itihaas Restaurant Configuration
NEXT_PUBLIC_RESTAURANT_NAME="Itihaas Restaurant & Banquets"
NEXT_PUBLIC_WEBSITE_URL="https://itihaasindia.in"
NEXT_PUBLIC_INSTAGRAM_URL="https://www.instagram.com/itihaasindia"
NEXT_PUBLIC_GOOGLE_REVIEW_URL="https://search.google.com/local/writereview?placeid=ChIJ_itihaas_demo_place_id"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

To connect a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of `supabase/schema.sql`.
4. Copy your `Project URL` and `anon key` to `.env.local`.

---

## 📱 Complete Demonstration Flow (30 Steps)

1. Open `/dashboard`.
2. Click **Use Demo Customer** (auto-fills Umesh, +91 9876543210, TS09 AB 1234, Toyota Fortuner).
3. Click **SEND WHATSAPP**.
4. Simulated WhatsApp interface opens at `/whatsapp?session=...`.
5. Customer views welcome message with vehicle details.
6. Customer clicks **🚘 Bring My Car**.
7. Dashboard receives request in real-time.
8. Dashboard updates status to **REQUESTED**.
9. Valet staff clicks **CAR FOUND**.
10. Customer receives simulated WhatsApp update: *"We've located your vehicle..."*.
11. Valet staff clicks **START BRINGING**.
12. Customer receives update: *"Your vehicle is on its way (~2 minutes)"*.
13. Valet staff clicks **MARK AS READY**.
14. Customer receives update: *"Your car is ready. Please proceed to pickup area"*.
15. Valet staff clicks **MARK COMPLETED**.
16. Request moves to Completed status.
17. Return to WhatsApp view.
18. Click **⭐ Rate Your Experience**.
19. Select 5 stars rating.
20. Select feedback tags (*Food*, *Taste*, *Ambience*, *Valet Parking*).
21. Click **GENERATE REVIEW**.
22. Review text is dynamically synthesized.
23. Edit review text if desired.
24. Click **COPY REVIEW** (triggers confetti & toast notification).
25. Click **CONTINUE TO GOOGLE REVIEW**.
26. Google Review URL opens in a new tab.
27. Return to WhatsApp view.
28. Click **🍽️ View Menu** -> Opens `/menu`.
29. Click **🌐 Visit Website** -> Opens `itihaasindia.in`.
30. Click **📸 Instagram** / **💬 Give Feedback**.

---

## 🔄 Meta WhatsApp Cloud API Migration Guide

The messaging system is architected behind a clean abstraction layer (`WhatsAppService`). To connect real WhatsApp messages via Meta:

1. Set up a **Meta Developer Account** and create a WhatsApp App.
2. Obtain a `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`.
3. Update `src/lib/db.ts` `appendStatusWhatsAppMessage` to invoke Meta's Graph API:
   ```ts
   await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${ACCESS_TOKEN}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       messaging_product: 'whatsapp',
       to: recipientMobile,
       type: 'text',
       text: { body: messageText }
     })
   });
   ```

---

## 🌐 Deploying to Vercel

1. Push code to GitHub.
2. Connect repository to [Vercel](https://vercel.com).
3. Add environment variables from `.env.local` in project settings.
4. Click **Deploy**.
