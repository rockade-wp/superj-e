// ==================== src/components/common/Badge.tsx ====================
import React from "react";
import { cn } from "../../utils/cn";
import { getStatusBadgeClass, getStatusLabel } from "../../utils/format";

interface BadgeProps {
    status: string;
    className?: string;
}

export function Badge({ status, className }: BadgeProps) {
    return (
        <span className={cn("badge", getStatusBadgeClass(status), className)}>
            {getStatusLabel(status)}
        </span>
    );
}
