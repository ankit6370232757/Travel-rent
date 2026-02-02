import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { AuthProvider } from "./context/AuthContext";

// Auth Pages
import Login from "./auth/Login";
import Register from "./auth/Register";

// New Professional Layout
import DashboardLayout from "./layouts/DashboardLayout"; 

// Admin & Auth Protection
import AdminPanel from "./dashboard/AdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";

// ✨ Professional Theme (Deep Dark Mode)
const theme = {
  bg: "#0a0a0a",        // Deep Black for main background
  card: "#121212",      // Slightly lighter for cards/sidebar
  text: "#ffffff",
  textSoft: "#a0a0a0",
  accent: "#3ea6ff",    // Professional Blue
  soft: "#2a2a2a",      // Borders/Separators
  danger: "#ff4d4d",
  success: "#00c853",
};

// ✨ Global Styles with Font Smoothing & Custom Scrollbars
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Segoe UI', -apple-system, sans-serif;
    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * { box-sizing: border-box; }

  /* Custom Professional Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #0a0a0a;
  }
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* ✅ Main Dashboard (Uses the New Layout) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}