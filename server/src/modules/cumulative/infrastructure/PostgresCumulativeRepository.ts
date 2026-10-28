import type { ICumulativeRepository } from "../domain/ICumulativeRepository.js";
import type {
    CoursePeriodTrend,
    CumulativeAttendance,
    CumulativeGrades,
    CumulativeSummary, GetCourseTrendPayload,
    GetCumulativeRecordPayload, ReportCard, ReportStudentRow, StudentAcademicReportRow
} from "../domain/Cumulative.types.js";
import type { AuthUser } from "../../shared/domain/Shared.types.js";
import { pool } from "../../../db/index.js";

export class PostgresCumulativeRepository implements ICumulativeRepository {
    async getStudentReportCardData(studentId: string, authUser: AuthUser): Promise<StudentAcademicReportRow[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH AssessmentAverage AS (
                    SELECT
                        g.student_id,
                        a.class_id,
                        a.period_id,
                        asmt.id AS assessment_id,
                        asmt.weight,
                        AVG(g.value) AS assessment_avg
                    FROM grade g
                        JOIN assignment a ON g.assignment_id = a.id
                        JOIN assessment_criteria asmt ON a.assessment_criteria_id = asmt.id
                    WHERE g.student_id = $1
                    GROUP BY g.student_id, a.class_id, a.period_id, asmt.id, asmt.weight
                ),
                     FinalGrade AS (
                         SELECT
                             student_id,
                             class_id,
                             period_id,
                             SUM(assessment_avg * (weight / 100.0)) AS final_grade
                         FROM AssessmentAverage
                         GROUP BY student_id, class_id, period_id
                     )
                SELECT
                    a.id AS area_id,
                    a.name AS area_name,
                    sub.id AS subject_id,
                    sub.name AS subject_name,
                    p.id AS period_id,
                    p.name AS period_name,
                    p.start_date AS period_start,
                    COALESCE(ROUND(fg.final_grade::numeric, 2)::float, 0) AS period_average,
                    COALESCE((
                        SELECT COUNT(*)
                        FROM attendance att
                            JOIN class c_att ON att.class_id = c_att.id
                        WHERE att.student_id = s.id
                            AND c_att.subject_id = sub.id
                            AND att.date >= p.start_date
                            AND att.date <= p.end_date
                            AND att.status = 'absent'
                        ), 0
                    )::int AS absences
                FROM student s
                    JOIN profile prof ON s.profile_id = prof.id
                    JOIN course c ON s.course_id = c.id
                    JOIN class cl ON c.id = cl.course_id
                    JOIN subject sub ON cl.subject_id = sub.id
                    JOIN area a ON sub.area_id = a.id
                    JOIN academic_period p ON p.school_id = prof.school_id
                    LEFT JOIN FinalGrade fg ON fg.student_id = s.id AND fg.class_id = cl.id AND fg.period_id = p.id
                WHERE s.id = $1 AND prof.school_id = $2
                ORDER BY a.name, sub.name, p.start_date;
            `;

            const result = await client.query(query, [studentId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getStudentInfo(studentId: string, authUser: AuthUser): Promise<any> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH StudentInfo AS (
                    SELECT
                        s.id AS student_id,
                        s.enrollment_code,
                        p.first_name,
                        p.middle_name,
                        p.first_last_name,
                        p.second_last_name,
                        c.id AS course_id,
                        c.name AS course_name,
                        p.school_id
                    FROM student s
                    JOIN profile p ON s.profile_id = p.id
                    JOIN course c ON s.course_id = c.id
                    WHERE s.id = $1 AND p.school_id = $2
                ),
                CourseAverages AS (
                    SELECT
                        st.id AS student_id,
                        AVG(g.value) AS avg_grade
                    FROM student st
                    JOIN class cl ON st.course_id = cl.course_id
                    JOIN assignment asg ON cl.id = asg.class_id
                    JOIN grade g ON asg.id = g.assignment_id AND g.student_id = st.id
                    WHERE st.course_id = (SELECT course_id FROM StudentInfo)
                    GROUP BY st.id
                )
                SELECT
                    si.*,
                    sch.name AS school_name,
                    sch.code AS school_code,
                    sch.logo_url AS school_logo_url,
                    EXTRACT(YEAR FROM CURRENT_DATE)::text AS school_year, (
                        SELECT CONCAT_WS(' ', pr.first_last_name, pr.second_last_name, pr.first_name, pr.middle_name)
                        FROM course c
                            JOIN teacher t ON c.teacher_id = t.id
                            JOIN profile pr ON t.profile_id = pr.id
                        WHERE c.id = si.course_id
                    ) AS director_name,
                    COALESCE((SELECT avg_grade FROM CourseAverages WHERE student_id = si.student_id), 0)::float AS student_average,
                    COALESCE((SELECT AVG(avg_grade) FROM CourseAverages), 0)::float AS course_average,
                    (
                        SELECT COUNT(*) + 1
                        FROM CourseAverages ca1
                        WHERE ca1.avg_grade > (SELECT avg_grade FROM CourseAverages ca2 WHERE ca2.student_id = si.student_id)
                    )::int AS rank,
                    (
                        SELECT
                            json_agg(
                                    json_build_object(
                                        'id', ap.id, 
                                        'name', ap.name, 
                                        'order', EXTRACT(EPOCH FROM ap.start_date)
                                    ) ORDER BY ap.start_date
                            )
                        FROM academic_period ap
                        WHERE ap.school_id = si.school_id
                    ) AS periods
                FROM StudentInfo si
                JOIN school sch ON si.school_id = sch.id;
            `;

            const result = await client.query(query, [studentId, userSchoolId]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async getStudentsForReports(courseId: string, authUser: AuthUser): Promise<ReportStudentRow[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                SELECT
                    s.id AS student_id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name,
                    s.enrollment_code,
                    c.name AS course_name
                FROM student s
                JOIN profile p ON s.profile_id = p.id
                JOIN course c ON s.course_id = c.id
                WHERE s.course_id = $1
                  AND p.school_id = $2
                  AND p.is_active = true
                ORDER BY p.first_last_name ASC, p.first_name ASC;
            `;

            const result = await client.query(query, [courseId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getCoursePeriodTrend(payload: GetCourseTrendPayload, authUser: AuthUser): Promise<CoursePeriodTrend[]> {
        const { userSchoolId } = authUser;
        const client = await pool.connect();

        try {
            const query = `
                WITH CourseStudents AS (
                    SELECT s.id AS student_id
                    FROM student s
                        JOIN profile p ON s.profile_id = p.id
                    WHERE s.course_id = $1
                      AND p.school_id = $3
                      AND p.is_active = true
                ),
                     CourseClasses AS (
                         SELECT c.id AS class_id
                         FROM class c
                            JOIN course co ON c.course_id = co.id
                         WHERE c.course_id = $1
                           AND co.school_id = $3
                           AND c.is_active = true
                     ),
                     PeriodsInScope AS (
                         SELECT p.id, p.name, p.start_date
                         FROM academic_period p
                         WHERE p.school_id = $3
                           AND p.start_date <= (
                             SELECT end_date FROM academic_period WHERE id = $2 AND school_id = $3
                         )
                     ),
                     AssessmentAverages AS (
                         SELECT
                             a.period_id,
                             g.student_id,
                             a.class_id,
                             asmt.id AS assessment_id,
                             asmt.weight,
                             AVG(g.value) AS assessment_avg
                         FROM grade g
                            JOIN assignment a ON g.assignment_id = a.id
                            JOIN assessment_criteria asmt ON a.assessment_criteria_id = asmt.id
                         WHERE a.class_id IN (SELECT class_id FROM CourseClasses)
                           AND a.period_id IN (SELECT id FROM PeriodsInScope)
                           AND g.student_id IN (SELECT student_id FROM CourseStudents)
                         GROUP BY a.period_id, g.student_id, a.class_id, asmt.id, asmt.weight
                     ),
                     SubjectFinalGrades AS (
                         SELECT
                             period_id,
                             student_id,
                             class_id,
                             SUM(assessment_avg * (weight / 100.0)) AS final_grade
                         FROM AssessmentAverages
                         GROUP BY period_id, student_id, class_id
                     ),
                     StudentPeriodAverages AS (
                         SELECT
                             period_id,
                             student_id,
                             AVG(final_grade) AS student_average
                         FROM SubjectFinalGrades
                         GROUP BY period_id, student_id
                     ),
                     StudentPeriodMatrix AS (
                         SELECT
                             cs.student_id,
                             p.id AS period_id
                         FROM CourseStudents cs
                            CROSS JOIN PeriodsInScope p
                     ),
                     StudentPeriodAveragesWithZeros AS (
                         SELECT
                             m.period_id,
                             m.student_id,
                             COALESCE(spa.student_average, 0) AS student_average,
                             spa.student_average IS NOT NULL AS has_grade
                         FROM StudentPeriodMatrix m
                            LEFT JOIN StudentPeriodAverages spa
                                ON m.student_id = spa.student_id
                                AND m.period_id = spa.period_id
                     )
                SELECT
                    p.id AS period_id,
                    p.name AS period_name,
                    p.start_date AS period_start,
                    ROUND(AVG(spaz.student_average)::numeric, 2)::float AS course_average,
                    COUNT(spaz.student_id) FILTER (WHERE spaz.has_grade)::int AS graded_students
                FROM PeriodsInScope p
                         LEFT JOIN StudentPeriodAveragesWithZeros spaz ON spaz.period_id = p.id
                GROUP BY p.id, p.name, p.start_date
                ORDER BY p.start_date;
            `;

            const result = await client.query(query, [payload.courseId, payload.currentPeriodId, userSchoolId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

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
                    COALESCE(ROUND(AVG(sfg.final_grade)::numeric, 2)::float, 0) AS period_average,
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