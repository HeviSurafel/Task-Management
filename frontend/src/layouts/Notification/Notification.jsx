import { useState } from 'react';
import { 
  FaBell, FaCheck, FaTrashAlt, FaTasks, FaCommentAlt, 
  FaExclamationTriangle, FaChevronDown, FaFilter 
} from 'react-icons/fa';
import { BsThreeDotsVertical, BsBellFill } from 'react-icons/bs';
import styles from './TaskNotifications.module.css';

const TaskNotifications = () => {
  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Project Deadline Approaching',
      message: 'The "Website Redesign" project is due in 2 days',
      type: 'task',
      priority: 'high',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      project: 'Website Redesign',
      assignedBy: 'Sarah Johnson'
    },
    {
      id: '2',
      title: 'New Task Assigned',
      message: 'You\'ve been assigned to "Create user dashboard"',
      type: 'task',
      priority: 'medium',
      date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: false,
      project: 'Admin Portal',
      assignedBy: 'Michael Chen'
    },
    {
      id: '3',
      title: 'Task Completed',
      message: 'You completed "Fix login page bugs"',
      type: 'task',
      priority: 'low',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      project: 'Customer Portal',
      assignedBy: 'System'
    },
    {
      id: '4',
      title: 'Team Message',
      message: 'Daily standup meeting starts in 15 minutes',
      type: 'message',
      priority: 'medium',
      date: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
      read: true,
      project: 'General',
      assignedBy: 'Emma Wilson'
    },
    {
      id: '5',
      title: 'Urgent: Server Issue',
      message: 'Production server experiencing high CPU usage',
      type: 'alert',
      priority: 'high',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      project: 'Infrastructure',
      assignedBy: 'System'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
    })
    .filter(notification => {
      if (priorityFilter === 'all') return true;
      return notification.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return b.date - a.date;
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const deleteAll = () => {
    setNotifications(notifications.filter(n => n.read));
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
      case 'message': return styles.notificationIconMessage;
      case 'alert': return styles.notificationIconAlert;
      default: return styles.notificationIconDefault;
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
          >
            <FaCheck className={styles.buttonIcon} />
            Mark all as read
          </button>
          <button
            onClick={deleteAll}
            className={`${styles.button} ${styles.redButton}`}
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
        {filteredNotifications.length === 0 ? (
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
            {filteredNotifications.map(notification => (
              <li 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.read ? styles.notificationUnread : ''}`}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <div className={`${styles.notificationIconContainer} ${!notification.read ? styles.notificationIconContainerUnread : styles.notificationIconContainerRead}`}>
                      <span className={getIconClass(notification.type)}>
                        {notification.type === 'task' && <FaTasks />}
                        {notification.type === 'message' && <FaCommentAlt />}
                        {notification.type === 'alert' && <FaExclamationTriangle />}
                        {!['task', 'message', 'alert'].includes(notification.type) && <BsBellFill />}
                      </span>
                    </div>
                    <div className={styles.notificationDetails}>
                      <div className={styles.notificationTitleRow}>
                        <h3 className={`${styles.notificationTitle} ${!notification.read ? styles.notificationTitleUnread : styles.notificationTitleRead}`}>
                          {notification.title}
                        </h3>
                        <span className={`${styles.priorityBadge} ${getPriorityClass(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      
                      <div className={styles.notificationMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Project:</span>
                          <span className={styles.metaLink}>{notification.project}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>From:</span>
                          <span className={styles.metaValue}>{notification.assignedBy}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Date:</span>
                          <span className={styles.metaValue}>
                            {notification.date.toLocaleDateString()} at {notification.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.notificationActions}>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className={`${styles.actionButton} ${styles.indigoActionButton}`}
                          title="Mark as read"
                        >
                          <FaCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
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
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
        <div>
          {unreadCount} unread • {notifications.length - unreadCount} read
        </div>
      </div>
    </div>
  );
};

export default TaskNotifications;