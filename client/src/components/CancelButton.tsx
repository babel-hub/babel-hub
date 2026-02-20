interface ButtonProps {
    title: string;
    full?: boolean;
    onClick?: () => void;
}

const CancelButton = ({ title, onClick, full }: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`bg-red-shadow text-sm md:text-base hover:bg-red-error text-red-error hover:text-white px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer
                        ${full ? "w-full" : "w-full md:w-auto"}
            `}
        >
            {title}
        </button>
    )
}

export default CancelButton;