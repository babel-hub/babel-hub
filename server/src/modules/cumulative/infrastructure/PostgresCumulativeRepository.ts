import type { ICumulativeRepository } from "../domain/ICumulativeRepository.js";
import type {
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary,
    GetCumulativeRecordPayload
} from "../domain/Cumulative.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";

export class PostgresCumulativeRepository implements ICumulativeRepository {
    async getCumulativeGrades(payload: GetCumulativeRecordPayload, autUser: AuthUser): Promise<CumulativeGrades[]> {
        const { userSchoolId } = autUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH CourseStudents AS (
                    SELECT
                        s.id AS student_id,
                        p.first_name AS student_first_name,
                        p.middle_name AS student_middle_name,
                        p.first_last_name AS student_first_last_name,
                        p.second_last_name AS student_second_last_name
                    FROM student s
                        JOIN profile p ON s.profile_id = p.id
                    WHERE s.course_id = $1
                      AND p.school_id = $4
                      AND p.is_active = $3
                ),
                     CourseClasses AS (
                         SELECT
                             c.id AS class_id,
                             s.name AS subject_name,
                             gt.scale_id
                         FROM class c
                            JOIN subject s ON c.subject_id = s.id
                            JOIN grading_template gt ON s.grading_template_id = gt.id
                            JOIN course co ON c.course_id = co.id
                         WHERE c.course_id = $1
                           AND co.school_id = $4
                           AND c.is_active = $3
                     ),
                     AssessmentAverages AS (
                         SELECT
                             g.student_id,
                             a.class_id,
                             asmt.id AS assessment_id,
                             asmt.weight,
                             AVG(g.value) AS assessment_avg
                         FROM grade g
                            JOIN assignment a ON g.assignment_id = a.id
                            JOIN assessment_criteria asmt ON a.assessment_criteria_id = asmt.id
                         WHERE a.period_id = $2
                           AND a.class_id IN (SELECT class_id FROM CourseClasses)
                         GROUP BY g.student_id, a.class_id, asmt.id, asmt.weight
                     ),
                     SubjectFinalGrades AS (
                         SELECT
                             student_id,
                             class_id,
                             SUM(assessment_avg * (weight / 100.0)) AS final_grade
                         FROM AssessmentAverages
                         GROUP BY student_id, class_id
                     )
                SELECT
                    cs.student_id,
                    cs.student_first_name,
                    cs.student_first_last_name,
                    cs.student_second_last_name,
                    cs.student_middle_name,
                    ROUND(AVG(sfg.final_grade)::numeric, 2)::float AS period_average,
                    json_agg(
                            json_build_object(
                                    'class_id', cc.class_id,
                                    'scale_id', cc.scale_id,
                                    'subject_name', cc.subject_name,
                                    'final_grade', COALESCE(ROUND(sfg.final_grade::numeric, 2)::float, 0)
                            )
                                ORDER BY cc.subject_name
                    ) AS subjects
                FROM CourseStudents cs
                    CROSS JOIN CourseClasses cc
                    LEFT JOIN SubjectFinalGrades sfg ON sfg.student_id = cs.student_id
                        AND sfg.class_id = cc.class_id
                GROUP BY
                    cs.student_id,
                    cs.student_first_name,
                    cs.student_first_last_name,
                    cs.student_second_last_name,
                    cs.student_middle_name
                ORDER BY period_average DESC NULLS LAST;
            `;

            const result = await client.query(query, [payload.courseId, payload.periodId, payload.isActive, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getCumulativeSummary(payload: GetCumulativeRecordPayload, autUser: AuthUser): Promise<CumulativeSummary[]> {
        const { userSchoolId } = autUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH class_averages AS (
                    SELECT
                        g.student_id,
                        g.class_id,
                        ROUND(AVG(g.final_grade)::numeric, 2) AS period_average
                    FROM grades g
                    JOIN class c ON c.id = g.class_id
                    WHERE c.course_id = $1
                      AND g.period_id = $2
                    GROUP BY g.student_id, g.class_id
                ),
                attendance_totals AS (
                    SELECT
                        a.student_id,
                        COUNT(*) FILTER (WHERE a.status = 'present') AS present,
                        COUNT(*) FILTER (WHERE a.status = 'absent')  AS absent,
                        COUNT(*) FILTER (WHERE a.status = 'late')    AS late,
                        COUNT(*) FILTER (WHERE a.status = 'excused') AS excused
                    FROM attendance a
                    JOIN class c ON c.id = a.class_id
                    WHERE c.course_id = $1
                      AND a.period_id = $2
                    GROUP BY a.student_id
                )
                SELECT
                    s.id               AS student_id,
                    s.first_name       AS student_first_name,
                    s.middle_name      AS student_middle_name,
                    s.first_last_name  AS student_first_last_name,
                    s.second_last_name AS student_second_last_name,
                
                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'class_id',       c.id,
                                    'subject_name',   sub.name,
                                    'period_average', ca.period_average
                                )
                                ORDER BY sub.name
                            )
                            FROM class c
                            JOIN subject sub ON sub.id = c.subject_id
                            LEFT JOIN class_averages ca
                                   ON ca.class_id = c.id
                                  AND ca.student_id = s.id
                            WHERE c.course_id = $1
                        ),
                        '[]'::json
                    ) AS classes,
                
                    COALESCE(
                        (
                            SELECT json_build_object(
                                'present', at.present,
                                'absent',  at.absent,
                                'late',    at.late,
                                'excused', at.excused
                            )
                            FROM attendance_totals at
                            WHERE at.student_id = s.id
                        ),
                        json_build_object('present', 0, 'absent', 0, 'late', 0, 'excused', 0)
                    ) AS attendance
                
                FROM student s
                JOIN class c ON c.course_id = s.course_id
                WHERE s.course_id = $1
                GROUP BY s.id
                ORDER BY s.first_last_name, s.first_name;
            `

            const result = await client.query(query, [payload.courseId, payload.periodId, payload.isActive, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getCumulativeAttendance(payload: GetCumulativeRecordPayload, autUser: AuthUser): Promise<CumulativeAttendance[]> {
        const { userSchoolId } = autUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH PeriodInfo AS (
                    SELECT start_date, end_date 
                    FROM academic_period
                    WHERE id = $2 AND school_id = $4
                ),
                CourseStudents AS (
                    SELECT
                        s.id as student_id,
                        p.first_name as student_first_name,
                        p.middle_name as student_middle_name,
                        p.first_last_name as student_first_last_name,
                        p.second_last_name as student_second_last_name
                    FROM student s
                    JOIN profile p ON s.profile_id = p.id
                    WHERE s.course_id = $1 AND p.school_id = $4 AND p.is_active = $3
                )
                SELECT
                    cs.student_id,
                    cs.student_first_name,
                    cs.student_first_last_name,
                    cs.student_second_last_name,
                    cs.student_middle_name,
                    COUNT(a.id) FILTER (WHERE a.status = 'present')::int AS present,
                    COUNT(a.id) FILTER (WHERE a.status = 'absent')::int AS absent,
                    COUNT(a.id) FILTER (WHERE a.status = 'late')::int AS late,
                    COUNT(a.id) FILTER (WHERE a.status = 'excused')::int AS excused
                FROM CourseStudents cs
                CROSS JOIN PeriodInfo pi
                LEFT JOIN attendance a 
                    ON a.student_id = cs.student_id
                    AND a.date >= pi.start_date 
                    AND a.date <= pi.end_date
                GROUP BY
                    cs.student_id,
                    cs.student_first_name,
                    cs.student_first_last_name,
                    cs.student_second_last_name,
                    cs.student_middle_name
                ORDER BY cs.student_first_last_name ASC;
            `;

            const result = await client.query(query, [payload.courseId, payload.periodId, payload.isActive, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

}