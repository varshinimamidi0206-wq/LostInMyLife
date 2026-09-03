# LostInMyLife 🧠
> **"Search your physical memories, not just your photos."**  
> *A private AI memory system for the physical world.*

---

## 🌟 Overview

People see dozens of useful things in daily life — products, clothing, electronics, price tags, coffee shops, signs, documents — but quickly forget:
- **Where** they saw it
- **What** the object was
- **How much** it cost
- **Which store** had it
- **When** they encountered it

**LostInMyLife** lets you capture physical memories using your phone camera. Gemini Vision AI analyzes the visual context to extract structured attributes (object name, brand, price, currency, colors, visible text, location clues). Later, you can ask your memory in natural language ("Where did I see the blue handbag?") and receive **grounded answers backed by visual evidence cards**.

---

## ⚡ Key Features

1. **Visual Capture**:
   - Live browser camera snapshot with viewfinder reticle + environment/user camera switching.
   - Image upload fallback for gallery photos.
   - Geolocation detection + manual location input fallback.
2. **AI Structured Memory Analysis**:
   - Structured JSON output with Gemini Vision (object name, category, brand, model, price, colors, visible text, details).
   - Stepwise loading animation (*"Looking at your memory..."* → *"Finding important details..."* → *"Saving your memory..."*).
3. **"Have I Seen This Before?" (Duplicate & Related Sightings)**:
   - Compares newly captured items against past memories.
   - Alerts user: *"Yes — you saw a similar blue handbag 6 days ago at Lifestyle Store"*.
4. **"Ask My Memory" (Grounded AI Search)**:
   - Natural language question answering with voice input (Web Speech API).
   - Zero-hallucination grounding: answers are strictly formulated using retrieved memories.
   - Displays supporting evidence cards (*"Based on these memories"*).
5. **Context Connections**:
   - Visual chain showing the connected context of an object (*Object → Store → Price → Noted Text → Encrypted Memory*).
6. **Memory Studio (Desktop View)**:
   - High-level overview: Total Memories, Top Categories, Places Remembered, Tracked Price Values.
   - Chronological Visual Timeline stream by date.
   - Prototype device synchronization indicator: `Phone ↔ Memory Studio [Connected Device]`.
7. **Hackathon Demo Mode**:
   - Preloaded with 4 realistic Indian context memories (Lifestyle Store Chennai, Croma T. Nagar, Beach Road Roasters, Phoenix Marketcity).
   - 1-click sample questions for instant judging test under 60 seconds without entering API keys.
8. **Privacy First**:
   - Data control settings: wipe memories, reset to demo data, clear uploads.
   - Architecture note: *"Designed for privacy. On-device AI can be added for sensitive processing."*

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Vercel-compatible serverless API routes (`/api/*`)
- **AI**: Google Generative AI (Gemini 1.5 Flash / 2.0 Flash) with structured JSON schema
- **Database**: Supabase PostgreSQL with full-text search and optional pgvector support
- **Storage**: Supabase Storage (`memory-images` bucket) with base64 Data URL fallback

---

## 🚀 Quick Start (Local Run)

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional for Demo Mode, Recommended for Live AI)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```env
# Gemini API Key (for live image analysis & grounded ask)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional: app falls back to local storage if not configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. All `/api/*` serverless functions are automatically served during dev via the built-in Vite API middleware.

### 5. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Setup Instructions

If you wish to use Supabase for cloud persistence:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings** → **API**, copy your `Project URL` and `anon/public` key into `.env`.

### 2. Create Database Tables
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
   - This creates the `memories` table, search trigger, full-text indexes, and RLS policies.
3. *(Optional)* Run [`supabase/seed.sql`](./supabase/seed.sql) to seed the 4 demo memories directly into your Supabase database.

### 3. Create Storage Bucket
1. In the Supabase Dashboard, go to **Storage** → **New bucket**.
2. Name the bucket: `memory-images`.
3. Toggle **Public bucket** to **ON**.
4. Click **Save**.

---

## 🤖 Gemini API Setup Instructions

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a free API key.
3. Add it to your `.env` file as `GEMINI_API_KEY=AIzaSy...` (or in Vercel project settings).
4. All Gemini calls are executed server-side in `/api/analyze-memory.ts` and `/api/ask-memory.ts`. **Your key is never exposed to the frontend browser bundle.**

---

## 📷 Google Photos Picker API Setup Instructions (Real-Time Photos)

LostInMyLife uses Google's privacy-first **Google Photos Picker API** (`photospicker.googleapis.com`), which lets you pick individual photos without scanning your entire photo library.

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project (e.g. `LostInMyLife`).
3. In **APIs & Services** → **Library**, search for and enable **Google Photos Picker API**.
4. In **APIs & Services** → **OAuth consent screen**:
   - Select **External** and fill in your App Name and email.
   - Under **Scopes**, add `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`.
   - Under **Test Users**, add your Gmail address (required while in testing mode).
5. In **APIs & Services** → **Credentials**:
   - Click **+ Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `LostInMyLife Web`.
   - Under **Authorized JavaScript origins**, add: `http://localhost:5173` (and production domain if deployed).
   - Click **Create** and copy your **Client ID** (`xxx.apps.googleusercontent.com`).
6. Add the Client ID to your `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```
7. Restart the dev server (`npm run dev`). The **Pick from Google Photos** button will now be active in the modal.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Log in to [vercel.com](https://vercel.com) and click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Framework Preset: **Vite** (detected automatically).
5. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**. Vercel will build the frontend and deploy the serverless routes in `/api/`.

---

## ⏱ 60-Second Hackathon Judge Demo Flow

1. **Open LostInMyLife**: View the 4 realistic Indian memories on the Home dashboard.
2. **Test Grounded Ask**:
   - Click the quick test chip: *"Where did I see the blue handbag?"* (or tap the microphone).
   - Gemini answers: *"You saw a blue handbag at Lifestyle Store, Express Avenue, Chennai on September 2, 2026. The recorded price was ₹1,499."*
   - Observe the **evidence card** citation below the answer.
3. **Test Capture & "Have I Seen This Before?"**:
   - Tap **+ Capture Memory**.
   - Take a photo or upload an image (e.g., a handbag or headphones).
   - Tap **Remember This** and watch the stepwise loading state (*"Looking at your memory..."* → *"Finding important details..."* → *"Saving your memory..."*).
   - If a similar item exists in your archive, observe the **"Have I seen this before?"** sighting banner!
4. **Inspect Memory Details & Context Connections**:
   - Tap on the memory card to view extracted tags, price, and the **Context Connection chain** (*Object → Store → Price → Sensory Details*).
5. **View Memory Studio**:
   - Switch to **Memory Studio** to view the chronological timeline and device sync indicator.

---

## ⚖️ Privacy & Architecture

- **Server-Side AI**: Visual analysis and grounding take place strictly in serverless API routes.
- **On-Device Ready**: Designed so on-device / local small language models (like MediaPipe / Gemma) can be slotted in place of the `/api/analyze-memory` route for sensitive use cases.
- **Privacy Controls**: Users can delete individual memories, clear all records, or reload demo data at any time from the Privacy dialog.
