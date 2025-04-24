import React, { useEffect } from "react";
import "./employeeOverview.css";
import useTaskStore from "../store/task";
import useUserStore from "../store/auth";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FiUser, FiClock, FiCheckCircle, FiActivity, FiAlertCircle, FiCalendar } from "react-icons/fi";

// Date formatting utilities
const formatFullDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const EmployeeOverview = () => {
  const { dashboardData, fetchDashboardData, loading, error } = useTaskStore();
  const { user } = useUserStore();

  useEffect(() => {
    fetchDashboardData(user.id);
  }, [fetchDashboardData, user.id]);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p className="error-message">Error: {error}</p>
      <button onClick={() => fetchDashboardData(user.id)}>Retry</button>
    </div>
  );

  const { 
    employeeInfo, 
    tasks = { 
      total: 0, 
      completed: 0, 
      inProgress: 0, 
      recentTasks: [], 
      completionRate: 0 
    }, 
    activities = { 
      recent: [], 
      totalToday: 0 
    } 
  } = dashboardData || {};
console.log("am from employee overview",dashboardData)
  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {employeeInfo?.name || 'Employee'}</h1>
        </div>
        <p className="last-updated">
          <FiClock className="icon" /> Last updated: {formatFullDateTime(dashboardData?.employeeInfo.createdAt)}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Employee Info Card */}
        <div className="dashboard-card employee-info">
          <div className="card-header">
            <FiUser className="card-icon" />
            <h2>Employee Information</h2>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Employee ID</span>
              <span className="info-value">{employeeInfo?.employeeId || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Department</span>
              <span className="info-value">{dashboardData?.employeeInfo.department || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Position</span>
              <span className="info-value">{dashboardData?.employeeInfo.userId.role

 || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Join Date</span>
              <span className="info-value">{formatShortDate(dashboardData?.employeeInfo.createdAt) || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Task Stats Card */}
        <div className="dashboard-card task-stats">
          <div className="card-header">
            <FiCheckCircle className="card-icon" />
            <h2>Task Statistics</h2>
          </div>
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">{tasks.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{tasks.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{tasks.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="completion-rate">
              <CircularProgressbar
                value={tasks.completionRate}
                text={`${tasks.completionRate}%`}
                styles={buildStyles({
                  pathColor: tasks.completionRate > 70 ? '#4CAF50' : tasks.completionRate > 30 ? '#FFC107' : '#F44336',
                  textColor: '#333',
                  trailColor: '#e0e0e0',
                  textSize: '24px'
                })}
              />
              <div className="completion-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Activity Stats Card */}
        <div className="dashboard-card activity-stats">
          <div className="card-header">
            <FiActivity className="card-icon" />
            <h2>Today's Activity</h2>
          </div>
          <div className="activity-count">
            <div className="count-number">{activities.totalToday}</div>
            <div className="count-label">Activities Recorded</div>
          </div>
        </div>

        {/* Recent Tasks Card */}
        <div className="dashboard-card recent-tasks">
          <div className="card-header">
            <FiAlertCircle className="card-icon" />
            <h2>Recent Tasks</h2>
          </div>
          {tasks.recentTasks?.length > 0 ? (
            <ul className="task-list">
              {tasks.recentTasks.map(task => (
                <li key={task._id} className="task-item">
                  <div className="task-main">
                    <div className="task-title">{task.title}</div>
                    <div className={`task-status ${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </div>
                  </div>
                  <div className="task-details">
                    <div className="task-due">
                      <FiCalendar className="icon" />
                      {formatShortDate(task.dueDate)}
                    </div>
                    <div className={`task-priority ${task.priority.toLowerCase()}`}>
                      {task.priority} Priority
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No recent tasks found</p>
            </div>
          )}
        </div>

        {/* Recent Activities Card */}
        <div className="dashboard-card recent-activities">
          <div className="card-header">
            <FiActivity className="card-icon" />
            <h2>Recent Activities</h2>
          </div>
          {activities.recent?.length > 0 ? (
            <ul className="activity-list">
              {activities.recent.map(activity => (
                <li key={activity._id} className="activity-item">
                  <div className="activity-action">
                    <div className="activity-icon">
                      <FiActivity />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.action}</div>
                      <div className="activity-time">
                        <FiClock className="icon" />
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No recent activities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeOverview;