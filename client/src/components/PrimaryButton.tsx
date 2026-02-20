interface ButtonProps {
    title: string;
    full?: boolean;
    onClick?: () => void;
    form?: string;
    type?: "submit" | "reset" | "button" | undefined;
}

const PrimaryButton = ({ title, onClick, full, type, form }: ButtonProps) => {
    return (
        <button
            form={form}
            type={type}
            onClick={onClick}
            className={`bg-primary-shadow text-sm md:text-base hover:bg-primary text-primary-darker hover:text-white px-5 py-2 rounded-xl font-semibold transition-colors shadow-sm cursor-pointer
                        ${full ? "w-full" : "w-full md:w-auto"}
            `}
        >
            {title}
        </button>
    )
}

export default PrimaryButton;