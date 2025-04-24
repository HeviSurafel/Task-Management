import React from "react";
import "./sidenav.css";
import { MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { LuLogOut } from "react-icons/lu";
import { FaHistory } from "react-icons/fa";
import { IoChatbox } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import useUserStore from "../../store/auth";

function Sidenav() {
  const location = useLocation();
  const { user, logout } = useUserStore();
  console.log("user", user);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    localStorage.removeItem("user");
    window.location.href = "/";
  };
  const allowedRoles = ["Ceo", "Department Head", "supervisor"];
  return (
    <div className="sidenav-main-container">
      <div className="sidenav-scrollable-content">
        <div className="sidenav-profile-container">
          <img
            className="sidenav-profile-img"
            src={
              "https://i.pinimg.com/736x/91/52/be/9152be177af58cd0aa28a6e0b33b7948.jpg"
            }
            alt="Profile"
          />
          <p className="sidenav-profile-name">{user.firstName}</p>
          <p className="sidenav-profile-email">{user.email}</p>
        </div>
        <div className="sidenav-main-container">
          <div className="sidenav-scrollable-content">
            <div className="sidenav-profile-container">
              <img
                className="sidenav-profile-img"
                src={
                  user.profile ||
                  "https://www.w3schools.com/howto/img_avatar.png"
                }
                alt="Profile"
              />
              <p className="sidenav-profile-name">{user.firstName}</p>
              <p className="sidenav-profile-email">{user.email}</p>
            </div>
            <div className="sidenav-list-main-container">
              {allowedRoles.includes(user?.role) && (
                <>
                  <Link to="/admin/dashboard">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/admin/dashboard"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <MdDashboard className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Dashboard</p>
                    </div>
                  </Link>
                  <Link to="/admin/employees">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/admin/employees"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <FaPeopleGroup className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Employees</p>
                    </div>
                  </Link>
                  <Link to="/admin/projects">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/admin/projects"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <FaProjectDiagram className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Projects</p>
                    </div>
                  </Link>
                  <Link to="/admin/tasks">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/admin/tasks"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <FaTasks className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Tasks</p>
                    </div>
                  </Link>
                  <Link to="/admin/taskandchat">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/employee/taskandchat"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <IoChatbox className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Tasks and Chat</p>
                    </div>
                  </Link>
                </>
              )}
              {user.role === "Employee" && (
                <>
                  <Link to="/employee/overview">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/employee/overview"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <MdDashboard className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Overview</p>
                    </div>
                  </Link>
                  <Link to="/employee/taskandchat">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/employee/taskandchat"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <IoChatbox className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">Tasks and Chat</p>
                    </div>
                  </Link>

                  <Link to="/employee/taskHistory">
                    <div
                      className={`sidenav-list ${
                        location.pathname === "/employee/taskHistory"
                          ? "default-hover"
                          : ""
                      }`}
                    >
                      <span>
                        <FaHistory className="sidenav-icon" />
                      </span>
                      <p className="sidenav-list-text">TaskHistory</p>
                    </div>
                  </Link>
                </>
              )}

              <Link
                to={
                  user.role === "Employee"
                    ? `/${user.role}/notification`
                    : "/admin/notification"
                }
              >
                <div
                  className={`sidenav-list ${
                    location.pathname === `/${user.role}/notification`
                      ? "default-hover"
                      : ""
                  }`}
                >
                  <span>
                    <IoIosNotifications className="sidenav-icon" />
                  </span>
                  <p className="sidenav-list-text">Notification</p>
                </div>
              </Link>
              <div
                className={`sidenav-list ${
                  location.pathname === "/logout" ? "default-hover" : ""
                }`}
                onClick={handleLogout}
              >
                <span>
                  <LuLogOut className="sidenav-icon" />
                </span>
                <p className="sidenav-list-text">Logout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidenav;
