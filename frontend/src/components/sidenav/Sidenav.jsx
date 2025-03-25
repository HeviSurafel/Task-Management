import React from 'react'
import "./sidenav.css"
import { MdChat, MdDashboard } from "react-icons/md";
import { FaPeopleGroup } from "react-icons/fa6";
import { FaProjectDiagram } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { IoIosNotifications, IoIosTime } from "react-icons/io";
import { MdInsertInvitation } from "react-icons/md";
import { LuLogOut } from "react-icons/lu";

import { Link, useLocation } from "react-router-dom";

function Sidenav() {
  const location = useLocation();

  return (
    <div className='sidenav-main-container'>
      <div className='sidenav-profile-container'>
        <img className='sidenav-profile-img' src={"https://www.w3schools.com/howto/img_avatar.png"} alt="Profile" />
        <p className='sidenav-profile-name'>Surafel</p>
        <p className='sidenav-profile-email'>surafelwondu47gmail.com</p>
      </div>
      <div className='sidenav-list-main-container'>
        <Link to="/admin/dashboard"><div className={`sidenav-list ${location.pathname === "/admin/dashboard" ? "default-hover" : ""}`}><span><MdDashboard className='sidenav-icon' /></span><p className='sidenav-list-text'>Dashboard</p></div></Link>
        <Link to="/admin/employees"><div className={`sidenav-list ${location.pathname === "/admin/employees" ? "default-hover" : ""}`}><span><FaPeopleGroup className='sidenav-icon' /></span><p className='sidenav-list-text'>Employees</p></div></Link>
        <Link to="/admin/projects"><div className={`sidenav-list ${location.pathname === "/admin/projects" ? "default-hover" : ""}`}><span><FaProjectDiagram className='sidenav-icon' /></span><p className='sidenav-list-text'>Projects</p></div></Link>
        <Link to="/admin/tasks"><div className={`sidenav-list ${location.pathname === "/admin/tasks" ? "default-hover" : ""}`}><span><FaTasks className='sidenav-icon' /></span><p className='sidenav-list-text'>Tasks</p></div></Link>
        <Link to="/admin/timesheets"><div className={`sidenav-list ${location.pathname === "/admin/timesheets" ? "default-hover" : ""}`}><span><IoIosTime className='sidenav-icon' /></span><p className='sidenav-list-text'>Timesheets</p></div></Link>
        <Link to="/admin/attendance"><div className={`sidenav-list ${location.pathname === "/admin/attendance" ? "default-hover" : ""}`}><span><MdInsertInvitation className='sidenav-icon' /></span><p className='sidenav-list-text'>Attendance</p></div></Link>
        <Link to="/admin/notification"><div className={`sidenav-list ${location.pathname === "/admin/notification" ? "default-hover" : ""}`}><span><IoIosNotifications className='sidenav-icon' /></span><p className='sidenav-list-text'>Notification</p></div></Link>
        <Link to="/admin/chat"><div className={`sidenav-list ${location.pathname === "/admin/chat" ? "default-hover" : ""}`}><span><MdChat className='sidenav-icon' /></span><p className='sidenav-list-text'>chat</p></div></Link>
        <Link to="/logout"><div className={`sidenav-list ${location.pathname === "/logout" ? "default-hover" : ""}`}><span><LuLogOut className='sidenav-icon' /></span><p className='sidenav-list-text'>Logout</p></div></Link>
      </div>
    </div>
  )
}

export default Sidenav