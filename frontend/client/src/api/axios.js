import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
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