# Split It Out 💸

**Split It Out** is a modern, responsive web application designed to simplify shared expense tracking. Whether you're on a trip with friends or splitting bills with roommates, this app helps you track who paid what and calculates exactly who owes whom.

> **Key Feature:** Includes a robust **Guest Mode** that allows users to try the app instantly without creating an account (data saved locally).

---

## 🚀 Features

* **User Authentication**: Secure Login and Registration system using JWT.
* **Guest Mode**: Fully functional "Try as Guest" feature using LocalStorage.
* **Group Management**: Create multiple groups with custom currencies (₹, $, €).
* **Expense Tracking**: Add expenses, specify the payer, and view detailed logs.
* **Smart Settlements**: Automatically calculates the minimum number of transactions required to settle debts.
* **Interactive UI**:
* Dark Mode support.
* Custom Toast Notifications (no browser alerts).
* Custom Confirmation Modals.
* Responsive design for mobile and desktop.



---

## 🛠️ Tech Stack

### Frontend

* **Framework**: React.js (Vite)
* **Styling**: Tailwind CSS
* **Routing**: React Router DOM
* **State Management**: Context API
* **HTTP Client**: Axios
* **Icons**: Lucide React

### Backend

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose)
* **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js
* **Security**: CORS, Environment Variables

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas URL)

---

## 📥 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/split-it-out.git
cd split-it-out

```

### 2. Backend Setup

Navigate to the backend folder, install dependencies, and configure the environment.

```bash
cd backend
npm install

```

**Create a `.env` file** in the `backend/` directory with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/split-it-out
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=http://localhost:5173

```

**Start the Backend Server:**

```bash
npm run dev

```

> The server should start on `http://localhost:5000` and connect to MongoDB.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies.

```bash
cd ../frontend
npm install

```

**Start the Frontend Development Server:**

```bash
npm run dev

```

> The app will run at `http://localhost:5173`.

---

## 📂 Project Structure

```
split-it-out/
├── backend/                # Node.js/Express Server
│   ├── src/
│   │   ├── controllers/    # Request logic
│   │   ├── models/         # Mongoose Schemas (User, Group, Expense)
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Business logic (Settlement algorithm)
│   │   └── app.js          # App entry point
│   ├── .env                # Environment variables
│   └── package.json
│
└── frontend/               # React Application
    ├── src/
    │   ├── context/        # Context Providers (Guest, Toast, Confirm)
    │   ├── pages/          # Views (Login, Dashboard, GroupDetail)
    │   ├── services/       # API integration
    │   └── App.jsx
    └── package.json

```

---

## 💡 Usage Guide

1. **Register/Login**: Create an account to save data to the database, or click **"Try as Guest"** to use the app immediately (data stored in your browser).
2. **Create a Group**: Go to the Dashboard and click **"New Group"**. Enter a name, select currency, and add members.
3. **Add Expenses**: Click into a group, select the **"Expenses"** tab, and add a bill. You must select exactly who paid.
4. **View Settlements**: Switch to the **"Settlements"** tab to see a simplified breakdown of who owes whom to settle the total balance.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---
