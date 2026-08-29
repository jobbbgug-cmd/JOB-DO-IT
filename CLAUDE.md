# DevTracker - Project Documentation

## Project Overview
- **Name**: DevTracker (🐕)
- **Type**: Web Application (MERN Stack)
- **Purpose**: Task and Project Management System for Development Teams
- **Date Created**: 2026-08-29

## Technology Stack

### Backend
- Node.js + Express.js
- MongoDB (ODM with Mongoose)
- JWT Authentication
- Socket.io for Real-time Updates
- bcryptjs for Password Hashing

### Frontend
- React 18
- React Router DOM v6
- Zustand for State Management
- Tailwind CSS for Styling
- Axios for HTTP Requests
- Socket.io-client

## Project Structure

```
backend/
  ├── src/
  │   ├── models/          # MongoDB schemas
  │   ├── routes/          # API endpoints
  │   └── server.js        # Express server entry point
  ├── package.json
  └── .env.example

frontend/
  ├── src/
  │   ├── components/      # React components
  │   ├── pages/           # Page components
  │   ├── store/           # Zustand stores
  │   ├── App.js
  │   └── index.js
  ├── public/
  ├── package.json
  └── .env.example
```

## Key Features Implemented

1. **Authentication System**
   - User registration & login
   - JWT-based authentication
   - Role-based access control (Admin, Dev, Tester, Lead)

2. **Task Management**
   - CRUD operations for tasks
   - Status tracking (todo, in-progress, in-review, done)
   - Priority levels (urgent, high, medium, low)
   - Task types (feature, bug, improvement, task)
   - Assignee management
   - Comments system

3. **Project Management**
   - Project creation & management
   - Team member assignment
   - Sprint management (planned, active, completed)
   - Status tracking (active, archived, planning)

4. **User Interface**
   - Kanban Board (drag & drop)
   - Timeline view (Gantt chart style)
   - Dashboard with statistics
   - Notes management
   - Projects overview
   - Settings page

5. **Real-time Features**
   - Socket.io integration for live updates
   - Comment notifications
   - Task status change broadcasts

## Running the Project

### Development Mode

1. **Start MongoDB**
   ```bash
   docker-compose up -d
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on http://localhost:5000
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   # Runs on http://localhost:3000
   ```

## Database Schema

### User
- name, email, password (hashed)
- role (enum: admin, dev, tester, lead)
- avatar, department
- timestamps

### Project
- name, description
- owner (ref: User)
- members (array with roles)
- status, startDate, endDate
- timestamps

### Task
- title, description
- project (ref: Project)
- assignee (ref: User)
- status, priority, type
- dueDate, estimatedHours, actualHours
- progress (0-100)
- tags, attachments
- comments
- sprint (ref: Sprint)
- timestamps

### Sprint
- name
- project (ref: Project)
- startDate, endDate
- status (planning, active, completed)
- goal
- tasks (array refs)
- timestamps

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get tasks (with filters)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/comments` - Add comment
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dev-task-tracker
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

1. **MongoDB Connection Error**
   - Ensure MongoDB is running via `docker-compose up -d`
   - Check MONGODB_URI in .env

2. **CORS Error**
   - Verify CORS_ORIGIN matches frontend URL
   - Check backend server is running on correct port

3. **Socket.io Connection Issues**
   - Ensure Socket.io is properly configured in server.js
   - Check frontend Socket.io client initialization

## Next Steps / TODOs

- [ ] Add email notifications
- [ ] Implement OAuth (Google, GitHub)
- [ ] Add file upload functionality
- [ ] Create advanced analytics dashboard
- [ ] Add team collaboration features
- [ ] Implement activity logs
- [ ] Add test suite (Jest)
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Caching strategy (Redis)

## Performance Considerations

- Index database queries
- Implement pagination for task lists
- Use Socket.io namespaces for scalability
- Consider implementing caching for frequently accessed data
- Optimize image sizes
- Implement lazy loading for frontend

## Security Considerations

- Hash passwords with bcryptjs
- Use JWT with expiration
- Validate all inputs
- Sanitize HTML in comments
- HTTPS in production
- Rate limiting on API endpoints
- CORS properly configured
- Environment variables for secrets
