import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Loading } from "../../components/common/Loading";
import { authService } from "../../services/authService";
import type { User, Role } from "../../types"; // FIXED: Proper import
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";
import { getRoleName, formatDate } from "../../utils/format";
import toast from "react-hot-toast";

export function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (
            !confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`)
        ) {
            return;
        }

        setIsDeleting(true);
        try {
            await authService.deleteUser(userId);
            toast.success("Pengguna berhasil dihapus");
            loadUsers();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nip.includes(searchTerm)
    );

    if (isLoading) {
        return (
            <DashboardLayout>
                <Loading />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Kelola Pengguna
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manajemen akun pengguna sistem
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <UserPlus className="w-4 h-4" />
                        Tambah Pengguna
                    </Button>
                </div>

                <Card>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, email, atau NIP..."
                                className="input-field pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>NIP</th>
                                    <th>Role</th>
                                    <th>Dibuat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8 text-gray-500"
                                        >
                                            Tidak ada data pengguna
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium">
                                                {user.name}
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.nip}</td>
                                            <td>
                                                <span className="badge badge-draft">
                                                    {getRoleName(user.role)}
                                                </span>
                                            </td>
                                            <td>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                user
                                                            );
                                                            setIsEditModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    {user.role !== "ADMIN" && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user.id,
                                                                    user.name
                                                                )
                                                            }
                                                            disabled={
                                                                isDeleting
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Create Modal */}
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    loadUsers();
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Edit Modal */}
            {selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    user={selectedUser}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSuccess={() => {
                        loadUsers();
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// Create User Modal Component
function CreateUserModal({
    isOpen,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        nip: "",
        role: "OPERATOR" as Role,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.register(formData);
            toast.success("Pengguna berhasil ditambahkan");
            onSuccess();
            setFormData({
                name: "",
                email: "",
                password: "",
                nip: "",
                role: "OPERATOR",
            });
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Pengguna Baru"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Lengkap"
                    required
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                />

                <Input
                    label="Email"
                    type="email"
                    required
                    placeholder="nama@sumbawakab.go.id"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />

                <Input
                    label="NIP"
                    required
                    placeholder="199001012015011001"
                    value={formData.nip}
                    onChange={(e) =>
                        setFormData({ ...formData, nip: e.target.value })
                    }
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="input-field"
                        value={formData.role}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                role: e.target.value as Role,
                            })
                        }
                        required
                    >
                        <option value="OPERATOR">Operator</option>
                        <option value="PPK">PPK</option>
                        <option value="PPTK">PPTK</option>
                        <option value="PENGURUS_BARANG">Pengurus Barang</option>
                        <option value="PPK_KEUANGAN">PPK Keuangan</option>
                        <option value="PA">Pengguna Anggaran</option>
                    </select>
                </div>

                <Input
                    label="Password"
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Simpan
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// Edit User Modal Component
function EditUserModal({
    isOpen,
    user,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        nip: user.nip,
        role: user.role, // ADDED: Include role in form
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.updateUser(user.id, formData);
            toast.success("Data pengguna berhasil diperbarui");
            onSuccess();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Pengguna"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Lengkap"
                    required
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                />

                <Input
                    label="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />

                <Input
                    label="NIP"
                    required
                    value={formData.nip}
                    onChange={(e) =>
                        setFormData({ ...formData, nip: e.target.value })
                    }
                />

                {/* ADDED: Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="input-field"
                        value={formData.role}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                role: e.target.value as Role,
                            })
                        }
                        required
                    >
                        <option value="OPERATOR">Operator</option>
                        <option value="PPK">PPK</option>
                        <option value="PPTK">PPTK</option>
                        <option value="PENGURUS_BARANG">Pengurus Barang</option>
                        <option value="PPK_KEUANGAN">PPK Keuangan</option>
                        <option value="PA">Pengguna Anggaran</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Perubahan role akan mempengaruhi hak akses pengguna
                    </p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="flex-1"
                    >
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
