import {FaChevronLeft} from "react-icons/fa";

interface Props {
    onClick?: () => void;
}

function ButtonChevronBack({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="cursor-pointer bg-transparent hover:bg-primary-shadow text-custom-black transition-colors hover:text-primary rounded-full p-2"
        >
            <FaChevronLeft />
        </button>
    );
}

export default ButtonChevronBack;