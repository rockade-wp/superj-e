// ==================== src/pages/pejabat/PejabatSpjDetailPage.tsx (UPDATED) ====================
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { useAuth } from "../../context/AuthContext";
import { spjService } from "../../services/spjService";
import type { SpjSubmission, SpjForm } from "../../types";
import { ArrowLeft, CheckCircle, XCircle, Eye } from "lucide-react";
import { formatDate, getFormName } from "../../utils/format";
import toast from "react-hot-toast";

export function PejabatSpjDetailPage() {
    const { spjId } = useParams<{ spjId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [spj, setSpj] = useState<SpjSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<SpjForm | null>(null);

    useEffect(() => {
        if (spjId) {
            loadSpjDetail();
        }
    }, [spjId]);

    const loadSpjDetail = async () => {
        try {
            const data = await spjService.getSpjById(spjId!);
            setSpj(data);
        } catch (error) {
            console.error("Failed to load SPJ detail:", error);
            navigate("/pejabat/spj");
        } finally {
            setIsLoading(false);
        }
    };

    const canSignForm = (formType: number): boolean => {
        const roleMapping: Record<number, string[]> = {
            1: ["PPK"],
            2: ["PPK"],
            3: ["PA"],
            4: ["OPERATOR"],
            5: ["PPK"],
            6: ["PPTK"],
            7: ["PA"],
            8: ["PENGURUS_BARANG"],
            9: ["PPTK"],
            10: ["PENGURUS_BARANG"],
            11: ["PPK_KEUANGAN"],
        };

        return roleMapping[formType]?.includes(user?.role || "") || false;
    };

    const handleOpenSignModal = (form: SpjForm) => {
        setSelectedForm(form);
        setIsSignModalOpen(true);
    };

    const handleOpenViewModal = (form: SpjForm) => {
        setSelectedForm(form);
        setIsViewModalOpen(true);
    };

    if (isLoading || !spj) {
        return (
            <DashboardLayout>
                <Loading />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/pejabat/spj")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {spj.activityName}
                            </h1>
                            <Badge status={spj.status} />
                        </div>
                        <p className="text-gray-600 mt-1">
                            RUP ID: {spj.rupId} • Tahun {spj.year}
                        </p>
                    </div>
                </div>

                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Operator</p>
                            <p className="font-medium">{spj.operator?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Tanggal Dibuat
                            </p>
                            <p className="font-medium">
                                {formatDate(spj.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge status={spj.status} />
                        </div>
                    </div>
                </Card>

                <Card title="Form SPJ">
                    <div className="space-y-3">
                        {spj.forms?.map((form) => {
                            const canSign = canSignForm(form.formType);
                            const isSigned =
                                form.status === "signed" ||
                                form.status === "physical_signed";

                            return (
                                <div
                                    key={form.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-medium text-gray-900">
                                                {getFormName(form.formType)}
                                            </h3>
                                            <Badge status={form.status} />
                                        </div>
                                        {form.signatures &&
                                            form.signatures.length > 0 && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Ditandatangani oleh:{" "}
                                                    {form.signatures
                                                        .map(
                                                            (s) => s.signer.name
                                                        )
                                                        .join(", ")}
                                                </p>
                                            )}
                                    </div>

                                    <div className="flex gap-2">
                                        {canSign && !isSigned && (
                                            <Button
                                                onClick={() =>
                                                    handleOpenSignModal(form)
                                                }
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Tanda Tangani
                                            </Button>
                                        )}
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                handleOpenViewModal(form)
                                            }
                                        >
                                            <Eye className="w-4 h-4" />
                                            Lihat
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Sign Modal */}
            {selectedForm && isSignModalOpen && (
                <SignFormModal
                    isOpen={isSignModalOpen}
                    spjId={spjId!}
                    formType={selectedForm.formType}
                    onClose={() => {
                        setIsSignModalOpen(false);
                        setSelectedForm(null);
                    }}
                    onSuccess={() => {
                        loadSpjDetail();
                        setIsSignModalOpen(false);
                        setSelectedForm(null);
                    }}
                />
            )}

            {/* View Modal */}
            {selectedForm && isViewModalOpen && (
                <ViewFormModal
                    isOpen={isViewModalOpen}
                    form={selectedForm}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedForm(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// Sign Form Modal
function SignFormModal({
    isOpen,
    spjId,
    formType,
    onClose,
    onSuccess,
}: {
    isOpen: boolean;
    spjId: string;
    formType: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState<"approve" | "reject">("approve");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (action === "reject" && !notes.trim()) {
            toast.error("Catatan penolakan wajib diisi");
            return;
        }

        setIsLoading(true);
        try {
            await spjService.signForm(
                spjId,
                formType,
                action === "reject" ? { notes } : undefined
            );
            toast.success(
                action === "approve"
                    ? "Form berhasil ditandatangani"
                    : "Form ditolak"
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
            title="Tanda Tangani Form"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aksi
                    </label>
                    <select
                        className="input-field"
                        value={action}
                        onChange={(e) =>
                            setAction(e.target.value as "approve" | "reject")
                        }
                    >
                        <option value="approve">Setujui & Tanda Tangani</option>
                        <option value="reject">Tolak</option>
                    </select>
                </div>

                {action === "reject" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan Penolakan{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="input-field min-h-[100px]"
                            placeholder="Jelaskan alasan penolakan..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                        />
                    </div>
                )}

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
                        variant={action === "reject" ? "danger" : "primary"}
                        className="flex-1"
                    >
                        {action === "approve" ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Tanda Tangani
                            </>
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />
                                Tolak
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// NEW: View Form Modal
function ViewFormModal({
    isOpen,
    form,
    onClose,
}: {
    isOpen: boolean;
    form: SpjForm;
    onClose: () => void;
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getFormName(form.formType)}
            size="xl"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                        <p className="text-sm text-gray-600">Status Form</p>
                        <Badge status={form.status} />
                    </div>
                    {form.physicalSignatureScanUrl && (
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Scan TTD Fisik
                            </p>
                            <a
                                href={form.physicalSignatureScanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline text-sm"
                            >
                                Lihat File ({form.physicalSignatureFileType})
                            </a>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6 max-h-[60vh] overflow-y-auto">
                    <h4 className="font-semibold mb-3 text-gray-900">
                        Data Form:
                    </h4>

                    {/* Display form data in a readable format */}
                    {Object.keys(form.data).length === 0 ? (
                        <p className="text-gray-500 italic">Form belum diisi</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(form.data).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-white p-3 rounded border"
                                >
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                        {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-gray-900">
                                        {typeof value === "object"
                                            ? JSON.stringify(value, null, 2)
                                            : String(value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {form.notes && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">
                            Catatan Penolakan:
                        </h4>
                        <p className="text-red-800">{form.notes}</p>
                    </div>
                )}

                {form.signatures && form.signatures.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">
                            Riwayat Tanda Tangan:
                        </h4>
                        <ul className="space-y-2">
                            {form.signatures.map((sig) => (
                                <li
                                    key={sig.id}
                                    className="text-sm text-green-800"
                                >
                                    • {sig.signer.name} ({sig.signer.role}) -{" "}
                                    {formatDate(sig.signedAt)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Modal>
    );
}
