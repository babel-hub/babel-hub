export function LoadingPage({title}: { title: string }) {
    return (
        <div className="fixed z-50 flex inset-0 items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary-shadow border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-base md:text-lg font-semibold text-primary">
                    {title}
                </p>
            </div>
        </div>
    );
}

interface LoadingProps {
    title: string;
}

export function LoadingContent({ title } : LoadingProps) {
    return (
        <div className="w-full max-h-screen h-full flex items-center justify-center">
            <div className="flex flex-col gap-3 justify-center items-center">
                <div className="w-10 h-10 border-4 border-primary-shadow border-t-primary rounded-full animate-spin"></div>
                <p className="text-base md:text-lg font-semibold text-primary">
                    {title}
                </p>
            </div>
        </div>
    )
}

export function MiniSpinner() {
    return (
        <div className="flex items-center border border-gray-100 rounded-lg bg-gray-50 justify-center gap-2 py-4 w-full">
            <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="10" cy="10" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
}