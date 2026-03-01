export function LoadingPage({title}: { title: string }) {
    return (
        <div className="fixed z-50 flex inset-0 items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary-shadow border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold text-primary">
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