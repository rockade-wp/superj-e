// ==================== src/components/common/Card.tsx ====================
import React from "react";
import { cn } from "../../utils/cn";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function Card({ children, className, title }: CardProps) {
    return (
        <div className={cn("card", className)}>
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            {children}
        </div>
    );
}
