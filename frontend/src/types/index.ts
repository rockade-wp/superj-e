// User & Auth Types
export type Role =
    | "ADMIN"
    | "OPERATOR"
    | "PPK"
    | "PPTK"
    | "PENGURUS_BARANG"
    | "PPK_KEUANGAN"
    | "PA";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    nip: string;
    createdAt: string;
    updatedAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: Role;
    nip: string;
}

// SPJ Types
export interface FormItem {
    nama: string;
    volume: number;
    satuan: string;
    harga: number;
    total: number;
}

export interface SpjForm {
    id: string;
    spjId: string;
    formType: number;
    data: any;
    status: string;
    notes?: string;
    physicalSignatureScanUrl?: string;
    physicalSignatureFileType?: "pdf" | "excel";
    signatures?: SignatureLog[];
}

export interface SignatureLog {
    id: string;
    formId: string;
    signerId: string;
    signer: User;
    signedAt: string;
    tteMetadata?: string;
}

export interface SpjSubmission {
    id: string;
    rupId: string;
    year: number;
    activityName: string;
    activity: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    operatorId: string;
    operator?: User;
    forms?: SpjForm[];
    verification?: VerificationSheet;
}

export interface VerificationSheet {
    id: string;
    spjId: string;
    validatorId?: string;
    validator?: User;
    verifierId?: string;
    verifier?: User;
    status: string;
    notes?: string;
    finalNotes?: string;
    signedAt?: string;
}

export interface ActivityLog {
    id: string;
    spjId: string;
    userId: string;
    action: string;
    timestamp: string;
    user: User;
    spj: SpjSubmission;
}

// Form Data Types
export interface CreateSpjRequest {
    rupId: string;
    year: number;
    activityName: string;
    activity: string;
}

export interface UpdateFormRequest {
    [key: string]: any;
}

export interface UploadScanRequest {
    scan: File;
    fileType: "pdf" | "excel";
}

export interface SignFormRequest {
    notes?: string;
}

export interface VerifyRequest {
    isValid: boolean;
    notes?: string;
}

export interface FinalizeRequest {
    isFinalValid: boolean;
    notes?: string;
}

// API Response Types
export interface ApiError {
    error: string;
}

export interface ApiSuccess {
    message: string;
}

// Form Status Badge Types
export type FormStatus =
    | "draft"
    | "filled"
    | "physical_signed"
    | "signed"
    | "rejected";

export type SpjStatus = "draft" | "verified" | "completed" | "rejected";

// Dashboard Statistics
export interface DashboardStats {
    totalSpj: number;
    draftSpj: number;
    verifiedSpj: number;
    completedSpj: number;
    rejectedSpj: number;
    pendingSignatures?: number;
}

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
