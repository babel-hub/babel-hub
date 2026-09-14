export const NoResults = ({ title }: { title: string }) => {
    return (
        <div className="w-full">
            <div className="px-3 py-10 sm:py-14 text-center lg:py-20 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">{title}</p>
            </div>
        </div>
    )
}