# 🐕 DevTracker - ระบบติดตามงานสำหรับทีมพัฒนา

ระบบจัดการโครงการและติดตามงาน (Project & Task Management System) สำหรับทีมพัฒนาซอฟต์แวร์ เพื่อการติดต่อและอัปเดตสถานะงานกับทีม Tester

## ✨ ฟีเจอร์หลัก

- ✅ **Task/Issue Tracking** - สร้างและติดตามงาน
- ✅ **User Assignment & Status Tracking** - มอบหมายงานและติดตามสถานะ
- ✅ **Kanban Board** - บอร์ดงานด้วย drag & drop
- ✅ **Timeline/Gantt Chart** - ดูกำหนดการของงาน
- ✅ **Sprint Planning** - วางแผน Sprint
- ✅ **Bug Reporting** - รายงานบัก
- ✅ **Notifications** - แจ้งเตือนแบบ Real-time (Socket.io)
- ✅ **Analytics & Reports** - วิเคราะห์ข้อมูลและรายงาน
- ✅ **Role-based Access** - ระบบบทบาท (Admin, Dev, Tester, Lead)
- ✅ **Notes/Comments** - หมายเหตุและความเห็น

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js** - API Server
- **MongoDB** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time Communication
- **Mongoose** - ODM

### Frontend
- **React 18** - UI Framework
- **React Router** - Navigation
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time Updates

## 📦 Project Structure

```
dev-task-tracker/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   └── Sprint.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── user.routes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── PrivateRoute.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── DashboardPage.js
│   │   │   ├── BoardPage.js
│   │   │   ├── TimelinePage.js
│   │   │   ├── ProjectsPage.js
│   │   │   ├── NotesPage.js
│   │   │   └── SettingsPage.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   └── taskStore.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone & Setup
```bash
cd dev-task-tracker

# Backend setup
cd backend
cp .env.example .env
npm install

# Frontend setup
cd ../frontend
cp .env.example .env
npm install
```

#### 2. Configure Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-task-tracker
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
```

#### 4. Run Development Servers

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

## 📖 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Projects
```
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks
```
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/comments
```

### Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
```

## 👥 User Roles

- **Admin** - ควบคุมทั้งระบบ
- **Lead** - หัวหน้าทีม, วางแผน Sprint
- **Dev** - นักพัฒนา, ทำงาน
- **Tester** - ผู้ทดสอบ, รายงานบัค

## 🎯 Next Steps

- [ ] เพิ่มการยืนยันตัวตนแบบ OAuth (Google, GitHub)
- [ ] เพิ่มการส่งอีเมลแจ้งเตือน
- [ ] Dashboard วิเคราะห์ข้อมูลขั้นสูง
- [ ] Mobile App (React Native)
- [ ] Integration กับเครื่องมืออื่น (Slack, GitHub)

## 📝 License

MIT License

## 🤝 Support

สำหรับคำถามหรือปัญหา โปรดติดต่อทีมพัฒนา

---

**Happy Tracking! 🚀**
