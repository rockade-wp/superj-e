import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loading } from "./components/common/Loading";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";

// Dashboard
import { DashboardPage } from "./pages/dashboard/DashboardPage";

// Admin Pages
import { UserManagementPage } from "./pages/admin/UserManagementPage";

// Operator Pages
import { SpjListPage } from "./pages/operator/SpjListPage";
import { CreateSpjPage } from "./pages/operator/CreateSpjPage";
import { SpjDetailPage } from "./pages/operator/SpjDetailPage";

// Pejabat Pages
import { PejabatSpjListPage } from "./pages/pejabat/PejabatSpjListPage";
import { PejabatSpjDetailPage } from "./pages/pejabat/PejabatSpjDetailPage";
import { VerifySpjPage } from "./pages/pejabat/VerifySpjPage";
import { FinalizeSpjPage } from "./pages/pejabat/FinalizeSpjPage";

// Settings
import { SettingsPage } from "./pages/settings/SettingsPage";

// Activity Logs
import { ActivityLogsPage } from "./pages/admin/ActivityLogsPage";

function PrivateRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles?: string[];
}) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

function App() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <Loading />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <LoginPage />
                        )
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/users"
                    element={
                        <PrivateRoute allowedRoles={["ADMIN"]}>
                            <UserManagementPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin/logs"
                    element={
                        <PrivateRoute allowedRoles={["PA"]}>
                            <ActivityLogsPage />
                        </PrivateRoute>
                    }
                />

                {/* Operator Routes */}
                <Route
                    path="/operator/spj"
                    element={
                        <PrivateRoute allowedRoles={["OPERATOR"]}>
                            <SpjListPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/operator/spj/create"
                    element={
                        <PrivateRoute allowedRoles={["OPERATOR"]}>
                            <CreateSpjPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/operator/spj/:spjId"
                    element={
                        <PrivateRoute allowedRoles={["OPERATOR"]}>
                            <SpjDetailPage />
                        </PrivateRoute>
                    }
                />

                {/* Pejabat Routes */}
                <Route
                    path="/pejabat/spj"
                    element={
                        <PrivateRoute
                            allowedRoles={[
                                "PPK",
                                "PPTK",
                                "PENGURUS_BARANG",
                                "PPK_KEUANGAN",
                                "PA",
                            ]}
                        >
                            <PejabatSpjListPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pejabat/spj/:spjId"
                    element={
                        <PrivateRoute
                            allowedRoles={[
                                "PPK",
                                "PPTK",
                                "PENGURUS_BARANG",
                                "PPK_KEUANGAN",
                                "PA",
                            ]}
                        >
                            <PejabatSpjDetailPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pejabat/verify"
                    element={
                        <PrivateRoute allowedRoles={["PENGURUS_BARANG"]}>
                            <VerifySpjPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/pejabat/finalize"
                    element={
                        <PrivateRoute allowedRoles={["PPK_KEUANGAN"]}>
                            <FinalizeSpjPage />
                        </PrivateRoute>
                    }
                />

                {/* Settings */}
                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <SettingsPage />
                        </PrivateRoute>
                    }
                />

                {/* Default Redirect */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
