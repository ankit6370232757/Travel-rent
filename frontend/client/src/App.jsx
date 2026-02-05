import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast"; // 👈 ✅ IMPORT TOAST SYSTEM

// Auth Pages
import Login from "./auth/Login";
import Register from "./auth/Register";

// New Professional Layout
import DashboardLayout from "./layouts/DashboardLayout"; 

// Components for Protection
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
      
      {/* 👇 ✅ ADD TOASTER HERE (So notifications work everywhere) */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: '#00c853',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4d4d',
              secondary: '#fff',
            },
          },
        }}
      />

      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* ✅ Main Dashboard (User) */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin Route (Reuses DashboardLayout but activates Admin Tab) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}