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
   git clone <your-repo-url>
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

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/polling_db
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

## 📂 Project Structure

```text
intervue.io/
├── frontend/             # Single Page Application (React + TS)
│   ├── src/
│   │   ├── components/   # Reusable UI elements
│   │   ├── pages/        # Main route containers (Teacher/Student/Home)
│   │   └── hooks/        # Custom React hooks (Socket, Timer)
├── backend/              # API & Socket Server (Node.js)
│   ├── src/
│   │   ├── services/     # Core business logic
│   │   ├── socket/       # Socket.io handlers
│   │   ├── controllers/  # API route handlers
│   │   └── models/        # Database schemas
```

## 🌐 Deployment

For instructions on how to go live using **Render** and **Vercel**, please refer to the [Deployment Guide](./deployment_guide.md) (if available) or follow the standard practices for Node/React apps.
