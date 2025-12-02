# SkipSmart – Attendance Manager

SkipSmart is a full-stack web application designed to help college students manage their attendance strategically. It tracks attendance, calculates safe skips, and provides suggestions to maintain a target percentage (default 75%).

## Live Demo
- **Frontend**: [https://skip-smart-attendance.vercel.app/](https://skip-smart-attendance.vercel.app/)
- **Backend**: [https://skip-smart-attendance.onrender.com](https://skip-smart-attendance.onrender.com)

## Tech Stack
- **Frontend**: React, JavaScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, JavaScript, Prisma ORM
- **Database**: MySQL

## Prerequisites
- Node.js (v18+)
- Docker (for MySQL) OR a local MySQL installation

## Setup Instructions

### 1. Database Setup
Start the MySQL database using Docker:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
- Copy `.env.example` to `.env` (the defaults work with the provided docker-compose).

Push the database schema:
```bash
npx prisma db push
```

Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal and navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The client will run on `http://localhost:3000`.

## Features
1.  **Authentication**: Register and Login.
2.  **Dashboard**: View attendance stats, safe skips, and recovery plans.
3.  **Calendar**: Create semesters and add subjects with weekly schedules.
4.  **Smart Suggestions**:
    - **Green**: Safe to skip.
    - **Yellow**: Warning zone.
    - **Red**: Danger zone (must attend).

## Usage Guide
1.  **Register** a new account.
2.  Go to **Calendar** page.
3.  **Create a Semester** (e.g., "Spring 2024").
4.  **Add Subjects** to that semester. Define the schedule (e.g., Mon 10-11 AM).
    - *Note: This will automatically generate all class sessions for the semester.*
5.  Go to **Dashboard** to see your stats.
6.  Mark attendance (Attended/Skipped) via the Calendar or Dashboard (feature in progress).

## License
MIT
