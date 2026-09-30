import type { ICourseBreakRepository } from "../domain/ICourseBreakRepository.js";

export class CourseBreakService {
    constructor( private readonly courseBreakRepository: ICourseBreakRepository ) {}
}