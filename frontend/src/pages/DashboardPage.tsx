import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Grid, Paper, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Dashboard
                    </Typography>
                    <Typography variant="h6" component="p">
                        Selamat datang, <strong>{user?.name}</strong>!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Anda login sebagai: <strong>{user?.role}</strong>
                    </Typography>
                </Paper>
            </Box>

            <Grid container spacing={3}>
                {/* Kartu untuk semua role */}
                <Grid xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h6">Daftar SPJ</Typography>
                        <Typography variant="body2">
                            Lihat semua pengajuan SPJ
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/spj")}
                        >
                            Lihat SPJ
                        </Button>
                    </Paper>
                </Grid>

                {/* Kartu khusus untuk Operator */}
                {user?.role === "OPERATOR" && (
                    <Grid xs={12} sm={6} md={4}>
                        <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">Buat SPJ Baru</Typography>
                            <Typography variant="body2">
                                Ajukan pengajuan SPJ baru
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                sx={{ mt: 2 }}
                                onClick={() => navigate("/spj/new")} // Akan kita buat nanti
                            >
                                + Buat Baru
                            </Button>
                        </Paper>
                    </Grid>
                )}

                {/* Kartu khusus untuk Admin */}
                {user?.role === "ADMIN" && (
                    <Grid xs={12} sm={6} md={4}>
                        <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
                            <Typography variant="h6">Manajemen User</Typography>
                            <Typography variant="body2">
                                Tambah atau lihat daftar pengguna
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ mt: 2 }}
                                onClick={() => navigate("/users")}
                            >
                                Kelola User
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <Box sx={{ mt: 4, textAlign: "center" }}>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default DashboardPage;
