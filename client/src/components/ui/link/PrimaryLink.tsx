import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface PrimaryLinkProps {
    goTo: string;
    children: ReactNode;
}

export function PrimaryLink({ goTo, children }: PrimaryLinkProps) {
    return (
        <Link
            to={goTo}
            className="bg-primary text-sm xl:text-base text-white md:px-3 lg:px-5 py-2 rounded-xl hover:bg-primary-darker font-semibold transition-colors w-full shadow-sm inline-block text-center"
        >
            {children}
        </Link>
    );
}
