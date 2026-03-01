import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";


export interface ListItemProps {
    label: string;
    onClick?: () => void;
    content?: React.ReactNode;
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
        <ul className="space-y-3">
            {data.map((item, index) => (
                <li key={item.label}>
                    <button
                        onClick={() => handleToggle(index, item)}
                        className="bg-primary-shadow hover:text-primary-darker transition-colors text-sm sm:text-base cursor-pointer rounded-xl text-primary font-medium w-full p-5 flex justify-between items-center"
                    >
                        <span>{item.label}</span>
                        {item.content && (
                            <span className="text-xs">
                                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                            </span>
                        )}
                    </button>

                    {item.content && openIndex === index && (
                        <div className="bg-primary-shadow -mt-2 rounded-b-xl pt-4 p-4 animate-fade-in">
                            {item.content}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}