function Loading({title}: { title: string }) {
    return (
        <div className="fixed z-50 flex inset-0 items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-primary-shadow border-t-primary-darker rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold text-primary-darker">
                    {title}
                </p>
            </div>
        </div>
    );
}

export default Loading;