import React, { useState, useEffect } from "react";
import "./taskandchat.css";
import useTaskStore from "../../store/task";
import useUserStore from "../../store/auth";
import useAdminStore from "../../store/admin.store";
import CommentSection from "./CommentSection"; // Import the new component

function TaskAndChat() {
  // State management hooks
  const { user } = useUserStore();
  const { getAdminAssignedTasks, updateTaskStatus, adminTasks } =
    useAdminStore();
  const { tasks, fetchTasks, fetchComments, addComment, comments } =
    useTaskStore();

  // Determine which tasks to use based on user role
  const isAdmin = user?.role === "Ceo";
  const currentTasks = isAdmin ? adminTasks?.data || [] : tasks;

  // State for selected task
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const task = currentTasks.find((t) => t._id === selectedTaskId);

  // Fetch tasks based on user role
  useEffect(() => {
    const fetchAppropriateTasks = async () => {
      try {
        if (isAdmin) {
          await getAdminAssignedTasks(user?.id);
        } else {
          await fetchTasks(user?.id);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchAppropriateTasks();
  }, [user?.role, user?.id, isAdmin, getAdminAssignedTasks, fetchTasks]);

  // Fetch comments when task changes
  useEffect(() => {
    if (selectedTaskId) {
      fetchComments(selectedTaskId);
    }
  }, [selectedTaskId, fetchComments]);

  // Update task status
  const handleUpdateTaskStatus = async (newStatus) => {
    try {
      await updateTaskStatus(selectedTaskId, newStatus);

      // Refresh tasks after status update
      if (isAdmin) {
        await getAdminAssignedTasks(user?.id);
      } else {
        await fetchTasks(user?.id);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get CSS class for task status
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "in-progress":
        return "status-in-progress";
      case "completed":
        return "status-completed";
      case "on hold":
        return "status-on-hold";
      default:
        return "";
    }
  };

  // Get assigned employee name
  const getAssignedName = () => {
    if (!task?.assignTo) return "Unassigned";
    if (task.assignTo.user) {
      return `${task.assignTo.user.firstName} ${task.assignTo.user.lastName}`;
    }
    return task.assignTo.employee_id || "Unassigned";
  };
  console.log("tasks", task);
  return (
    <div className="task-container">
      {/* Task Selection */}
      <div className="task-selection">
        <h3>Select a Task</h3>
        <ul>
          {currentTasks.map((task) => (
            <li
              key={task._id}
              onClick={() => setSelectedTaskId(task._id)}
              className={selectedTaskId === task._id ? "selected" : ""}
            >
              {task.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Task Details and Comments */}
      {task && (
        <>
          {/* Task Header */}
          <div className="task-header">
            <div className="task-title">{task.title}</div>
            <div className={`task-status ${getStatusClass(task.status)}`}>
              {task.status}
              {task?.project.files?.map((file) => {
                const fileUrl = `https://makallataskmanagement.lobborecords.com/uploads/${file.path
                  .split("\\")
                  .pop()}`;

                return (
                  <div key={file._id} className="file-item">
                    {file.mimeType.startsWith("image/") ? (
                      <>
                        <img
                          src={fileUrl}
                          alt={file.originalName}
                          className="file-image"
                        />
                        <a href={fileUrl} download className="download-link">
                          Download Image
                        </a>
                      </>
                    ) : file.mimeType === "application/pdf" ? (
                      <>
                        <embed
                          src={fileUrl}
                          type={file.mimeType}
                          className="file-embed"
                        />
                        <a href={fileUrl} download className="download-link">
                          Download PDF
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="file-link"
                        >
                          {file.originalName}
                        </a>
                        <a href={fileUrl} download className="download-link">
                          Download
                        </a>
                      </>
                    )}
                    <span>
                      ({file.mimeType}, {Math.round(file.size / 1024)} KB)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Details */}
          <div className="task-description">
            <p>
              <strong>Description:</strong>{" "}
              {task.description || "No description provided"}
            </p>
            <p>
              <strong>Assigned to:</strong> {getAssignedName()}
            </p>
            <p>
              <strong>Priority:</strong> {task.priority || "Not specified"}
            </p>
            {task.project?.clientName && (
              <p>
                <strong>Client Name:</strong> {task.project.clientName}
              </p>
            )}
            {task.startDate && (
              <p>
                <strong>Start Date:</strong> {formatDate(task.startDate)}
              </p>
            )}
            {task.dueDate && (
              <p>
                <strong>Due Date:</strong> {formatDate(task.dueDate)}
              </p>
            )}
          </div>

          {/* Task Actions (for admin or assigned user) */}
          {(isAdmin || user?._id === task.assignTo?._id) && (
            <div className="task-actions">
              <button
                className={`task-action-btn ${
                  task.status === "Pending"
                    ? "btn-primary-active"
                    : "btn-primary"
                }`}
                onClick={() => handleUpdateTaskStatus("Pending")}
                disabled={task.status === "Pending"}
              >
                Mark as Pending
              </button>
              <button
                className={`task-action-btn ${
                  task.status === "In Progress"
                    ? "btn-warning-active"
                    : "btn-warning"
                }`}
                onClick={() => handleUpdateTaskStatus("In Progress")}
                disabled={task.status === "In Progress"}
              >
                Mark as In Progress
              </button>
              <button
                className={`task-action-btn ${
                  task.status === "Completed"
                    ? "btn-success-active"
                    : "btn-success"
                }`}
                onClick={() => handleUpdateTaskStatus("Completed")}
                disabled={task.status === "Completed"}
              >
                Mark as Completed
              </button>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection
            comments={comments}
            user={user}
            selectedTaskId={selectedTaskId}
            addComment={addComment}
            formatDate={formatDate}
          />
        </>
      )}
    </div>
  );
}

export default TaskAndChat;
