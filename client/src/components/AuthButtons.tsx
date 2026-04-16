interface AuthButtonProps {
    title: string;
    disable?: boolean;
    type?: "submit" | "button" | "reset";
    onClick?: () => void;
}

export default function AuthButton ({ title, disable, type, onClick }: AuthButtonProps) {
    return (
        <button
            type={type}
            disabled={disable}
            onClick={onClick}
            className="bg-primary text-sm md:text-base hover:bg-primary-darker cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl focus:outline-none font-semibold text-white w-full py-2.5 h-[44px] flex items-center justify-center transition-colors shadow"
        >
            {disable ? (
                <div className="w-6 h-6 border-3 border-transparent border-t-white rounded-full animate-spin"></div>
            ) : (
                title
            )}
        </button>

    )
}