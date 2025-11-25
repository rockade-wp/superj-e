import api from "./api";
import type {
    SpjSubmission,
    CreateSpjRequest,
    UpdateFormRequest,
    SignFormRequest,
    VerifyRequest,
    FinalizeRequest,
    ActivityLog,
} from "../types";

export const spjService = {
    async createSpj(data: CreateSpjRequest): Promise<SpjSubmission> {
        const response = await api.post<SpjSubmission>("/spj", data);
        return response.data;
    },

    async getAllSpj(): Promise<SpjSubmission[]> {
        const response = await api.get<SpjSubmission[]>("/spj");
        return response.data;
    },

    async getSpjById(spjId: string): Promise<SpjSubmission> {
        const response = await api.get<SpjSubmission>(`/spj/${spjId}`);
        return response.data;
    },

    async updateForm(
        spjId: string,
        formType: number,
        data: UpdateFormRequest
    ): Promise<{ message: string }> {
        const response = await api.patch(
            `/spj/${spjId}/form/${formType}`,
            data
        );
        return response.data;
    },

    async downloadDraftForm(spjId: string, formType: number): Promise<Blob> {
        const response = await api.get(
            `/spj/${spjId}/form/${formType}/download-draft`,
            {
                responseType: "blob",
            }
        );
        return response.data;
    },

    async uploadPhysicalScan(
        spjId: string,
        formType: number,
        file: File,
        fileType: "pdf" | "excel"
    ): Promise<{ message: string; path: string }> {
        const formData = new FormData();
        formData.append("scan", file);
        formData.append("fileType", fileType);

        const response = await api.post(
            `/spj/${spjId}/form/${formType}/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    async signForm(
        spjId: string,
        formType: number,
        data?: SignFormRequest
    ): Promise<{ status: string; notes?: string }> {
        const response = await api.post(
            `/spj/${spjId}/form/${formType}/sign`,
            data || {}
        );
        return response.data;
    },

    async verifySpj(
        spjId: string,
        data: VerifyRequest
    ): Promise<{ status: string; notes?: string }> {
        const response = await api.post(`/spj/${spjId}/verify`, data);
        return response.data;
    },

    async finalizeSpj(
        spjId: string,
        data: FinalizeRequest
    ): Promise<{ status: string }> {
        const response = await api.post(`/spj/${spjId}/finalize`, data);
        return response.data;
    },

    async downloadCompletedSpj(spjId: string): Promise<Blob> {
        const response = await api.get(`/spj/${spjId}/download`, {
            responseType: "blob",
        });
        return response.data;
    },

    async getActivityLogs(): Promise<ActivityLog[]> {
        const response = await api.get<ActivityLog[]>("/spj/logs");
        return response.data;
    },
};
