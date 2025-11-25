// ==================== src/components/forms/FormWrapper.tsx ====================
import React from "react";
import { Button } from "../common/Button";
import { Save } from "lucide-react";

interface FormWrapperProps {
    title: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    isLoading?: boolean;
    canEdit?: boolean;
}

export function FormWrapper({
    title,
    children,
    onSubmit,
    isLoading = false,
    canEdit = true,
}: FormWrapperProps) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>
                <p className="text-sm text-blue-700">
                    Lengkapi semua field yang diperlukan untuk form ini
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {children}

                {canEdit && (
                    <div className="flex justify-end pt-4 border-t">
                        <Button type="submit" isLoading={isLoading}>
                            <Save className="w-4 h-4" />
                            Simpan Form
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
