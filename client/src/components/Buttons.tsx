interface CancelButtonProps {
    title: string;
    full?: boolean;
    onClick?: () => void;
}

export const CancelButton = ({ title, onClick, full }: CancelButtonProps) => {
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

interface PrimaryButtonProps {
    title: string;
    full?: boolean;
    onClick?: () => void;
    form?: string;
    type?: "submit" | "reset" | "button" | undefined;
}

export const PrimaryButton = ({ title, onClick, full, type, form }: PrimaryButtonProps) => {
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

interface ButtonProps {
    onClick?: () => void;
    disabled?: boolean;
}

export function DeleteButton({ onClick, disabled }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
            Eliminar
        </button>
    );
}

export function EditButton({ onClick, disabled }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
        >
            Editar
        </button>
    );
}