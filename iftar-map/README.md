# 🌙 ইফতার শেয়ার ম্যাপ ২০২৬

> রমজান ২০২৬ - বাংলাদেশের সেরা ইফতার শেয়ার ম্যাপ

**Live Demo:** `npm install && npm run dev` → http://localhost:3000

---

## ⚡ Quick Start (৫ মিনিটে লাইভ)

```bash
# 1. Dependencies install
npm install

# 2. Firebase config সেট করুন (.env.local তৈরি করুন)
cp .env.local.example .env.local
# .env.local ফাইলে আপনার Firebase config paste করুন

# 3. Local development
npm run dev

# 4. Vercel deploy
npx vercel --prod
```

---

## 🔥 Firebase Setup (একবার করতে হবে)

### Step 1: Firebase Project তৈরি করুন
1. [Firebase Console](https://console.firebase.google.com) খুলুন
2. **New Project** → Name: `iftarsharebd`
3. **Add Web App** → Config copy করুন → `.env.local` এ paste করুন

### Step 2: Firestore Database তৈরি করুন
1. Firebase Console → **Firestore Database** → **Create Database**
2. **Production mode** সিলেক্ট করুন
3. Region: **asia-south1** (ঢাকার কাছাকাছি)

### Step 3: Security Rules সেট করুন
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write (রমজানে সবার জন্য open রাখুন)
    match /iftar_locations/{doc} { allow read: if true; allow write: if true; }
    match /volunteers/{doc} { allow read: if true; allow write: if true; }
    match /help_requests/{doc} { allow read: if true; allow write: if true; }
    match /eid_routes/{doc} { allow read: if true; allow write: if true; }
    match /stats/{doc} { allow read: if true; allow write: if true; }
  }
}
```

### Step 4: Initial Stats Document তৈরি করুন
Firestore Console → `stats` collection → `daily` document:
```json
{
  "total": 18450,
  "volunteers": 0,
  "locations": 12,
  "help_fulfilled": 0,
  "last_updated": null
}
```

---

## 🏗️ Project Structure

```
iftar-map/
├── app/
│   ├── layout.tsx          # PWA meta + SW registration
│   └── page.tsx            # Main page
├── components/
│   ├── app-header.tsx      # Header + LiveCounter
│   ├── live-counter.tsx    # 🔥 Firebase realtime counter
│   ├── iftar-map.tsx       # Leaflet map (Bangladesh)
│   ├── add-iftar-modal.tsx # 🔥 GPS-verified spot submission
│   ├── volunteer-panel.tsx # 🔥 Firebase registration + leaderboard
│   ├── info-panel.tsx      # Side/bottom panel
│   ├── share-card.tsx      # WhatsApp/FB share card
│   └── bottom-nav.tsx      # Tab navigation
├── lib/
│   ├── firebase.ts         # 🔥 Firebase config
│   ├── firestore.ts        # 🔥 All Firestore operations
│   └── map-data.ts         # Static fallback data
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
└── .env.local.example      # Firebase env template
```

---

## 🔐 3-Layer Anti-Fake System

| Layer | কীভাবে কাজ করে | Status |
|-------|----------------|--------|
| **Layer 1** | GPS Check → ব্যবহারকারীর অবস্থান < 500m | ✅ Implemented |
| **Layer 2** | Community Vote → ৮৫%+ YES = 🟢 Verified | ✅ Auto-verify in Firestore |
| **Layer 3** | Admin Manual Approve → ⭐ Gold Badge | ✅ Firestore Console |

---

## 📱 Features

- 🗺️ **Interactive Map** - Bangladesh Leaflet map with colored markers
- 🔥 **Firebase Realtime** - Live counter, locations, volunteers
- 📍 **GPS Verification** - Layer 1 anti-fake with haversine distance
- 👥 **Community Voting** - Layer 2 auto-verification at 85%+
- 🙋 **Volunteer Registration** - Firebase form + leaderboard
- 🎉 **Confetti + Voice** - 20K target celebration
- 📲 **PWA** - Offline support, push notifications
- 📤 **Share Card** - WhatsApp/Facebook viral sharing
- 🌐 **Bilingual SEO** - বাংলা + English

---

## 🚀 Vercel 1-Click Deploy

```bash
# Option 1: CLI
npx vercel --prod

# Option 2: GitHub → vercel.com → Import repo
# (vercel.json already configured)

# Environment variables Vercel তে add করুন:
# vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# ... (সব NEXT_PUBLIC_ variables)
```

---

## 📊 Firestore Collections

### `iftar_locations`
```typescript
{
  name: string           // "গুলশান ইফতার পয়েন্ট"
  location: string       // "গুলশান-১, ঢাকা"
  lat, lng: number       // GPS coordinates
  food_type: string      // "সব ধরন"
  time: string           // "৬:১৫ PM"
  meals: number          // 500
  contact: string        // "01711-XXXXXX"
  verified: boolean      // Community vote ৮৫%+
  votes_yes, votes_no    // Community voting
  gold_badge: boolean    // Admin approval ⭐
  gps_verified: boolean  // Layer 1 GPS check
  created_at: Timestamp
}
```

### `volunteers`
```typescript
{
  name, phone, city: string
  target_group: 'rickshaw' | 'homeless' | 'orphan' | 'widow' | 'all'
  meals_target, meals_done: number
  sawab_points: number    // গেমিফিকেশন
  joined_at: Timestamp
}
```

### `help_requests`
```typescript
{
  location: string
  lat, lng: number
  people_count: number
  urgency: 'low' | 'medium' | 'high'
  need_description: string
  fulfilled: boolean
  created_at: Timestamp
}
```

### `stats/daily`
```typescript
{
  total: number           // আজকের total ইফতার
  volunteers: number
  locations: number
  help_fulfilled: number
  last_updated: Timestamp
}
```

---

## 🎯 Viral Features

1. **শেয়ার কার্ড** → "আজ আমরা ১৮,৪৫০+ মানুষকে ইফতার দিলাম!"
2. **Confetti Explosion** → ২০,০০০ target hit হলে
3. **Voice Announcement** → Speech Synthesis API
4. **Push Notifications** → "কাছাকাছি ইফতার পাওয়া গেছে!"
5. **Leaderboard + Sawab Points** → গেমিফিকেশন

---

Made with ❤️ for Bangladesh | রমজান মুবারাক 🌙
