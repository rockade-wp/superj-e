// ==================== src/components/common/Button.tsx ====================
import React from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = "primary",
    isLoading = false,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseClass =
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
        danger: "bg-red-600 hover:bg-red-700 text-white",
    };

    return (
        <button
            className={cn(
                baseClass,
                variantClasses[variant],
                "px-4 py-2",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
