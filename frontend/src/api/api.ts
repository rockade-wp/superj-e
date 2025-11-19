import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor untuk menambahkan token ke setiap request
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

// --- Auth API ---
export const login = (email: string, password: string) =>
    api.post("/auth/login", { email, password });

export const register = (userData: any) => api.post("/auth/register", userData);

export const getUsers = () => api.get("/auth/users");

// --- SPJ API ---
export const createSpj = (spjData: any) => api.post("/spj", spjData);

export const getSpjList = () => api.get("/spj");

export const getSpjDetail = (spjId: string) => api.get(`/spj/${spjId}`);

export const updateSpjForm = (spjId: string, formType: number, formData: any) =>
    api.patch(`/spj/${spjId}/form/${formType}`, formData);

export const uploadScan = (spjId: string, formType: number, file: File) => {
    const formData = new FormData();
    formData.append("scan", file);
    return api.post(`/spj/${spjId}/form/${formType}/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const signSpjForm = (spjId: string, formType: number, notes?: string) =>
    api.post(`/spj/${spjId}/form/${formType}/sign`, { notes });

export const verifySpj = (spjId: string, isValid: boolean, notes?: string) =>
    api.post(`/spj/${spjId}/verify`, { isValid, notes });

export const finalizeSpj = (
    spjId: string,
    isFinalValid: boolean,
    notes?: string
) => api.post(`/spj/${spjId}/finalize`, { isFinalValid, notes });

export const downloadSpjExcel = (spjId: string) =>
    api.get(`/spj/${spjId}/download`, { responseType: "blob" });

export default api;
