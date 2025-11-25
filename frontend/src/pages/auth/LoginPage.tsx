// ==================== src/pages/auth/LoginPage.tsx (IMPROVED) ====================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Lock, Mail, Shield, FileText, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData);
            navigate("/dashboard");
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Branding & Info */}
                    <div className="hidden md:block space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                                <Shield className="w-8 h-8 text-primary-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        SUPERJ-E
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        SPJ Digital Terintegrasi
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                                Surat Pertanggungjawaban
                                <span className="text-primary-600">
                                    {" "}
                                    Elektronik
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600">
                                Digitalisasi proses SPJ untuk efisiensi dan
                                transparansi administrasi pemerintahan
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: FileText,
                                    title: "11 Form Otomatis",
                                    desc: "Sistem menghasilkan semua form SPJ secara otomatis",
                                },
                                {
                                    icon: Shield,
                                    title: "TTE Terintegrasi",
                                    desc: "Tanda tangan elektronik tersertifikasi",
                                },
                                {
                                    icon: CheckCircle,
                                    title: "Workflow Terstruktur",
                                    desc: "Proses verifikasi dan finalisasi yang jelas",
                                },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <feature.icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full">
                        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
                            {/* Logo & Header */}
                            <div className="text-center mb-8">
                                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform">
                                    {/* Logo Kominfo - Update path sesuai lokasi file */}
                                    <img
                                        src="../../../public/kominfo.jpg"
                                        alt="Logo Kominfo"
                                        className="w-20 h-20 object-contain rounded-xl"
                                        onError={(e) => {
                                            // Fallback jika image tidak ada
                                            e.currentTarget.style.display =
                                                "none";
                                            e.currentTarget.parentElement!.innerHTML =
                                                '<div class="text-white font-bold text-3xl">DK</div>';
                                        }}
                                    />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Selamat Datang
                                </h1>
                                <p className="text-gray-600">
                                    Masuk ke akun SUPERJ-E Anda
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Dinas Komunikasi, Informatika, Statistik dan
                                    Persandian
                                </p>
                                <p className="text-sm font-medium text-primary-600">
                                    Kabupaten Sumbawa
                                </p>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-base"
                                            placeholder="nama@sumbawakab.go.id"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all outline-none text-base"
                                            placeholder="Masukkan password Anda"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                                    isLoading={isLoading}
                                >
                                    Masuk ke Dashboard
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                <p className="text-sm text-gray-600">
                                    © 2025 Pemerintah Kabupaten Sumbawa
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Semua hak dilindungi undang-undang
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom animations to index.css or tailwind.config */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
