// ==================== src/components/layout/Header.tsx ====================
import { useAuth } from "../../context/AuthContext";
import { getRoleName } from "../../utils/format";
import { User, Bell } from "lucide-react";

export function Header() {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Selamat Datang, {user?.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {getRoleName(user?.role || "")}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
