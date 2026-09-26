import {GoAlert} from "react-icons/go";

export function Error({ title }: { title: string }) {
    return (
        <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <GoAlert className="size-4 shrink-0" /> {title}
        </div>
    )
}