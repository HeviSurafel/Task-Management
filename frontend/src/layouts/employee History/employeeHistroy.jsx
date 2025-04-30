import React, { useEffect, useState, useRef } from 'react';
import './employeeHistory.css';
import useTaskStore from "../../store/task";
import useUserStore from "../../store/auth";
import { FiUser, FiCalendar, FiFlag, FiCheckCircle, FiFile, FiChevronLeft, FiChevronRight, FiSearch, FiDownload } from 'react-icons/fi';
import { format, getYear, parseISO } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as XLSX from 'xlsx';

function EmployeeHistory() {
  const { user } = useUserStore();
  const { tasks, fetchTasks, loading, error } = useTaskStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchYear, setSearchYear] = useState('');
  const tasksPerPage = 5;
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchTasks(user?.id);
  }, [fetchTasks, user?.id]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter tasks by selected year and completed status
  const filteredTasks = tasks.filter(task => {
    const taskYear = getYear(parseISO(task.startDate));
    return taskYear === selectedYear && task.status === 'Completed';
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Most Important': return 'priority-high';
      case 'Important': return 'priority-medium';
      case 'Least Important': return 'priority-low';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-in-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredTasks.length / tasksPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleYearChange = (date) => {
    setSelectedYear(getYear(date));
    setShowCalendar(false);
    setCurrentPage(1);
  };

  const handleSearchYear = (e) => {
    e.preventDefault();
    if (searchYear && !isNaN(searchYear)) {
      setSelectedYear(parseInt(searchYear));
      setCurrentPage(1);
      setSearchYear('');
    }
  };

  const downloadExcel = () => {
    if (filteredTasks.length === 0) {
      alert('No completed tasks to download for the selected year');
      return;
    }

    // Prepare data for Excel
    const excelData = filteredTasks.map(task => ({
      'Task Title': task.title,
      'Description': task.description || 'No description',
      'Assigned To': `${task.assignTo?.user?.firstName} ${task.assignTo?.user?.lastName}`,
      'Start Date': format(new Date(task.startDate), 'MMM d, yyyy'),
      'Due Date': format(new Date(task.dueDate), 'MMM d, yyyy'),
      'Completed Date': format(new Date(task.updatedAt), 'MMM d, yyyy'),
      'Priority': task.priority,
      'Project': task.project?.title || 'No project',
      'Client': task.project?.clientName || 'No client',
      'Status': task.status
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed Tasks');
    
    // Generate file and download
    XLSX.writeFile(workbook, `Completed_Tasks_${selectedYear}.xlsx`);
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  // Get unique years from tasks for the year selector
  const uniqueYears = [...new Set(tasks.map(task => getYear(parseISO(task.startDate))))].sort((a, b) => b - a);

  const renderPagination = () => {
    if (filteredTasks.length <= tasksPerPage) return null;
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    pageNumbers.push(1);
    
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }
    
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 3, 2);
    }
    
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return (
      <div className="pagination-container">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-arrow"
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>
        
        <div className="pagination-numbers">
          {pageNumbers.map((number, index) => (
            number === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                aria-current={currentPage === number ? 'page' : undefined}
              >
                {number}
              </button>
            )
          ))}
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination-arrow"
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error loading task history: {error}</p>
        <button 
          className="retry-button"
          onClick={() => fetchTasks(user?.id)}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employee-history">
      <header className="history-header">
        <h1>My Task History</h1>
        <p className="history-subtitle">View your completed tasks by year</p>
      </header>

      <div className="controls-container">
        <div className="year-controls">
          <div className="year-selector" ref={calendarRef}>
            <button 
              className="year-button"
              onClick={() => setShowCalendar(!showCalendar)}
              aria-expanded={showCalendar}
              aria-label="Select year"
            >
              {selectedYear} <FiCalendar className="year-icon" />
            </button>
            
            {showCalendar && (
              <div className="calendar-popup">
                <Calendar
                  onChange={handleYearChange}
                  value={new Date(selectedYear, 0, 1)}
                  view="year"
                  onClickYear={handleYearChange}
                  maxDetail="year"
                  minDetail="year"
                />
              </div>
            )}
          </div>

          <form onSubmit={handleSearchYear} className="year-search">
            <input
              type="number"
              placeholder="Enter year (e.g., 2023)"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              min="2000"
              max="2100"
              className="year-search-input"
              aria-label="Search by year"
            />
            <button type="submit" className="year-search-button" aria-label="Search">
              <FiSearch />
            </button>
          </form>

          <div className="year-quick-select">
            {uniqueYears.slice(0, 5).map(year => (
              <button
                key={year}
                className={`year-quick-button ${selectedYear === year ? 'active' : ''}`}
                onClick={() => {
                  setSelectedYear(year);
                  setCurrentPage(1);
                }}
                aria-label={`View ${year} tasks`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={downloadExcel}
          className="download-excel-button"
          disabled={filteredTasks.length === 0}
          aria-label="Export to Excel"
        >
          <FiDownload className="download-icon" />
          Export
        </button>
      </div>

      <main className="history-content">
        {currentTasks.length > 0 ? (
          <>
            <div className="stats-bar">
              <span className="stat-item">
                <strong>{filteredTasks.length}</strong> completed tasks in {selectedYear}
              </span>
              <span className="stat-item">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
            </div>

            <div className="task-cards">
              {currentTasks.map((task) => (
                <article key={task._id} className="task-card">
                  <div className="card-header">
                    <h2 className="task-title">{task.title}</h2>
                    <span className={`task-status ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className="task-description">
                      {task.description}
                    </p>
                  )}

                  <div className="task-meta">
                    <div className="meta-item">
                      <FiUser className="meta-icon" />
                      <span className="meta-label">Assigned To:</span>
                      <span>{task.assignTo?.user?.firstName} {task.assignTo?.user?.lastName || 'Unassigned'}</span>
                    </div>

                    <div className="meta-item">
                      <FiCalendar className="meta-icon" />
                      <span className="meta-label">Dates:</span>
                      <span>
                        {format(new Date(task.startDate), 'MMM d, yyyy')} - {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="meta-item">
                      <FiFlag className="meta-icon" />
                      <span className="meta-label">Priority:</span>
                      <span className={`priority-tag ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <div className="meta-item">
                      <FiCheckCircle className="meta-icon" />
                      <span className="meta-label">Completed:</span>
                      <span>{format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                    </div>

                    {task.project?.title && (
                      <div className="meta-item">
                        <FiFile className="meta-icon" />
                        <span className="meta-label">Project:</span>
                        <span>{task.project.title}</span>
                      </div>
                    )}

                    {task.project?.clientName && (
                      <div className="meta-item">
                        <FiUser className="meta-icon" />
                        <span className="meta-label">Client:</span>
                        <span>{task.project.clientName}</span>
                      </div>
                    )}
                  </div>

                  {task.files?.length > 0 && (
                    <div className="task-attachments">
                      <h3 className="attachments-title">
                        <FiFile className="title-icon" />
                        Attachments ({task.files.length})
                      </h3>
                      <div className="attachments-grid">
                        {task.files.map((file) => (
                          <div key={file._id} className="attachment-item">
                            {file.mimeType.startsWith('image/') ? (
                              <img 
                                src={file.path} 
                                alt={file.originalName} 
                                className="attachment-image"
                                loading="lazy"
                              />
                            ) : (
                              <a 
                                href={file.path} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="attachment-link"
                              >
                                <FiFile className="file-icon" />
                                <span className="file-name">{file.originalName}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <FiFile className="empty-icon" />
            <h3>No completed tasks found for {selectedYear}</h3>
            <p>You don't have any completed tasks in your history for this year</p>
          </div>
        )}
        {renderPagination()}
      </main>
    </div>
  );
}

export default EmployeeHistory;