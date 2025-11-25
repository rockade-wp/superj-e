import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";

export function SettingsPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Password saat ini wajib diisi";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "Password baru wajib diisi";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password minimal 6 karakter";
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Konfirmasi password tidak sesuai";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.updatePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            toast.success("Password berhasil diubah");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Pengaturan
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Kelola akun dan keamanan Anda
                    </p>
                </div>

                {/* Profile Info */}
                <Card title="Informasi Profil">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama
                                </label>
                                <p className="text-gray-900">{user?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <p className="text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIP
                                </label>
                                <p className="text-gray-900">{user?.nip}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <p className="text-gray-900">{user?.role}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Untuk mengubah informasi profil, hubungi
                            Administrator
                        </p>
                    </div>
                </Card>

                {/* Change Password */}
                <Card title="Ubah Password">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Password Saat Ini"
                            type="password"
                            required
                            value={formData.currentPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    currentPassword: e.target.value,
                                })
                            }
                            error={errors.currentPassword}
                        />

                        <Input
                            label="Password Baru"
                            type="password"
                            required
                            value={formData.newPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    newPassword: e.target.value,
                                })
                            }
                            error={errors.newPassword}
                        />

                        <Input
                            label="Konfirmasi Password Baru"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value,
                                })
                            }
                            error={errors.confirmPassword}
                        />

                        <Button type="submit" isLoading={isLoading}>
                            <Lock className="w-4 h-4" />
                            Ubah Password
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
