import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    CircularProgress,
} from "@mui/material";
import { getSpjList } from "../api/api";
import { useAuth } from "../context/AuthContext";

interface SpjSubmission {
    id: string;
    rupId: string;
    activityName: string;
    year: number;
    status: string;
    createdAt: string;
    operator: { name: string };
}

const SpjListPage: React.FC = () => {
    const [spjList, setSpjList] = useState<SpjSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getSpjList();
                setSpjList(response.data);
            } catch (error) {
                console.error("Failed to fetch SPJ list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                Daftar SPJ
            </Typography>
            {user?.role === "OPERATOR" && (
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mb: 2 }}
                    onClick={() => navigate("/spj/new")}
                >
                    Buat SPJ Baru
                </Button>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>RUP ID</TableCell>
                            <TableCell>Nama Kegiatan</TableCell>
                            <TableCell>Tahun</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Operator</TableCell>
                            <TableCell>Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spjList.map((spj) => (
                            <TableRow key={spj.id}>
                                <TableCell>{spj.rupId}</TableCell>
                                <TableCell>{spj.activityName}</TableCell>
                                <TableCell>{spj.year}</TableCell>
                                <TableCell>{spj.status}</TableCell>
                                <TableCell>{spj.operator.name}</TableCell>
                                <TableCell>
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            navigate(`/spj/${spj.id}`)
                                        }
                                    >
                                        Lihat Detail
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default SpjListPage;
