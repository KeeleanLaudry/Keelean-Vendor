// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import SignUp from "./Pages/SignUp/SignUp";
import UploadDocument from "./Pages/SignUp/UploadDocument";
import Info from "./Pages/SignUp/Info";
import Toggleline from "./Pages/Toggleline/Toggleline";
import CustomerOrder from "./Components/dataTable/CustomerOrder";
import Sidebar from "./Sidebar/Sidebar";
import Dashboard from "./Dashboard/Dashboard";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<SignUp />} />

      {/* Protected */}
      <Route
        path="/upload-document"
        element={
          <ProtectedRoute>
            <UploadDocument />
          </ProtectedRoute>
        }
      />

      <Route
        path="/info"
        element={
          <ProtectedRoute>
            <Info />
          </ProtectedRoute>
        }
      />

      <Route
        path="/toggleline"
        element={
          <ProtectedRoute>
            <Toggleline />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customerorder"
        element={
          <ProtectedRoute>
            <CustomerOrder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sidebar"
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
