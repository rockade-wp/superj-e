import React from "react";
import { Sidebar } from "./Sidebar";
// Simple local Header component to avoid missing module error
function Header() {
    return (
        <header className="fixed top-0 left-64 right-0 h-20 bg-white border-b border-gray-200 flex items-center px-6">
            <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
    );
}

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <main className="pt-20 p-6">{children}</main>
            </div>
        </div>
    );
}
