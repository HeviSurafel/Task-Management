import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import {
  CircularProgress,
  CircularProgressLabel,
  Box,
  Flex,
  Text,
} from "@chakra-ui/react";
import "./projects.css";
import totaltasks from "../../assets/tasks/totaltasks.png";
import totalprogress from "../../assets/tasks/totalprogress.png";
import totalpending from "../../assets/tasks/totalpending.png";
import totalcomplete from "../../assets/tasks/totalcomplete.png";
import { FcStatistics } from "react-icons/fc";
import Navbar from "../../components/navbar/Navbar";
import { Tag } from "@chakra-ui/react";
import AddProjectModal from "./modals/AddProject";
import ReadProjectModal from "./modals/ReadProject";
import { IoMdAdd } from "react-icons/io";
import useAdminStore from "../../store/admin.store";

function Projects() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isReadProjectModalOpen, setIsReadProjectModalOpen] = useState(false);

  const openAddProjectModal = () => setIsAddProjectModalOpen(true);
  const openReadProjectModal = () => setIsReadProjectModalOpen(true);
  const closeAddProjectModal = () => setIsAddProjectModalOpen(false);
  const closeReadProjectModal = () => setIsReadProjectModalOpen(false);

  const { projectsDashboard, projectDashboard } = useAdminStore();

  useEffect(() => {
    projectDashboard();
  }, []);

  // Extract project data from the response
  const projects = projectsDashboard?.data?.data?.project || [];
  const stats = projectsDashboard?.data?.data || {
    totalProjects: 0,
    completedProjects: 0,
    InProgressProject: 0,
    TestingProjects: 0,
    OnHoldProjects: 0
  };

  // Calculate percentages
  const totalProjects = stats.totalProjects || 1;
  const completedPercentage = (stats.completedProjects / totalProjects) * 100;
  const inProgressPercentage = (stats.InProgressProject / totalProjects) * 100;
  const testingPercentage = (stats.TestingProjects / totalProjects) * 100;
  const onHoldPercentage = (stats.OnHoldProjects / totalProjects) * 100;

  // Project status mapping
  const statusGroups = {
    "In Progress": stats.InProgressProject,
    "Testing": stats.TestingProjects,
    "Completed": stats.completedProjects,
    "On Hold": stats.OnHoldProjects
  };

  // Get projects by status
  const getProjectsByStatus = (status) => 
    projects.filter(project => project.status === status);

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
            <Flex justify="space-between" align="center" mb="6">
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                Projects Overview
              </Text>
              <button className="add-project-btn" onClick={openAddProjectModal}>
                <IoMdAdd /> Add New Project
              </button>
            </Flex>

            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stats-card">
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
              
              <div className="stats-card">
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

              <div className="stats-card">
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

              <div className="stats-card">
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

            {/* Progress Status Section */}
            <div className="progress-status-section">
              <h3 className="section-title">Project Status Distribution</h3>
              <div className="progress-circles">
                <div className="progress-item">
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
                <div className="progress-item">
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
                <div className="progress-item">
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
                <div className="progress-item">
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

            {/* Projects by Status */}
            <div className="projects-by-status">
              {Object.entries(statusGroups).map(([status, count]) => (
                count > 0 && (
                  <div key={status} className="status-column">
                    <h3 className="status-title">
                      <span className={`status-dot ${status.toLowerCase().replace(' ', '-')}`}></span>
                      {status} ({count})
                    </h3>
                    {getProjectsByStatus(status).map(project => (
                      <div key={project._id} className="project-card">
                        <h4 className="project-title">{project.title}</h4>
                        <p className="project-desc">{project.description}</p>
                        <div className="project-footer">
                          <Tag colorScheme={
                            status === 'Completed' ? 'green' :
                            status === 'In Progress' ? 'blue' :
                            status === 'Testing' ? 'orange' : 'red'
                          }>
                            {project.clientName}
                          </Tag>
                          {status !== 'Completed' && (
                            <CircularProgress 
                              value={project.progress || 0} 
                              color={
                                status === 'In Progress' ? '#0225FF' :
                                status === 'Testing' ? 'orange' : '#F21E1E'
                              } 
                              size="60px"
                            >
                              <CircularProgressLabel>
                                {Math.round(project.progress || 0)}%
                              </CircularProgressLabel>
                            </CircularProgress>
                          )}
                          {status === 'Completed' && (
                            <Text fontSize="sm" color="gray.500">
                              Completed on: {new Date(project.updatedAt).toLocaleDateString()}
                            </Text>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;