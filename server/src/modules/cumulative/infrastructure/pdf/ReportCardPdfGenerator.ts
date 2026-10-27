import PdfPrinter from "pdfmake";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces.js";
import type { ReportCard, ReportCardSubject } from "../../domain/Cumulative.types.js";

// Standard fonts object for 0.2.x
const fonts = {
    Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
    },
};

export function generateReportCardPdf(report: ReportCard): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const printer = new PdfPrinter(fonts);

            const fmt = (n: number | string | null | undefined): string => {
                if (n === null || n === undefined || n === "") return "";
                const num = typeof n === "number" ? n : parseFloat(String(n));
                if (Number.isNaN(num)) return "";
                return num.toFixed(1).replace(".", ",");
            };

            // Helper function to format periods exactly like the LaTeX template
            const formatPeriodHeader = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('primer') || n.includes('1er') || n.includes('1ro')) return '1er\nPER';
                if (n.includes('segundo') || n.includes('2do')) return '2do\nPER';
                if (n.includes('tercer') || n.includes('3er') || n.includes('3ro')) return '3er\nPER';
                if (n.includes('cuarto') || n.includes('4to')) return '4to\nPER';
                return name.substring(0, 4).toUpperCase();
            };

            const body: TableCell[][] = [];

// 1. Build the SINGLE Header Row
            const headerRow: TableCell[] = [
                { text: "ÁREAS / ASIGNATURAS", bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle" },
                { text: "I.H.", bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle" },
            ];

            report.periods.forEach((p) => {
                headerRow.push({ text: formatPeriodHeader(p.name), bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle", fontSize: 7 });
                headerRow.push({ text: "REC", bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle" });
                headerRow.push({ text: "FALLAS", bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle", fontSize: 6 });
            });

            headerRow.push({ text: "FALLAS\nACUM.", bold: true, fillColor: "#D0D5DD", alignment: "center", verticalAlignment: "middle" });
            body.push(headerRow);

// 2. Build Data Rows
            report.areas.forEach((area) => {
                const totalCols = 2 + report.periods.length * 3 + 1;
                const areaRow: TableCell[] = [
                    { text: area.area_name.toUpperCase(), colSpan: totalCols, bold: true, fillColor: "#E2E8F0", alignment: "left" },
                ];
                for (let i = 1; i < totalCols; i++) areaRow.push({});
                body.push(areaRow);

                area.subjects.forEach((sub: ReportCardSubject) => {
                    const row: TableCell[] = [
                        { text: sub.subject_name, alignment: "left" },
                        { text: String(sub.weekly_hours || ""), alignment: "center" },
                    ];

                    report.periods.forEach((p) => {
                        const cell = sub.periods.find((sp) => sp.period_id === p.id);
                        row.push({ text: fmt(cell?.average ?? null), alignment: "center" }); // 1st Col: PER
                        row.push({ text: fmt(cell?.recovery ?? null), alignment: "center" }); // 2nd Col: REC
                        row.push({ text: cell ? String(cell.absences) : "", alignment: "center" }); // 3rd Col: FALLAS
                    });

                    row.push({ text: String(sub.total_absences), alignment: "center" });
                    body.push(row);
                });
            });

            const docDefinition: TDocumentDefinitions = {
                pageSize: "A4",
                pageOrientation: "portrait",
                pageMargins: [20, 20, 20, 20],
                defaultStyle: { font: "Helvetica", fontSize: 7 },

                content: [
                    // --- HEADER ---
                    {
                        columns: [
                            {
                                width: "*",
                                stack: [
                                    { text: (report.school_name || "COLEGIO").toUpperCase(), bold: true, fontSize: 9 },
                                    { text: "REGISTRO ESCOLAR DE VALORACIÓN", bold: true, fontSize: 9, margin: [0, 2, 0, 0] },
                                    {
                                        // Added fallback for null school_code
                                        text: `CÓDIGO: ${report.school_code || "—"}   GRADO: ${report.student.course_name}   AÑO: ${report.school_year || "—"}`,
                                        margin: [0, 8, 0, 0],
                                    },
                                    { text: `DIRECTOR DE GRUPO: ${(report.director_name || "—").toUpperCase()}`, margin: [0, 3, 0, 0] },
                                    { text: `ALUMNO: ${(report.student.first_last_name + ' ' + (report.student.second_last_name ?? '')).toUpperCase()} ${(report.student.first_name + ' ' + (report.student.middle_name ?? '')).toUpperCase()}` },
                                ],
                            },
                            {
                                width: 60,
                                text: "ESCUDO",
                                alignment: "center",
                                bold: true,
                                fontSize: 8,
                                margin: [0, 0, 0, 0],
                            },
                        ],
                        margin: [0, 0, 0, 10],
                    },

                    // --- MAIN TABLE ---
                    {
                        table: {
                            headerRows: 1, // Only 1 header row now
                            widths: [
                                "*",  // Areas
                                20,   // I.H.
                                // For each period: PER (25), REC (20), FALLAS (25)
                                ...report.periods.flatMap(() => [25, 20, 25]),
                                35,   // Fallas Acum
                            ],
                            body: body,
                        },
                        // This layout forces all borders to show (like Excel)
                        layout: {
                            hLineWidth: function () { return 0.5; },
                            vLineWidth: function () { return 0.5; },
                            hLineColor: function () { return '#475569'; },
                            vLineColor: function () { return '#475569'; },
                            paddingLeft: function () { return 2; },
                            paddingRight: function () { return 2; },
                            paddingTop: function () { return 1; },
                            paddingBottom: function () { return 1; }
                        },
                    },

                    // --- FOOTER: SCALE ---
                    {
                        text:
                            "DESEMPEÑO BAJO: 1,0 a 3,59    DESEMPEÑO BASICO: 3,60 a 3,99    " +
                            "DESEMPEÑO ALTO: 4,00 a 4,59    DESEMPEÑO SUPERIOR: 4,60 a 5,00",
                        fontSize: 6,
                        margin: [0, 8, 0, 0],
                    },

                    // --- FOOTER: SUMMARY ---
                    {
                        columns: [
                            { text: `Promedio General del Curso: ${fmt(report.course_average)}`, fontSize: 8, bold: true },
                            { text: `Promedio: ${fmt(report.student_average)}`, fontSize: 8, bold: true, alignment: "center" },
                            { text: `Puesto: ${report.rank ?? "—"}`, fontSize: 8, bold: true, alignment: "right" },
                        ],
                        margin: [0, 15, 0, 0],
                    },
                ],
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: Buffer[] = [];

            pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
            pdfDoc.on("error", reject);

            pdfDoc.end();
        } catch (error) {
            reject(error);
        }
    });
}