import { BiCommentDetail } from "react-icons/bi";

export function Observations() {
    return (
        <div className="w-full bg-white border border-gray-100 rounded-xl py-10 lg:py-16 px-3 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-primary-shadow text-primary-darker rounded-xl flex items-center justify-center mb-5">
                <BiCommentDetail className="size-8"/>
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3">
                Observaciones del equipo docente
            </h3>
            <p className="text-gray-500 text-sm md:text-base max-w-[460px] leading-relaxed">
                Aquí aparecerán los comentarios, reconocimientos y recomendaciones que los docentes compartan sobre el proceso del estudiante.
            </p>
        </div>
    )
}