# ConvoCam 🎥💬

ConvoCam is a full-stack real-time communication and language exchange web application. It connects language learners across the world, offering real-time messaging, AI-powered smart replies, real-time message translation, speech-to-text voice typing, file sharing, and 1-on-1 video calling powered purely by **Socket.IO and WebRTC** (No third-party Stream service required!).

---

## 🌟 Key Features

- **🔐 Authentication & User Profiles:**
  - Secure JWT-based authentication using HTTP-Only cookies.
  - User onboarding flow to specify native language, target learning language, bio, location, and random avatars.
- **🤝 Friend & Language Partner Discovery:**
  - Discover language exchange partners based on native & learning language matches.
  - Send, accept, and manage friend requests.
- **⚡ Real-Time Chat (Socket.IO):**
  - Instant 1-on-1 messaging with read and delivery timestamps.
  - Real-time typing indicators and live online user tracking.
- **📹 1-on-1 Video Calling (Socket.IO + WebRTC):**
  - High-performance peer-to-peer **WebRTC** video calling with Socket.IO signaling.
  - Full controls: Mic Mute/Unmute, Camera On/Off, and End Call.
  - No third-party video limits or API keys needed.
- **🤖 AI-Powered Chat Assistance (Google Gemini):**
  - **Smart Replies:** Context-aware quick reply suggestions.
  - **Live Translation:** Multi-language message translation (Hindi, English, Spanish, French, Bengali, etc.).
- **🎙️ Voice Typing:**
  - Speech-to-text transcription powered by the Web Speech API.
- **📁 File & Image Attachments:**
  - Direct upload of images and documents stored securely via Cloudinary CDN.
- **🎨 Modern UI & Theming:**
  - Responsive design with Tailwind CSS and 32 customizable DaisyUI themes.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, TanStack React Query v5, Zustand, Tailwind CSS, DaisyUI, Lucide Icons, Socket.IO Client, WebRTC |
| **Backend** | Node.js, Express.js (ES Modules), Socket.IO (WebSockets & WebRTC Signaling), Mongoose (MongoDB), Cloudinary, Multer |
| **AI & Media** | Google Generative AI (Gemini 2.5 Flash), Web Speech API, Cloudinary CDN |

---

## 📁 Project Directory Structure

```text
convocam_project/
└── ConvoCam/
    ├── backened/
    │   ├── src/
    │   │   ├── controllers/      # Route controllers (auth, user, messages)
    │   │   ├── lib/              # DB connection
    │   │   ├── middleware/       # Auth verification middleware
    │   │   ├── models/           # Mongoose schemas (User, Message, FriendRequest)
    │   │   ├── routes/           # Express API endpoints
    │   │   └── server.js         # HTTP server, Socket.IO & WebRTC signaling
    │   ├── .env.example          # Backend environment variables template
    │   └── package.json
    │
    └── frontened/
        ├── src/
        │   ├── components/       # Reusable UI components (Chat, VideoCall, Navbar, etc.)
        │   ├── hooks/            # Custom React Query & Socket hooks
        │   ├── lib/              # Axios instance & API utility functions
        │   ├── pages/            # Page components (Home, Chat, Call, Friends, etc.)
        │   └── store/            # Zustand stores (useChatStore, useThemeStore)
        ├── .env.example          # Frontend environment variables template
        ├── vercel.json           # Vercel SPA redirect config
        ├── vite.config.js
        └── package.json
```

---

## ⚙️ Prerequisites & External Accounts

You only need 3 free services:

1. **Node.js**: `v18+` or `v20+` installed.
2. **MongoDB Database**: MongoDB Atlas free cluster connection string.
3. **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/).
4. **Cloudinary Account**: Cloud Name, API Key, and API Secret from [Cloudinary Console](https://cloudinary.com/).

*(No GetStream.io account needed — all real-time messaging and video calls use Socket.IO and native WebRTC!)*

---

## 🚀 Local Development Setup

### 1. Configure Backend Environment
In `ConvoCam/backened/.env`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Configure Frontend Environment
In `ConvoCam/frontened/.env`:
```env
VITE_BACKEND_URL=http://localhost:5001
```

### 3. Start Backend:
```bash
cd ConvoCam/backened
npm install
npm run dev
```
> Backend runs at `http://localhost:5001`

### 4. Start Frontend (in a new terminal):
```bash
cd ConvoCam/frontened
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## 🌐 Production Deployment Guide

### A. Deploy Backend (Render / Railway / VPS)

1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com/).
3. Set the following settings:
   - **Root Directory:** `ConvoCam/backened` (or `backened`)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5001`
   - `MONGO_URI` = `your_mongodb_atlas_uri`
   - `JWT_SECRET_KEY` = `your_strong_jwt_secret`
   - `GEMINI_API_KEY` = `your_gemini_api_key`
   - `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
   - `FRONTEND_URL` = `https://your-frontend-app.vercel.app`
   - `CLIENT_URL` = `https://your-frontend-app.vercel.app`

---

### B. Deploy Frontend (Vercel)

1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Set the **Root Directory** to `ConvoCam/frontened` (or `frontened`).
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_BACKEND_URL` = `https://your-backend.onrender.com`
5. Click **Deploy**.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in user & issue JWT cookie | No |
| `POST` | `/api/auth/logout` | Clear JWT authentication cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user details | Yes |
| `POST` | `/api/auth/onboarding` | Complete user profile onboarding | Yes |

### Users & Friends (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users` | Get recommended language partner users | Yes |
| `GET` | `/api/users/friends` | Get current user's friends | Yes |
| `POST` | `/api/users/friend-request/:id` | Send friend request to user ID | Yes |
| `PUT` | `/api/users/friend-request/:id/accept` | Accept pending friend request | Yes |
| `GET` | `/api/users/friend-requests` | Get incoming & accepted friend requests | Yes |
| `GET` | `/api/users/outgoing-friend-requests` | Get sent pending friend requests | Yes |
| `GET` | `/api/users/:id` | Get user profile by ID | Yes |

### Messages & Files (`/api/messages`, `/api/upload`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/messages?userId=...&otherUserId=...` | Fetch chat history between two users | No |
| `POST` | `/api/messages` | Save a new chat message | No |
| `POST` | `/api/upload` | Upload an image/file attachment to Cloudinary | No |

### AI Assistant (`/api/gemini`, `/api/translate`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/gemini/suggest-replies` | Generate 3 smart quick reply suggestions | No |
| `POST` | `/api/translate` | Translate message into target language | No |
