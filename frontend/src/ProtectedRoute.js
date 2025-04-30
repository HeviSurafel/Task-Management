import React from "react";
import { Navigate } from "react-router-dom";
import useUserStore from "./store/auth";

const ProtectedRoute = ({ children }) => {
  const { user, checkingAuth } = useUserStore();

  // If the user is still being checked for authentication, show a loading screen
  if (checkingAuth) return <div>Loading...</div>;

  // If there's no user, redirect to the login page
  if (!user) return <Navigate to="/" />;

  // Otherwise, allow the route to render the children
  return children;
};

export default ProtectedRoute;
