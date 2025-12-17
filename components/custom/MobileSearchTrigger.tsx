import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSearchTriggerProps {
    onClick: () => void;
}

export const MobileSearchTrigger: React.FC<MobileSearchTriggerProps> = ({
    onClick,
}) => {
    return (
        <Button
            variant="outline"
            className="w-full rounded-full flex items-center justify-start px-4 py-6 shadow-sm border-gray-200 bg-white"
            onClick={onClick}
        >
            <Search className="h-5 w-5 mr-3 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
                Empeza tu busqueda
            </span>
        </Button>
    );
};
