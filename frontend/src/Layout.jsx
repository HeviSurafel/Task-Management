import { Outlet } from "react-router-dom";
import Sidenav from "./components/sidenav/Sidenav";
import Navbar from "./components/navbar/Navbar";
import "./Layout.css";

const Layout = () => {
  return (
    <div className="layout-container">
      <Navbar />
      <div className="content-wrapper">
        <Sidenav />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;