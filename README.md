# ConvoCam

A full-stack chat application built with **React (Vite)** frontend and **Node.js + Express** backend, using **MongoDB** for data storage.

---

## 🚀 Features

- User authentication (JWT, cookies)
- Real-time chat (Socket.io)
- Friend requests
- File/image upload
- Google Gemini API integration
- Language translation
- Online users tracking

---

## 🏗️ Project Structure

```
/frontened   # React + Vite frontend
/backened    # Node.js + Express backend
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/ConvoCam.git
cd ConvoCam
```

### 2. Install dependencies

- **Frontend:**
  ```sh
  cd frontened
  npm install
  ```

- **Backend:**
  ```sh
  cd backened
  npm install
  ```

### 3. Environment Variables

- **Frontend (`frontened/.env`):**
  ```
  VITE_BACKEND_URL=http://localhost:5001
  ```

- **Backend (`backened/.env`):**
  ```
  PORT=5001
  MONGO_URI=your_mongodb_uri
  JWT_SECRET_KEY=your_jwt_secret
  ```

### 4. Run locally

- **Frontend:**
  ```sh
  npm run dev
  ```

- **Backend:**
  ```sh
  npm run dev
  ```

---

## 🌐 Deployment Part

- **Frontend:** Vercel ([see deployed link](https://convo-cam-git-main-priyanshu886291kumars-projects.vercel.app/login))
- 
- **Backend:** Render or other Node.js hosting(https://convo-backend-te78.onrender.com/)

Update `VITE_BACKEND_URL` in frontend `.env` to your backend’s deployed URL.

---

## 📦 API Endpoints

- `/api/auth` – Authentication
- `/api/users` – User management
- `/api/chat` – Chat operations
- `/api/messages` – Messaging
- `/api/upload` – File uploads
- `/api/gemini` – Gemini API
- `/api/translate` – Translation
- `/api/stream` – Streaming

---

## 🤝 Contributing

Pull requests welcome! Please open issues for bugs or feature requests.

---

