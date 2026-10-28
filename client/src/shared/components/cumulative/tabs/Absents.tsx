import {NoResults} from "../../../../components/ui/blocks/NoResults.tsx";

export function Absents() {
    return (
        <div className="px-4">
            <div className="mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-gray-800">Registro de Faltas</h2>
                <p className="text-sm text-gray-500">Identifica a los estudiantes con mayores faltas y visualizalos.</p>
            </div>

            <NoResults title="No hay faltas registradas"/>
        </div>
    )
}