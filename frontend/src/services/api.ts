import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error: string }>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        } else if (error.response?.status === 403) {
            toast.error("Anda tidak memiliki akses untuk melakukan aksi ini.");
        } else if (error.response?.data?.error) {
            toast.error(error.response.data.error);
        } else {
            toast.error("Terjadi kesalahan. Silakan coba lagi.");
        }
        return Promise.reject(error);
    }
);

export default api;
