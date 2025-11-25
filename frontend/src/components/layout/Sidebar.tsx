// ==================== src/components/layout/Sidebar.tsx ====================
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";
import {
    LayoutDashboard,
    FileText,
    Users,
    CheckSquare,
    FileCheck,
    ClipboardList,
    History,
    Settings,
    LogOut,
} from "lucide-react";
import type { Role } from "../../types";

interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    roles: Role[];
}

const navItems: NavItem[] = [
    {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
        roles: [
            "ADMIN",
            "OPERATOR",
            "PPK",
            "PPTK",
            "PENGURUS_BARANG",
            "PPK_KEUANGAN",
            "PA",
        ],
    },
    {
        icon: Users,
        label: "Kelola Pengguna",
        path: "/admin/users",
        roles: ["ADMIN"],
    },
    {
        icon: FileText,
        label: "Pengajuan SPJ",
        path: "/operator/spj",
        roles: ["OPERATOR"],
    },
    {
        icon: ClipboardList,
        label: "Daftar SPJ",
        path: "/pejabat/spj",
        roles: ["PPK", "PPTK", "PENGURUS_BARANG", "PPK_KEUANGAN", "PA"],
    },
    {
        icon: CheckSquare,
        label: "Verifikasi SPJ",
        path: "/pejabat/verify",
        roles: ["PENGURUS_BARANG"],
    },
    {
        icon: FileCheck,
        label: "Finalisasi SPJ",
        path: "/pejabat/finalize",
        roles: ["PPK_KEUANGAN"],
    },
    {
        icon: History,
        label: "Log Aktivitas",
        path: "/admin/logs",
        roles: ["PA"],
    },
    {
        icon: Settings,
        label: "Pengaturan",
        path: "/settings",
        roles: [
            "ADMIN",
            "OPERATOR",
            "PPK",
            "PPTK",
            "PENGURUS_BARANG",
            "PPK_KEUANGAN",
            "PA",
        ],
    },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(user?.role as Role)
    );

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                        SE
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            SUPERJ-E
                        </h1>
                        <p className="text-xs text-gray-500">SPJ Digital</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary-50 text-primary-700 font-medium"
                                            : "text-gray-700 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    );
}
