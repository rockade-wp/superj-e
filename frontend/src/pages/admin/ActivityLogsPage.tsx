// ==================== src/pages/admin/ActivityLogsPage.tsx (FIXED) ====================
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import { spjService } from "../../services/spjService";
import type { ActivityLog } from "../../types"; // FIXED: Changed from "../types" to "../../types"
import { formatDateTime, getRoleName } from "../../utils/format";
import { History, Search } from "lucide-react";

export function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await spjService.getActivityLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(
        (log) =>
            log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.spj.rupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Log Aktivitas
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Riwayat aktivitas sistem SPJ
                    </p>
                </div>

                <Card>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama, RUP ID, atau aksi..."
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
                                    <th>Waktu</th>
                                    <th>Pengguna</th>
                                    <th>Role</th>
                                    <th>Aksi</th>
                                    <th>SPJ (RUP ID)</th>
                                    <th>Kegiatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-8"
                                        >
                                            <History className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">
                                                Belum ada log aktivitas
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap">
                                                {formatDateTime(log.timestamp)}
                                            </td>
                                            <td className="font-medium">
                                                {log.user.name}
                                            </td>
                                            <td>
                                                <span className="badge badge-draft">
                                                    {getRoleName(
                                                        log.user.role || ""
                                                    )}
                                                </span>
                                            </td>
                                            <td className="font-mono text-sm">
                                                {log.action}
                                            </td>
                                            <td>{log.spj.rupId}</td>
                                            <td className="max-w-xs truncate">
                                                {log.spj.activityName}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
