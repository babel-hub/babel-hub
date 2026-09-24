import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HiDotsVertical } from "react-icons/hi";

export interface MenuOption {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    isDanger?: boolean;
    disabled?: boolean;
    isSeparator?: boolean;
}

interface ActionMenuProps {
    options: MenuOption[];
    customIcon?: ReactNode;
}

export function ActionMenu({ options, customIcon }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, position: "bottom" });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            const estimatedMenuHeight = options.length * 36 + 16;
            const position = spaceBelow < estimatedMenuHeight ? "top" : "bottom";

            setCoords({
                top: position === "bottom" ? rect.bottom + window.scrollY + 4 : rect.top + window.scrollY - 4,
                left: rect.right + window.scrollX,
                position
            });
        }
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => setIsOpen(false);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const menuContent = isOpen ? (
        <div
            ref={menuRef}
            style={{
                position: 'absolute',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                transform: coords.position === "top" ? "translate(-100%, -100%)" : "translateX(-100%)",
            }}
            className="action-menu-portal z-50 w-36 overflow-hidden p-1 rounded-xl border border-gray-200 bg-white text-left shadow-lg"
        >
            {options.map((opt, idx) => {
                if (opt.isSeparator) {
                    return <hr key={`sep-${idx}`} className="border-gray-100 my-1 mx-2" />;
                }

                return (
                    <button
                        key={`btn-${idx}`}
                        disabled={opt.disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            opt.onClick?.();
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm transition-colors ${
                            opt.disabled ? "opacity-50 cursor-not-allowed" :
                                opt.isDanger ? "text-red-600 hover:bg-red-50 cursor-pointer" : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                        }`}
                    >
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span>{opt.label}</span>
                    </button>
                );
            })}
        </div>
    ) : null;

    return (
        <div className="flex justify-end items-center">
            <button
                ref={buttonRef}
                onClick={openMenu}
                className={`rounded p-1 text-custom-black transition-colors cursor-pointer`}
            >
                {customIcon || <HiDotsVertical className="size-4" />}
            </button>

            {isOpen && createPortal(menuContent, document.body)}
        </div>
    );
}