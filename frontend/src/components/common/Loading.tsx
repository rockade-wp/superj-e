// ==================== src/components/common/Loading.tsx ====================
import { Loader2 } from "lucide-react";

interface LoadingProps {
    text?: string;
}

export function Loading({ text = "Memuat..." }: LoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
            <p className="text-gray-600">{text}</p>
        </div>
    );
}
