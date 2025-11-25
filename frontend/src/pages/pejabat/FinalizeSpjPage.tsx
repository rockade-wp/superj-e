import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { spjService } from "../../services/spjService";
import type { SpjSubmission } from "../../types";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "../../utils/format";
import toast from "react-hot-toast";

// Untuk PPK Keuangan melakukan finalisasi akhir SPJ
export function FinalizeSpjPage() {
    const [spjList, setSpjList] = useState<SpjSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [selectedSpj, setSelectedSpj] = useState<SpjSubmission | null>(null);

    useEffect(() => {
        loadSpjList();
    }, []);

    const loadSpjList = async () => {
        try {
            const data = await spjService.getAllSpj();
            const readyToFinalize = data.filter(
                (spj) => spj.status === "verified"
            );
            setSpjList(readyToFinalize);
        } catch (error) {
            console.error("Failed to load SPJ list:", error);
        } finally {
            setIsLoading(false);
        }
    };

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
                        Finalisasi SPJ
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Finalisasi akhir dokumen SPJ (PPK Keuangan)
                    </p>
                </div>

                <Card>
                    <div className="space-y-3">
                        {spjList.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                Tidak ada SPJ yang perlu difinalisasi
                            </div>
                        ) : (
                            spjList.map((spj) => (
                                <div
                                    key={spj.id}
                                    className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {spj.activityName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            RUP ID: {spj.rupId} • Tahun{" "}
                                            {spj.year}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(spj.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge status={spj.status} />
                                        <Button
                                            onClick={() => {
                                                setSelectedSpj(spj);
                                                setIsFinalizeModalOpen(true);
                                            }}
                                        >
                                            Finalisasi
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {selectedSpj && (
                <FinalizeModal
                    isOpen={isFinalizeModalOpen}
                    spj={selectedSpj}
                    onClose={() => {
                        setIsFinalizeModalOpen(false);
                        setSelectedSpj(null);
                    }}
                    onSuccess={() => {
                        loadSpjList();
                        setIsFinalizeModalOpen(false);
                        setSelectedSpj(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

function FinalizeModal({
    isOpen,
    spj,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    spj: SpjSubmission;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFinalValid, setIsFinalValid] = useState(true);
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            await spjService.finalizeSpj(spj.id, { isFinalValid, notes });
            toast.success(
                isFinalValid ? "SPJ berhasil difinalisasi" : "SPJ ditolak"
            );
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
            title="Finalisasi SPJ"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        className="input-field"
                        value={isFinalValid ? "completed" : "rejected"}
                        onChange={(e) =>
                            setIsFinalValid(e.target.value === "completed")
                        }
                    >
                        <option value="completed">
                            Selesai - SPJ Disetujui
                        </option>
                        <option value="rejected">Ditolak</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                    </label>
                    <textarea
                        className="input-field min-h-[100px]"
                        placeholder="Catatan finalisasi..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
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
                        {isFinalValid ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        {isFinalValid ? "Finalisasi" : "Tolak"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
