import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    MenuItem,
    Box,
    Alert,
    CircularProgress,
} from "@mui/material";
import { register, getUsers } from "../api/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    nip: string;
    createdAt: string;
}

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // State untuk form registrasi
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        nip: "",
    });

    const roles = [
        "OPERATOR",
        "PPK",
        "PPTK",
        "PENGURUS_BARANG",
        "PPK_KEUANGAN",
        "PA",
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (err: any) {
            setError("Gagal mengambil data pengguna");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            await register(newUser);
            setSuccess("Pengguna berhasil didaftarkan!");
            setNewUser({
                name: "",
                email: "",
                password: "",
                role: "",
                nip: "",
            });
            fetchUsers(); // Refresh daftar user
        } catch (err: any) {
            setError(err.response?.data?.error || "Registrasi gagal");
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Manajemen Pengguna
            </Typography>

            {/* Form Registrasi */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Daftarkan Pengguna Baru
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleRegister}>
                    <TextField
                        fullWidth
                        label="Nama"
                        name="name"
                        value={newUser.name}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        select
                        label="Role"
                        name="role"
                        value={newUser.role}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    >
                        {roles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        label="NIP"
                        name="nip"
                        value={newUser.nip}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Daftarkan
                    </Button>
                </Box>
            </Paper>

            {/* Tabel Daftar Pengguna */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nama</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>NIP</TableCell>
                            <TableCell>Tanggal Dibuat</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.nip}</TableCell>
                                <TableCell>
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserManagementPage;
