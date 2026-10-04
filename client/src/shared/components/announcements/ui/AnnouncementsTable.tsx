import type {Announcement} from "../../../types/types.ts";
import {formatterDate} from "../../../../types";

interface AnnouncementsTableProps {
    announcements: Announcement[];
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: string) => void;
}

const typeColors: Record<string, string> = {
    GENERAL: "bg-blue-100 text-blue-700",
    EVENT: "bg-purple-100 text-purple-700",
    EMERGENCY: "bg-red-100 text-red-700",
    DEADLINE: "bg-orange-100 text-orange-700",
    POLL: "bg-teal-100 text-teal-700",
};

export function AnnouncementsTable({ announcements, onEdit, onDelete }: AnnouncementsTableProps) {
    if (!announcements || announcements.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                No hay comunicados registrados.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Dirigido A</th>
                    <th className="px-6 py-3">Autor</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {announcements.map((item) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {item.title}
                        </td>
                        <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeColors[item.type] || 'bg-gray-100 text-gray-700'}`}>
                                    {item.type}
                                </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                            {item.target_type}
                        </td>
                        <td className="px-6 py-4">
                            {item.author}
                        </td>
                        <td className="px-6 py-4">
                            {formatterDate.format(new Date(item.created_at))}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                            <button
                                onClick={() => onEdit(item)}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="text-red-600 hover:underline font-medium"
                            >
                                Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}