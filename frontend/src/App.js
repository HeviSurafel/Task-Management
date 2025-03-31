import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './layouts/auth/Register';
import Login from './layouts/auth/Login';
import Dashboard from './layouts/dashboard/Dashboard';
import Employees from './layouts/employees/Employees';
import Projects from './layouts/projects/Projects';
import Tasks from './layouts/tasks/Tasks';
import ProtectedRoute from './ProtectedRoute';
import NotificationsPage from './layouts/Notification/Notification';
import Layout from './Layout';

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
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/tasks" element={<Tasks />} />
          <Route path="/admin/notification" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
