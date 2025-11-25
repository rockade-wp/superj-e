// ==================== src/pages/operator/SpjListPage.tsx (FIXED) ====================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Loading } from "../../components/common/Loading";
import { spjService } from "../../services/spjService";
import type { SpjSubmission } from "../../types"; // FIXED: Changed from "./types" to "../../types"
import { Plus, Search, FileText, Calendar } from "lucide-react";
import { formatDate } from "../../utils/format";

export function SpjListPage() {
    const [spjList, setSpjList] = useState<SpjSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadSpjList();
    }, []);

    const loadSpjList = async () => {
        try {
            const data = await spjService.getAllSpj();
            setSpjList(data);
        } catch (error) {
            console.error("Failed to load SPJ list:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredSpj = spjList.filter(
        (spj) =>
            spj.rupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            spj.activityName.toLowerCase().includes(searchTerm.toLowerCase())
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
                            Pengajuan SPJ
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola pengajuan SPJ Anda
                        </p>
                    </div>
                    <Link to="/operator/spj/create">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Buat SPJ Baru
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan RUP ID atau nama kegiatan..."
                                className="input-field pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredSpj.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">
                                    Belum ada pengajuan SPJ
                                </p>
                                <Link to="/operator/spj/create">
                                    <Button className="mt-4">
                                        <Plus className="w-4 h-4" />
                                        Buat SPJ Pertama
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            filteredSpj.map((spj) => (
                                <Link
                                    key={spj.id}
                                    to={`/operator/spj/${spj.id}`}
                                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {spj.activityName}
                                                </h3>
                                                <Badge status={spj.status} />
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {spj.activity}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    RUP ID: {spj.rupId}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Tahun {spj.year}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            <p>{formatDate(spj.createdAt)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
