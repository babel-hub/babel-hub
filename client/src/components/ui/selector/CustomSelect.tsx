import { useState, useRef, useEffect } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
}

export function CustomSelect({
                                 options,
                                 value,
                                 onChange,
                                 placeholder = "Seleccione una opción...",
                                 disabled = false,
                                 id
                             }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                id={id}
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100/50'
                }`}
            >
                <span className={`truncate capitalize ${!selectedOption ? 'text-gray-500' : 'text-custom-black font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>

                <div className={`transition-transform duration-300 ml-2 ${isOpen ? '-rotate-180' : ''}`}>
                    <HiChevronDown className="size-4 text-gray-500" />
                </div>
            </button>

            {isOpen && !disabled && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col max-h-60 overflow-y-auto space-y-1 custom-scrollbar p-1">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${
                                        isSelected ? 'bg-primary-shadow/50' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <span className={`capitalize text-sm ${
                                        isSelected ? 'text-primary font-bold' : 'text-custom-black font-medium group-hover:text-primary transition-colors'
                                    }`}>
                                        {opt.label}
                                    </span>
                                    {isSelected && <HiCheck className="size-4 text-primary shrink-0" />}
                                </button>
                            );
                        })}
                        {options.length === 0 && (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                No hay opciones disponibles
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}