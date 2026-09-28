import type { ICourseRepository } from "../domain/ICourseRepository.js";
import { pool } from "../../../db/index.js";
import { createAuditLog } from "../../../services/audit.service.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../errors/domain/CustomErrors.js";
import type {Course, CourseDetails, Courses, TeacherCourse} from "../domain/Course.types.js";

export class PostgresCourseRepository implements ICourseRepository {
    async getCourses(userSchoolId: string, isActive: boolean): Promise<Courses[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    c.id,
                    c.name as course_name,
                    c.created_at,
                    c.year,
                    c.is_active,
                    c.teacher_id as director_id,
                    p.first_name as director_first_name,
                    p.middle_name as director_middle_name,
                    p.first_last_name as director_first_last_name,
                    p.second_last_name as director_second_last_name,
                    COUNT(s.id)::int as student_count
                FROM course c
                JOIN teacher t ON c.teacher_id = t.id
                JOIN profile p ON t.profile_id = p.id
                LEFT JOIN student s ON c.id = s.course_id
                WHERE c.school_id = $1 AND c.is_active = $2
                GROUP BY
                    c.id,
                    c.name,
                    c.created_at,
                    c.year,
                    c.is_active,
                    c.teacher_id,
                    p.first_name,
                    p.middle_name,
                    p.first_last_name,
                    p.second_last_name
                ORDER BY c.name::integer ASC;
            `, [userSchoolId, isActive]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getCourseDetails(courseId: string, userSchoolId: string): Promise<Course | null> {
        const client = await pool.connect();
        try {
            const course = await client.query(`
                SELECT 
                    is_active,
                    id,
                    name AS course_name, 
                    year,
                    created_at 
                FROM course
                WHERE id = $1 AND school_id = $2
            `, [courseId, userSchoolId]);

            if (course.rowCount === 0) return null;

            return course.rows[0];
        } finally {
            client.release();
        }
    }

    async createCourse(courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const course = await client.query(`
                INSERT INTO course (school_id, name, year, teacher_id)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [userSchoolId, courseName, courseYear, courseTeacherId]);

            if (course.rowCount === 0) throw new UnauthorizedError("No se pudo crear el curso (verifica permisos o datos)");

            const courseId = course.rows[0].id;

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "CREATE_COURSE",
                schoolId: userSchoolId,
                metadata: {
                    courseId: courseId,
                    name: courseName
                }
            })

            await client.query('COMMIT');

            return courseId;
        } catch (error: any) {
            await client.query( 'ROLLBACK');

            if (error.code === '23505' && error.constraint === 'course_teacher_id_key') {
                throw new ConflictError("Este profesor ya dirige otro curso");
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async updateCourse(courseId: string, courseName: string, courseYear: string, courseTeacherId: string, userId: string, userRole: string, userSchoolId: string){
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(`
                UPDATE course
                SET name = $1, year = $2, teacher_id = $3
                WHERE id = $4 AND school_id = $5
                RETURNING id, name
            `, [courseName, courseYear, courseTeacherId, courseId, userSchoolId]);

            if (result.rowCount === 0) throw new NotFoundError("curso no se encontro o sin permisos");

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "UPDATE_COURSE",
                schoolId: userSchoolId,
                metadata: {
                    courseId: courseId,
                    updatedFields: { courseName, courseYear, courseTeacherId }
                }
            });

            await client.query('COMMIT');

            return result.rows[0];
        } catch (error: any) {
            await client.query('ROLLBACK');

            if (error.code === '23505' && error.constraint === 'course_teacher_id_key') {
                throw new ConflictError("Este profesor ya dirige otro curso");
            }

            throw error;
        } finally {
            client.release();
        }
    }

    async deleteCourse(courseId: string, userId: string, userRole: string, userSchoolId: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const checkQuery = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM student WHERE course_id = $1) as student_count,
                    (SELECT COUNT(*) FROM class WHERE course_id = $1) as class_count
            `, [courseId]);

            const studentCount = parseInt(checkQuery.rows[0].student_count);
            const classCount = parseInt(checkQuery.rows[0].class_count);

            if (studentCount > 0 || classCount > 0) throw new ConflictError("No se puede eliminar el curso porque tiene alumnos o clases asignadas");

            const result = await client.query(`
                DELETE FROM course
                WHERE id = $1 AND school_id = $2
                RETURNING id, name
            `, [courseId, userSchoolId]);

            if (result.rowCount === 0) {
                throw new NotFoundError("El curso no existe");
            }

            await createAuditLog(client, {
                actorUserId: userId,
                actorRole: userRole,
                action: "DELETE_COURSE",
                schoolId: userSchoolId,
                metadata: {
                    courseId: courseId,
                    courseName: result.rows[0].name
                }
            });

            await client.query('COMMIT');

            return;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getTeacherCourse(userId: string, userSchoolId: string): Promise<TeacherCourse> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT
                    c.id,
                    c.name,
                    COUNT(s.id)::int as total_students
                FROM course c
                JOIN teacher t ON c.teacher_id = t.id
                LEFT JOIN student s ON s.course_id = c.id
                WHERE t.profile_id = $1 AND c.school_id = $2
                GROUP BY c.id, c.name;
            `, [userId, userSchoolId]);

            return result.rows[0];
        } finally {
            client.release();
        }
    }
}