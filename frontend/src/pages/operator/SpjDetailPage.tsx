// ==================== src/pages/operator/SpjDetailPage.tsx (FINAL VERSION) ====================
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { spjService } from "../../services/spjService";
import { FormSelector } from "../../components/forms"; // UPDATED: Use FormSelector
import type { SpjSubmission } from "../../types";
import { ArrowLeft, Download, Upload, Check } from "lucide-react";
import { formatDate, getFormName } from "../../utils/format";
import toast from "react-hot-toast";

export function SpjDetailPage() {
    const { spjId } = useParams<{ spjId: string }>();
    const navigate = useNavigate();
    const [spj, setSpj] = useState<SpjSubmission | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFormForUpload, setSelectedFormForUpload] = useState<
        number | null
    >(null);

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
            navigate("/operator/spj");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadDraft = async (formType: number) => {
        try {
            const blob = await spjService.downloadDraftForm(spjId!, formType);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `DRAFT_${getFormName(formType)}_${spj?.rupId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Draft berhasil diunduh");
        } catch (error) {
            // Error handled by interceptor
        }
    };

    const handleSaveForm = async (formType: number, formData: any) => {
        try {
            await spjService.updateForm(spjId!, formType, formData);
            toast.success("Form berhasil disimpan");
            loadSpjDetail();
        } catch (error) {
            throw error;
        }
    };

    if (isLoading || !spj) {
        return (
            <DashboardLayout>
                <Loading />
            </DashboardLayout>
        );
    }

    const currentForm = spj.forms?.find((f) => f.formType === activeTab);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/operator/spj")}
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
                    {spj.status === "completed" && (
                        <Button
                            onClick={async () => {
                                try {
                                    const blob =
                                        await spjService.downloadCompletedSpj(
                                            spjId!
                                        );
                                    const url =
                                        window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `SPJ_${spj.rupId}_${spj.year}.pdf`;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                    toast.success(
                                        "SPJ lengkap berhasil diunduh"
                                    );
                                } catch (error) {
                                    // Error handled
                                }
                            }}
                        >
                            <Download className="w-4 h-4" />
                            Unduh SPJ Lengkap
                        </Button>
                    )}
                </div>

                {/* Info Card */}
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

                {/* Form Tabs */}
                <Card>
                    <div className="mb-6">
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <div className="flex gap-2 min-w-max">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                                    (num) => {
                                        const form = spj.forms?.find(
                                            (f) => f.formType === num
                                        );
                                        const isActive = activeTab === num;
                                        const isCompleted =
                                            form?.status === "signed" ||
                                            form?.status === "physical_signed";

                                        return (
                                            <button
                                                key={num}
                                                onClick={() =>
                                                    setActiveTab(num)
                                                }
                                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                                                    isActive
                                                        ? "border-primary-600 text-primary-600 font-medium"
                                                        : "border-transparent text-gray-600 hover:text-gray-900"
                                                }`}
                                            >
                                                Form {num}
                                                {isCompleted && (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                )}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {getFormName(activeTab)}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Status:{" "}
                                    <Badge
                                        status={currentForm?.status || "draft"}
                                    />
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {/* Download draft for Form 1-3 only */}
                                {activeTab >= 1 && activeTab <= 3 && (
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            handleDownloadDraft(activeTab)
                                        }
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh Draft
                                    </Button>
                                )}

                                {/* Upload physical signature for Form 1-3 */}
                                {activeTab >= 1 &&
                                    activeTab <= 3 &&
                                    currentForm?.status !==
                                        "physical_signed" && (
                                        <Button
                                            onClick={() =>
                                                setSelectedFormForUpload(
                                                    activeTab
                                                )
                                            }
                                        >
                                            <Upload className="w-4 h-4" />
                                            Upload TTD Fisik
                                        </Button>
                                    )}
                            </div>
                        </div>

                        {/* UPDATED: Use FormSelector */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <FormSelector
                                formType={activeTab}
                                initialData={currentForm?.data || {}}
                                onSave={(data) =>
                                    handleSaveForm(activeTab, data)
                                }
                                canEdit={true}
                            />
                        </div>

                        {/* Notes if rejected */}
                        {currentForm?.notes && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-900 mb-2">
                                    Catatan Penolakan:
                                </h4>
                                <p className="text-red-800">
                                    {currentForm.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Upload Modal */}
            {selectedFormForUpload && (
                <UploadPhysicalSignatureModal
                    isOpen={isUploadModalOpen}
                    spjId={spjId!}
                    formType={selectedFormForUpload}
                    onClose={() => {
                        setIsUploadModalOpen(false);
                        setSelectedFormForUpload(null);
                    }}
                    onSuccess={() => {
                        loadSpjDetail();
                        setIsUploadModalOpen(false);
                        setSelectedFormForUpload(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

// Upload Physical Signature Modal
function UploadPhysicalSignatureModal({
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
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<"pdf" | "excel">("pdf");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Pilih file terlebih dahulu");
            return;
        }

        setIsLoading(true);
        try {
            await spjService.uploadPhysicalScan(
                spjId,
                formType,
                file,
                fileType
            );
            toast.success("Scan tanda tangan fisik berhasil diunggah");
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
            title="Upload Tanda Tangan Fisik"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe File <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="input-field"
                        value={fileType}
                        onChange={(e) =>
                            setFileType(e.target.value as "pdf" | "excel")
                        }
                    >
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Scan <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept={fileType === "pdf" ? ".pdf" : ".xlsx,.xls"}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="input-field"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Upload file yang sudah ditandatangani secara fisik
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
                        <Upload className="w-4 h-4" />
                        Upload
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
