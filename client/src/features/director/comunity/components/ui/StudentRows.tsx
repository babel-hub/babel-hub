import { memo } from "react";
import { reverseName } from "../../../../../types";
import type { StudentProps } from "../../types";
import { formatFullDateString } from "../../../../utils/utils.ts";
import {useNavigate} from "react-router-dom";

interface StudentRowProps {
    student: StudentProps;
}

export const StudentsRows = memo(function ({ student }: StudentRowProps){
    const navigate = useNavigate()

    const formattedName = reverseName({
        firstName: student.student_first_name,
        middleName: student.student_middle_name,
        firstLastName: student.student_first_last_name,
        secondLastName: student.student_second_last_name
    });

    return (
        <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 uppercase rounded-full bg-primary-shadow flex items-center justify-center text-primary-darker font-bold text-sm">
                        {`${student.student_first_name.charAt(0)}${student.student_first_last_name.charAt(0)}`}
                    </div>
                    <button
                        onClick={() => navigate(`${student.student_id}`)}
                        className="overflow-hidden text-sm xl:text-base text-left cursor-pointer group"
                    >
                        <p className="font-bold capitalize text-custom-black truncate group-hover:text-primary transition-colors" title={formattedName}>
                            {formattedName}
                        </p>
                        <p className="text-gray-500 text-xs truncate" title={student.email}>
                            {student.email}
                        </p>
                    </button>
                </div>
            </td>

            <td className="p-4">
                {student.enrollment_code ? (
                    <span className="bg-green-100 uppercase text-green-700 font-semibold px-2 py-1 rounded text-xs">
                        {student.enrollment_code}
                    </span>
                ) : (
                    <span className="bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded text-xs">
                        Pendiente
                    </span>
                )}
            </td>

            <td className="p-4 font-medium text-sm xl:text-base text-gray-700">
                {student.course_name}
            </td>

            <td className="p-4 text-gray-500 text-sm">
                {formatFullDateString(student.created_at)}
            </td>
        </tr>
    );
});