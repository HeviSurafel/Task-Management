import React, { useEffect } from "react";
import "./navbar.css";
import { IoIosNotifications } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import useNotificationStore from "../../store/notification";
import useUserStore from "../../store/auth";
import {Link} from "react-router-dom"
function Navbar() {
  const { user } = useUserStore();
  const { notifications, fetchNotificationsByEmployee } = useNotificationStore();
  
  // Calculate unread notifications count
  const unreadCount = notifications?.filter(notification => !notification.read).length || 0;

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotificationsByEmployee(user.id);
    }
  }, [user?.id, fetchNotificationsByEmployee]);

  // Get the current date
  const currentDate = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = dayNames[currentDate.getDay()];
  const date = currentDate.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY

  return (
    <div className="nav-main-container">
      <div>
        <p className="nav-main-text">
          Dash<span>Board</span>
        </p>
      </div>
      <div className="nav-search-container">
        <input placeholder="Search your task here..." />
        <div className="task-read">
          <IoIosSearch className="read-icon" />
        </div>
      </div>
      <div className="nav-notification-container">
        {user.role==="admin"?
          <Link to="/admin/notification">
          <div className="task-read notification-icon-container">
            <IoIosNotifications className="read-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          </Link>:  <Link to="/Employee/notification">
        <div className="task-read notification-icon-container">
          <IoIosNotifications className="read-icon" />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        </Link>}
      
        
        <div>
          <p className="nav-day-text">{day}</p>
          <p className="nav-date-text">{date}</p>
        </div>
      </div>
    </div>
  );
}

export default Navbar;