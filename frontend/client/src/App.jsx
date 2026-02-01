import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { AuthProvider } from "./context/AuthContext";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Define the professional theme
const theme = {
  bg: "#0f0f0f",
  card: "#1e1e1e",
  text: "#ffffff",
  textSoft: "#aaaaaa",
  accent: "#3ea6ff",
  soft: "#333333",
  danger: "#ff4d4d",
  success: "#2ba150",
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, sans-serif;
    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
  }
`;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}