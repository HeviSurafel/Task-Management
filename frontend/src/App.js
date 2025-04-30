import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './layouts/auth/Register.jsx';
import Login from './layouts/auth/Login.jsx';
import Dashboard from './layouts/dashboard/Dashboard.jsx';
import Employees from './layouts/employees/Employees.jsx';
import Projects from './layouts/projects/Projects.jsx';
import Tasks from './layouts/tasks/Tasks.jsx';
import ProtectedRoute from './ProtectedRoute.js';
import NotificationsPage from './layouts/Notification/Notification.jsx';
import Layout from './Layout.jsx';
import TaskAndChat from './layouts/Taskandchat/Taskandchat.jsx';
import EmployeeOverview from "./EmployeeDashbard/EmployeeOverview.jsx"
import EmployeeHistory from './layouts/employee History/EmployeeHistroy.jsx';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/taskandchat" element={<TaskAndChat />} />
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/tasks" element={<Tasks />} />
          <Route path="/admin/notification" element={<NotificationsPage />}/>
          <Route path="/Employee/taskHistory" element={<EmployeeHistory />}/>
          <Route path="/Employee/notification" element={<NotificationsPage />}/>
          <Route path="/employee/taskandchat" element={<TaskAndChat />}/>
          <Route path="/employee/overview" element={<EmployeeOverview />}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
