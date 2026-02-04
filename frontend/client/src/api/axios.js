import axios from "axios";

// 🚀 AUTO-SWITCH: 
// 1. Checks if a VITE_API_URL is set (like in Vercel or your .env file).
// 2. If not found, it falls back to localhost (for safety).
const BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    // We use "token" consistently across AuthContext and Axios
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;