import type { CumulativeService } from "../application/CumulativeService.js";
import type { AuthenticatedRequest } from "../../../middleware/auth.middleware.js";
import type { NextFunction, Response } from "express";
import { getAuthUser } from "../../shared/auth/getAuthUser.js";

import { generateReportCardPdf } from "./pdf/ReportCardPdfGenerator.js";

export class CumulativeControllers {
    constructor(
        private readonly cumulativeService: CumulativeService
    ) {}

    getCoursePeriodTrend = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const currentPeriodId = request.query.periodId as string;

            const trend = await this.cumulativeService.getCoursePeriodTrend(
                { courseId, currentPeriodId },
                auth
            );
            response.status(200).json({ trend });
        } catch (error) {
            next(error);
        }
    };

    getReportCardPdf = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const studentId = request.params.studentId as string;

            const reportCard = await this.cumulativeService.generateStudentReportCard(studentId, auth);

            const pdfBuffer = await generateReportCardPdf(reportCard);

            const fileName = `boletin-${reportCard.student.first_last_name}-${reportCard.student.first_name}.pdf`;
            response.setHeader("Content-Type", "application/pdf");
            response.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
            response.setHeader("Content-Length", pdfBuffer.length.toString());

            response.send(pdfBuffer);
        } catch (error) {
            next(error);
        }
    };

    getStudentsForReports = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const courseId = request.params.courseId as string;

            const students = await this.cumulativeService.getStudentsForReports(courseId, auth);
            response.status(200).json({ students });
        } catch (error) {
            next(error);
        }
    };

    getCumulativeGrades = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const periodId = request.query.periodId as string;
            const isActive = true;

            const grades = await this.cumulativeService.getCumulativeGrades({
                    isActive,
                    courseId,
                    periodId
                }, auth
            );
            response.status(200).json({ grades });
        } catch (error) {
            next(error);
        }
    }

    getCumulativeSummary = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const periodId = request.query.periodId as string;
            const isActive = true;

            const summary = await this.cumulativeService.getCumulativeSummary({
                    isActive,
                    courseId,
                    periodId
                }, auth
            );
            response.status(200).json({ summary });
        } catch (error) {
            next(error);
        }
    }

    getCumulativeAttendance = async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
        try {
            const auth = getAuthUser(request);
            const courseId = request.params.courseId as string;
            const periodId = request.query.periodId as string;
            const isActive = true;

            const attendance = await this.cumulativeService.getCumulativeAttendance({
                    isActive,
                    courseId,
                    periodId
                }, auth
            );
            response.status(200).json({ attendance });
        } catch (error) {
            next(error);
        }
    }
}