import { Outlet } from "react-router-dom";
import Sidenav from "./components/sidenav/Sidenav";
import Navbar from "./components/navbar/Navbar";

const Layout = () => {
  return (
    <div className="flex">
      <Sidenav />
      <div className="flex-1">
        <Navbar />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
