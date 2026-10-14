import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";


export interface ListItemProps {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    content?: React.ReactNode;
    text: string;
}

interface ListProps {
    data: ListItemProps[];
}

export default function ListData({ data }: ListProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number, item: ListItemProps) => {
        if (item.onClick) {
            item.onClick();
        }

        if (item.content) {
            setOpenIndex(openIndex === index ? null : index);
        }
    };

    return (
        <ul className="bg-white border-2 border-gray-200 rounded-xl">
            {data.map((item, index, array) => (
                <li key={item.label}>
                    <button
                        onClick={() => handleToggle(index, item)}
                        className={`w-full flex p-4 sm:px-5 md:px-6 lg:px-7 md:py-5 cursor-pointer hover:bg-gray-50 justify-between items-center ${array.length - 1 === index ? '' : 'border-b-2 border-gray-200'}`}
                    >
                        <div className="flex items-center w-full gap-3">
                            <div className="bg-gray-200 rounded-xl p-2 text-lg md:text-xl text-custom-black">{item.icon}</div>
                            <div className="flex flex-col text-left items-start">
                                <p className="text-custom-black text-sm md:text-base font-medium">{item.label}</p>
                                <p className="text-xs text-gray-500">{item.text}</p>
                            </div>
                        </div>
                        {item.content && (
                            <span className="text-xs text-gray-400">
                                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        )}
                    </button>

                    {item.content && openIndex === index && (
                        <div className="border-b-2 p-4 sm:px-5 md:px-6 lg:px-7 md:py-5 border-gray-200 animate-fade-in">
                            {item.content}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}