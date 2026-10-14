import { Skeleton } from "../../../../components/ui/Loadings.tsx";

interface MetricButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    value: React.ReactNode;
    title: string;
    subtitle: string;
    skeletonTitleSize: string;
    skeletonDescriptionSize: string;
    loading: boolean;
}

export function MetricButton({
                          active, onClick, loading, icon, value, title, subtitle, skeletonTitleSize, skeletonDescriptionSize
                      }: MetricButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`border flex gap-5 items-start rounded-xl p-2 transition-colors ${
                active
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent border-gray-200 text-custom-black"
            }`}
        >
            <span className={`text-2xl ${active ? "text-white" : "text-primary-darker"}`}>
                {icon}
            </span>
            <div className="flex flex-col gap-1 items-end">
                {loading ? (
                    <Skeleton className={skeletonTitleSize} />
                ) : (
                    <span className="text-2xl font-semibold">{value}</span>
                )}
                <div className="items-end flex flex-col justify-center">
                    <p className={`text-sm font-medium ${loading ? "mb-1" : "leading-5"}`}>{title}</p>
                    {loading ? (
                        <Skeleton className={skeletonDescriptionSize} />
                    ) : (
                        <span className={`text-xs leading-none ${active ? "text-white" : "text-gray-500"}`}>{subtitle}</span>
                    )}
                </div>
            </div>
        </button>
    );
}