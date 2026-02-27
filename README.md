# intervue.io - Resilient Real-time Polling System

A powerful, high-fidelity real-time polling application designed for interactive classroom or interview settings. Teachers can create and manage polls, while students participate in real-time with live results and integrated chat.

## 🚀 Features

- **Teacher Dashboard**: Create multi-option polls, set custom durations, and manage active sessions.
- **Student Dashboard**: Real-time participation with instant vote broadcasting.
- **Live Results**: Interactive progress bars on both teacher and student screens.
- **Integrated Chat**: Real-time communication for both teachers and students.
- **Student Management**: Teacher can kick/ban students and manage participant lists.
- **Poll History**: View and review previous polls and their results.
- **Resilient Architecture**: Auto-recovery from server restarts and timer synchronization across clients.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Axios, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).
- **Styling**: Vanilla CSS (High-fidelity Figma recreation).

## 🏃 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or cloud)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vivekpal24/intervue.io.git
   cd intervue.io
   ```

2. Install Backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install Frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *The server will run on `http://localhost:3000` by default.*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   *The app will run on `http://localhost:5173`.*

## 🌐 Live Deployment

- **Frontend**: [https://intervue-io-sand.vercel.app](https://intervue-io-sand.vercel.app)
- **Backend API**: [https://intervue-io-7vac.onrender.com](https://intervue-io-7vac.onrender.com)

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
MONGODB_URI=mongodb+srv://... (or local)
CORS_ORIGIN=https://intervue-io-sand.vercel.app
```

### Frontend (`frontend/.env` or Vercel Settings)
```env
VITE_API_URL=https://intervue-io-7vac.onrender.com
VITE_SOCKET_URL=https://intervue-io-7vac.onrender.com
```

## 📂 Project Structure

```text
intervue.io/
├── frontend/             # React (TS) + Vite
│   ├── vercel.json       # SPA routing fix for Vercel
│   ├── src/
│   │   ├── components/   # Floating Sidebar, Result Cards, etc.
│   │   ├── pages/        # HomePage, TeacherPage, StudentPage
│   │   └── hooks/        # socket.io hooks, countdown timers
├── backend/              # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── services/     # Business logic (Poll, Vote, Participants)
│   │   ├── socket/       # Real-time event orchestration
│   │   └── controllers/  # REST API handlers
```

## ✨ Recent Refinements

- **SPA Routing**: Added `vercel.json` to handle 404 errors on page refresh.
- **Smart Timer**: Moved the active poll timer from absolute positioning to an inline flex layout for better readability.
- **Floating Sidebar**: Integrated Chat and Participant management into a unified floating popover (FAB).
- **CORS Resolution**: Implemented robust origin whitelisting to support credentialed requests from Vercel.

## 📄 License

MIT
