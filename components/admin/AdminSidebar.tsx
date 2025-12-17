"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    MessageSquare,
    Calendar,
    Home,
    PlusCircle,
    Image,
    Star,
    ChevronLeft,
    ChevronRight,
    LogOut,
    List,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    initialCollapsed: boolean;
}

export function AdminSidebar({ initialCollapsed }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    // We can keep the transition enabled state if we want to animate manual toggles
    // but avoid initial animation. However, since we are now server-rendering the correct width,
    // we might not need the complicated transition logic for "on load", only for toggles.
    // But to be safe and smooth, we can just use standard CSS transitions.
    // Since the initial HTML matches the state, there is no "jump".

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        // Update cookie
        document.cookie = `adminSidebarCollapsed=${newState}; path=/; max-age=31536000`;
    };

    const navItems = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/consultas", label: "Consultas", icon: MessageSquare },
        { href: "/admin/disponibilidad", label: "Disponibilidad", icon: Calendar },
        { href: "/admin/chalets", label: "Chalets", icon: Home },
        { href: "/admin/chalets/new", label: "Cargar Chalet", icon: PlusCircle },
        { href: "/admin/experiencias", label: "Experiencias", icon: Star },
        { href: "/admin/amenities", label: "Amenities", icon: List },
        { href: "/admin/galeria", label: "Galería", icon: Image, hidden: true },
        { href: "/admin/testimonials", label: "Testimonios", icon: MessageSquare },
    ];

    return (
        <aside
            className={cn(
                "bg-white dark:bg-gray-800 shadow-md flex flex-col transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex p-4 pl-5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="flex"
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <nav className="mt-2 px-2 space-y-2">
                    {navItems.map(
                        (item) =>
                            !item.hidden && (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors",
                                        isCollapsed ? "justify-center" : "justify-start"
                                    )}
                                    title={isCollapsed ? item.label : ""}
                                >
                                    <item.icon
                                        className={cn("h-5 w-5", isCollapsed ? "" : "mr-3")}
                                    />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </a>
                            )
                    )}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={cn("w-full", isCollapsed ? "px-0" : "")}
                    variant="outline"
                    title={isCollapsed ? "Cerrar Sesión" : ""}
                >
                    <LogOut className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                    {!isCollapsed && "Cerrar Sesión"}
                </Button>
            </div>
        </aside>
    );
}
