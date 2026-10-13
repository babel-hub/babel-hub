import React from "react";
import { ActionMenu, type MenuOption } from "../menu/ActionMenu.tsx";
import {Link} from "react-router-dom";

interface InteractiveHomeListProps {
    isActive: boolean;
    disabled?: boolean;
    avatarText: string;
    title: React.ReactNode;
    subtitle: React.ReactNode;
    goTo: string;
    menuOptions?: MenuOption[];
}

export function InteractiveHomeList({
                                        isActive,
                                        avatarText,
                                        title,
                                        goTo,
                                        subtitle,
                                        menuOptions
                                    }: InteractiveHomeListProps) {
    return (
        <div
            className={`w-full group px-2 xl:px-3 py-4 2xl:p-4 relative rounded-xl transition-colors flex items-center justify-between gap-2 2xl:gap-3 border ${
                isActive ? 'bg-primary-shadow border-primary-shadow' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
            }`}
        >
            <Link
                to={`${goTo}`}
                className="flex items-center cursor-pointer text-left gap-2 w-full"
            >
                <div className={`w-10 h-10 shrink-0 rounded-full flex uppercase items-center justify-center font-bold text-sm ${
                    isActive ? 'bg-primary text-white' : 'bg-primary-shadow text-primary'
                }`}>
                    {avatarText}
                </div>
                <div className="max-w-full lg:max-w-28 2xl:max-w-36 overflow-hidden">
                    <h3 className={`font-bold text-base truncate ${isActive ? 'text-primary-900' : 'text-custom-black'}`}>
                        {title}
                    </h3>
                    <p className="text-gray-500 capitalize text-xs truncate">
                        {subtitle}
                    </p>
                </div>
            </Link>

            {menuOptions && menuOptions.length > 0 && (
                <div className="shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <ActionMenu options={menuOptions} />
                </div>
            )}
        </div>
    );
}