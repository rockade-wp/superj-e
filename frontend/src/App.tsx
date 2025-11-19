import React from "react";
import type { JSX } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SpjListPage from "./pages/SpjListPage";
import SpjDetailPage from "./pages/SpjDetailPage";
import UserManagementPage from "./pages/UserManagementPage";

const theme = createTheme();

// Komponen untuk melindungi route
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { user, isAuthenticated } = useAuth();
    return isAuthenticated && user?.role === "ADMIN" ? (
        children
    ) : (
        <Navigate to="/dashboard" />
    );
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/spj"
                element={
                    <PrivateRoute>
                        <SpjListPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/spj/:id"
                element={
                    <PrivateRoute>
                        <SpjDetailPage />
                    </PrivateRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <AdminRoute>
                        <UserManagementPage />
                    </AdminRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
