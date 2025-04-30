import React, { useState, useEffect } from 'react';
import styles from './TaskNotifications.module.css';
import { 
  FaBell, FaCheck, FaTrashAlt, FaTasks, FaCommentAlt, 
  FaExclamationTriangle, FaChevronDown, FaFilter 
} from 'react-icons/fa';
import { BsBellFill } from 'react-icons/bs';
import useNotificationStore from "../../store/notification";
import useUserStore from "../../store/auth";

const TaskNotifications = () => {
  // State management hooks
  const {
    notifications,
    fetchNotificationsByEmployee,
    markNotificationAsRead,
    deleteNotification
  } = useNotificationStore();
  
  const { user } = useUserStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    if (user?.id) {
      fetchNotificationsByEmployee(user.id);
    }
  }, [user?.id,notifications, fetchNotificationsByEmployee]);
  console.log("notifications",notifications)
  // Filter and sort notifications
  const filteredNotifications = notifications
    ?.filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
    })
    .filter(notification => {
      if (priorityFilter === 'all') return true;
      return notification.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const unreadCount = notifications?.filter(n => !n.read).length;

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification._id);
      }
    });
  };

  const deleteAll = () => {
    notifications.forEach(notification => {
      if (notification.read) {
        deleteNotification(notification._id);
      }
    });
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  const getIconClass = (type) => {
    switch(type) {
      case 'task': return styles.notificationIconTask;
      case 'comment': return styles.notificationIconMessage;
      case 'alert': return styles.notificationIconAlert;
      default: return styles.notificationIconDefault;
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'task': return <FaTasks />;
      case 'comment': return <FaCommentAlt />;
      case 'alert': return <FaExclamationTriangle />;
      default: return <BsBellFill />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>
            <FaBell className={styles.headerIcon} />
            Task Notifications
          </h1>
          <p className={styles.headerSubtitle}>
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </p>
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={markAllAsRead}
            className={`${styles.button} ${styles.indigoButton}`}
            disabled={unreadCount === 0}
          >
            <FaCheck className={styles.buttonIcon} />
            Mark all as read
          </button>
          <button
            onClick={deleteAll}
            className={`${styles.button} ${styles.redButton}`}
            disabled={notifications?.length - unreadCount === 0}
          >
            <FaTrashAlt className={styles.buttonIcon} />
            Clear read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterPanel}>
        <div className={styles.filterControls}>
          <div className={styles.filterSection}>
            <FaFilter className={styles.filterLabel} />
            <span className={styles.filterLabel}>Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${filter === 'unread' ? styles.filterButtonActive : ''}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${filter === 'read' ? styles.filterButtonActive : ''}`}
            >
              Read
            </button>
          </div>

          <div className={styles.filterSection}>
            <span className={styles.filterLabel}>Priority:</span>
            <button
              onClick={() => setPriorityFilter('all')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${priorityFilter === 'all' ? styles.filterButtonActive : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${priorityFilter === 'high' ? styles.highPriorityButtonActive : ''}`}
            >
              High
            </button>
            <button
              onClick={() => setPriorityFilter('medium')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${priorityFilter === 'medium' ? styles.mediumPriorityButtonActive : ''}`}
            >
              Medium
            </button>
            <button
              onClick={() => setPriorityFilter('low')}
              className={`${styles.filterButton} ${styles.filterButtonBase} ${priorityFilter === 'low' ? styles.lowPriorityButtonActive : ''}`}
            >
              Low
            </button>
          </div>

          <div className={styles.filterSection} style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className={styles.sortButton}
            >
              <span className={styles.filterLabel}>Sort: {sortBy === 'date' ? 'Newest' : 'Priority'}</span>
              <FaChevronDown style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }} />
            </button>
            {showSortOptions && (
              <div className={styles.sortDropdown}>
                <button
                  onClick={() => {
                    setSortBy('date');
                    setShowSortOptions(false);
                  }}
                  className={styles.sortOption}
                >
                  Newest First
                </button>
                <button
                  onClick={() => {
                    setSortBy('priority');
                    setShowSortOptions(false);
                  }}
                  className={styles.sortOption}
                >
                  By Priority
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {filteredNotifications?.length === 0 ? (
          <div className={styles.emptyState}>
            <FaBell className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No notifications found</h3>
            <p className={styles.emptyText}>
              {filter === 'all' 
                ? "You don't have any notifications yet."
                : `You don't have any ${filter} notifications.`}
            </p>
          </div>
        ) : (
          <ul className={styles.divider}>
            {filteredNotifications?.map(notification => (
              <li 
                key={notification._id} 
                className={`${styles.notificationItem} ${!notification.read ? styles.notificationUnread : ''}`}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <div className={`${styles.notificationIconContainer} ${!notification.read ? styles.notificationIconContainerUnread : styles.notificationIconContainerRead}`}>
                      <span className={getIconClass(notification.type)}>
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    <div className={styles.notificationDetails}>
                      <div className={styles.notificationTitleRow}>
                        <h3 className={`${styles.notificationTitle} ${!notification.read ? styles.notificationTitleUnread : styles.notificationTitleRead}`}>
                          {notification.title}
                        </h3>
                        {notification.priority && (
                          <span className={`${styles.priorityBadge} ${getPriorityClass(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                      <p className={styles.notificationMessage}>{notification.description}</p>
                      
                      <div className={styles.notificationMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Date:</span>
                          <span className={styles.metaValue}>
                            {new Date(notification.date).toLocaleDateString()} at {new Date(notification.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Type:</span>
                          <span className={styles.metaValue}>{notification.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.notificationActions}>
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification._id)}
                          className={`${styles.actionButton} ${styles.indigoActionButton}`}
                          title="Mark as read"
                        >
                          <FaCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className={`${styles.actionButton} ${styles.redActionButton}`}
                        title="Delete"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stats Footer */}
      <div className={styles.statsFooter}>
        <div>
          Showing {filteredNotifications?.length} of {notifications?.length} notifications
        </div>
        <div>
          {unreadCount} unread • {notifications?.length - unreadCount} read
        </div>
      </div>
    </div>
  );
};

export default TaskNotifications;