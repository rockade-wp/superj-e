import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Loading } from "../../components/common/Loading";
import { spjService } from "../../services/spjService";
import type { SpjSubmission } from "../../types";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardPage() {
    const { user } = useAuth();
    const [spjList, setSpjList] = useState<SpjSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSpjData();
    }, []);

    const loadSpjData = async () => {
        try {
            const data = await spjService.getAllSpj();
            setSpjList(data);
        } catch (error) {
            console.error("Failed to load SPJ data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = {
        total: spjList.length,
        draft: spjList.filter((s) => s.status === "draft").length,
        verified: spjList.filter((s) => s.status === "verified").length,
        completed: spjList.filter((s) => s.status === "completed").length,
        rejected: spjList.filter((s) => s.status === "rejected").length,
    };

    const statCards = [
        {
            title: "Total SPJ",
            value: stats.total,
            icon: FileText,
            color: "bg-blue-500",
            link: user?.role === "OPERATOR" ? "/operator/spj" : "/pejabat/spj",
        },
        {
            title: "Draft",
            value: stats.draft,
            icon: Clock,
            color: "bg-gray-500",
            link: user?.role === "OPERATOR" ? "/operator/spj" : "/pejabat/spj",
        },
        {
            title: "Terverifikasi",
            value: stats.verified,
            icon: CheckCircle,
            color: "bg-green-500",
            link: user?.role === "OPERATOR" ? "/operator/spj" : "/pejabat/spj",
        },
        {
            title: "Selesai",
            value: stats.completed,
            icon: CheckCircle,
            color: "bg-emerald-500",
            link: user?.role === "OPERATOR" ? "/operator/spj" : "/pejabat/spj",
        },
    ];

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
                        Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Ringkasan data SPJ Anda
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.title} to={stat.link}>
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`${stat.color} p-3 rounded-lg`}
                                        >
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Recent SPJ */}
                <Card title="SPJ Terbaru">
                    {spjList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Belum ada data SPJ
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {spjList.slice(0, 5).map((spj) => (
                                <Link
                                    key={spj.id}
                                    to={
                                        user?.role === "OPERATOR"
                                            ? `/operator/spj/${spj.id}`
                                            : `/pejabat/spj/${spj.id}`
                                    }
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {spj.activityName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            RUP ID: {spj.rupId}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`badge ${
                                                spj.status === "completed"
                                                    ? "badge-completed"
                                                    : spj.status === "verified"
                                                    ? "badge-verified"
                                                    : spj.status === "rejected"
                                                    ? "badge-rejected"
                                                    : "badge-draft"
                                            }`}
                                        >
                                            {spj.status}
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Tahun {spj.year}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
