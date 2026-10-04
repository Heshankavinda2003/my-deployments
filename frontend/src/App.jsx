import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import StaffSidebar from "./components/StaffSidebar";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import Admin from "./pages/Admin";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-[#1e293b] antialiased">
        {isAuthenticated ? (
          <Routes>
            {userRole === "Staff" && (
              <Route path="/*" element={<StaffSidebar onLogout={handleLogout} />} />
            )}

            {userRole === "Patient" && (
              <Route path="/*" element={<Patient onLogout={handleLogout} />} />
            )}

            {userRole === "Doctor" && (
              <Route path="/*" element={<Doctor onLogout={handleLogout} />} />
            )}

            {userRole === "Admin" && (
              <Route path="/admin/*" element={<Admin onLogout={handleLogout} />} />
            )}

            <Route
              path="*"
              element={<Navigate to={userRole === "Admin" ? "/admin" : "/"} replace />}
            />
          </Routes>
        ) : (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </Router>
  );
};

export default App;