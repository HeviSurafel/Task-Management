import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  CircularProgressLabel,
  Box,
  Flex,
  Text,
  Tag,
} from "@chakra-ui/react";
import "./projects.css";
import totaltasks from "../../assets/tasks/totaltasks.png";
import totalprogress from "../../assets/tasks/totalprogress.png";
import totalpending from "../../assets/tasks/totalpending.png";
import totalcomplete from "../../assets/tasks/totalcomplete.png";
import { IoMdAdd } from "react-icons/io";
import useAdminStore from "../../store/admin.store";
import AddProjectModal from "./modals/AddProject";
import ReadProjectModal from "./modals/ReadProject";

function Projects() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isReadProjectModalOpen, setIsReadProjectModalOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [filteredStatus, setFilteredStatus] = useState(null);

  const { projectsDashboard, projectDashboard } = useAdminStore();
  const projects = projectsDashboard?.data?.data?.project || [];
  const stats = projectsDashboard?.data?.data || {
    totalProjects: 0,
    completedProjects: 0,
    InProgressProject: 0,
    TestingProjects: 0,
    OnHoldProjects: 0,
  };

  useEffect(() => {
    projectDashboard();
  }, []);

  const totalProjects = stats.totalProjects || 1;
  const completedPercentage = (stats.completedProjects / totalProjects) * 100;
  const inProgressPercentage = (stats.InProgressProject / totalProjects) * 100;
  const testingPercentage = (stats.TestingProjects / totalProjects) * 100;
  const onHoldPercentage = (stats.OnHoldProjects / totalProjects) * 100;

  const statusGroups = {
    "In Progress": stats.InProgressProject,
    Testing: stats.TestingProjects,
    Completed: stats.completedProjects,
    "On Hold": stats.OnHoldProjects,
  };

  const getProjectsByStatus = (status) =>
    projectsDashboard?.data.project.filter(
      (project) => project.status === status
    );

  const openAddProjectModal = () => setIsAddProjectModalOpen(true);
  const openReadProjectModal = () => setIsReadProjectModalOpen(true);
  const closeAddProjectModal = () => setIsAddProjectModalOpen(false);
  const closeReadProjectModal = () => setIsReadProjectModalOpen(false);

  const handleShowAllProjects = () => {
    setFilteredStatus(null);
    setShowAllProjects(true);
  };

  const handleBackToDashboard = () => {
    setFilteredStatus(null);
    setShowAllProjects(false);
  };

  const handleStatusFilter = (status) => {
    setFilteredStatus(status);
    setShowAllProjects(true);
  };
  console.log("project dashboard", projectsDashboard);
  const FilteredProjectsView = () => {
    const filteredProjects = filteredStatus
      ? projectsDashboard?.data.project.filter(
          (project) => project.status === filteredStatus
        )
      : projectsDashboard?.data.project;
    return (
      <div className="all-projects-container">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Dashboard
        </button>

        <h2>
          {filteredStatus ? `${filteredStatus} Projects` : "All Projects"}(
          {filteredProjects?.length})
        </h2>

        <div className="projects-grid">
          {filteredProjects?.map((project) => (
            <div key={project._id} className="project-card-expanded">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-meta">
                <span>Client: {project.clientName}</span>
                <span
                  className={`status-badge ${project.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {project.status}
                </span>
              </div>
              <div className="project-footer">
                <span>
                  Started: {new Date(project.startDate).toLocaleDateString()}
                </span>
                <span
                  className={`priority-${project.priority
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {project.priority}
                </span>
              </div>
              <div className="project-files">
                <h4>Files:</h4>
                {project.files.map((file) => {
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
          ))}
        </div>
      </div>
    );
  };

  const DashboardView = () => (
    <>
      <Flex justify="space-between" align="center" mb="6">
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Projects Overview
        </Text>
        <button className="add-project-btn" onClick={openAddProjectModal}>
          <IoMdAdd /> Add New Project
        </button>
      </Flex>

      <div className="stats-grid">
        <div
          className="stats-card"
          onClick={handleShowAllProjects}
          style={{ cursor: "pointer" }}
        >
          <div className="stats-card-inner">
            <div className="stats-icon-container">
              <img src={totaltasks} alt="Total Projects" />
            </div>
            <div className="stats-content">
              <p className="stats-num-label">{stats.totalProjects}</p>
              <p className="stats-text-label">Total Projects</p>
            </div>
          </div>
        </div>

        <div
          className="stats-card"
          onClick={() => handleStatusFilter("Completed")}
          style={{ cursor: "pointer" }}
        >
          <div className="stats-card-inner">
            <div className="stats-icon-container">
              <img src={totalcomplete} alt="Completed" />
            </div>
            <div className="stats-content">
              <p className="stats-num-label">{stats.completedProjects}</p>
              <p className="stats-text-label">Completed</p>
            </div>
          </div>
        </div>

        <div
          className="stats-card"
          onClick={() => handleStatusFilter("In Progress")}
          style={{ cursor: "pointer" }}
        >
          <div className="stats-card-inner">
            <div className="stats-icon-container">
              <img src={totalprogress} alt="In Progress" />
            </div>
            <div className="stats-content">
              <p className="stats-num-label">{stats.InProgressProject}</p>
              <p className="stats-text-label">In Progress</p>
            </div>
          </div>
        </div>

        <div
          className="stats-card"
          onClick={() => handleStatusFilter("On Hold")}
          style={{ cursor: "pointer" }}
        >
          <div className="stats-card-inner">
            <div className="stats-icon-container">
              <img src={totalpending} alt="On Hold" />
            </div>
            <div className="stats-content">
              <p className="stats-num-label">{stats.OnHoldProjects}</p>
              <p className="stats-text-label">On Hold</p>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-status-section">
        <h3 className="section-title">Project Status Distribution</h3>
        <div className="progress-circles">
          <div
            className="progress-item"
            onClick={() => handleStatusFilter("Completed")}
            style={{ cursor: "pointer" }}
          >
            <CircularProgress
              value={completedPercentage}
              color="#05A301"
              size="120px"
              thickness="12px"
            >
              <CircularProgressLabel>
                {Math.round(completedPercentage)}%
              </CircularProgressLabel>
            </CircularProgress>
            <p className="status-label completed">Completed</p>
          </div>
          <div
            className="progress-item"
            onClick={() => handleStatusFilter("In Progress")}
            style={{ cursor: "pointer" }}
          >
            <CircularProgress
              value={inProgressPercentage}
              color="#0225FF"
              size="120px"
              thickness="12px"
            >
              <CircularProgressLabel>
                {Math.round(inProgressPercentage)}%
              </CircularProgressLabel>
            </CircularProgress>
            <p className="status-label in-progress">In Progress</p>
          </div>
          <div
            className="progress-item"
            onClick={() => handleStatusFilter("Testing")}
            style={{ cursor: "pointer" }}
          >
            <CircularProgress
              value={testingPercentage}
              color="orange"
              size="120px"
              thickness="12px"
            >
              <CircularProgressLabel>
                {Math.round(testingPercentage)}%
              </CircularProgressLabel>
            </CircularProgress>
            <p className="status-label testing">Testing</p>
          </div>
          <div
            className="progress-item"
            onClick={() => handleStatusFilter("On Hold")}
            style={{ cursor: "pointer" }}
          >
            <CircularProgress
              value={onHoldPercentage}
              color="#F21E1E"
              size="120px"
              thickness="12px"
            >
              <CircularProgressLabel>
                {Math.round(onHoldPercentage)}%
              </CircularProgressLabel>
            </CircularProgress>
            <p className="status-label on-hold">On Hold</p>
          </div>
        </div>
      </div>

      <div className="projects-by-status">
        {Object.entries(statusGroups).map(
          ([status, count]) =>
            count > 0 && (
              <div key={status} className="status-column">
                <h3 className="status-title">
                  <span
                    className={`status-dot ${status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  ></span>
                  {status} ({count})
                </h3>
                {getProjectsByStatus(status).map((project) => (
                  <div key={project._id} className="project-card">
                    <h4 className="project-title">{project.title}</h4>
                    <p className="project-desc">{project.description}</p>
                    <div className="project-footer">
                      <Tag
                        colorScheme={
                          status === "Completed"
                            ? "green"
                            : status === "In Progress"
                            ? "blue"
                            : status === "Testing"
                            ? "orange"
                            : "red"
                        }
                      >
                        {project.clientName}
                      </Tag>
                      {status !== "Completed" && (
                        <CircularProgress
                          value={project.progress || 0}
                          color={
                            status === "In Progress"
                              ? "#0225FF"
                              : status === "Testing"
                              ? "orange"
                              : "#F21E1E"
                          }
                          size="60px"
                        >
                          <CircularProgressLabel>
                            {Math.round(project.progress || 0)}%
                          </CircularProgressLabel>
                        </CircularProgress>
                      )}
                      {status === "Completed" && (
                        <Text fontSize="sm" color="gray.500">
                          Completed on:{" "}
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
        )}
      </div>
    </>
  );

  return (
    <>
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={closeAddProjectModal}
      />
      <ReadProjectModal
        isOpen={isReadProjectModalOpen}
        onClose={closeReadProjectModal}
      />

      <div className="app-main-container">
        <div className="app-main-right-container">
          <div className="projects-dashboard-container">
            {showAllProjects ? <FilteredProjectsView /> : <DashboardView />}
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
