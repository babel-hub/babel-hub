const MESSAGES = {
    bajo: [
        "Incumplimiento de los criterios de evaluación.",
        "Incumplimiento de los compromisos académicos establecidos.",
        "No alcanza los criterios de evaluación establecidos para la actividad.",
        "Presenta dificultades en el alcance de los logros y niveles de desempeño esperados.",
        "Incumple los criterios de evaluación establecidos para el proceso evaluativo.",
        "Requiere fortalecer el alcance de los logros y la aplicación de los aprendizajes en situaciones concretas."
    ],
    basico: [
        "Alcanza los logros y niveles de desempeño, reconociendo nociones y conceptos fundamentales.",
        "Reconoce los conceptos trabajados, aunque presenta dificultades para aplicarlos en situaciones concretas.",
        "Alcanza los desempeños básicos y requiere fortalecer la aplicación de los conceptos en diferentes situaciones."
    ],
    alto: [
        "Alcanza los logros y niveles de desempeño, demostrando dominio de nociones y conceptos.",
        "Aplica adecuadamente las nociones y conceptos trabajados en situaciones concretas.",
        "Demuestra un desempeño destacado en la comprensión y aplicación de los aprendizajes."
    ],
    superior: [
        "Alcanza los logros y niveles de desempeño, demostrando dominio de los conceptos y su aplicación.",
        "Aplica y transfiere los aprendizajes de manera efectiva en diferentes situaciones.",
        "Demuestra dominio sobresaliente de los aprendizajes y capacidad para aplicarlos en diferentes contextos."
    ]
};

export function suggestedComment(value: number, min: number, max: number, passing: number): string {
    if (max <= min || passing <= min) return "";

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    if (value < passing) {
        return getRandom(MESSAGES.bajo);
    }

    const passRatio = (value - passing) / (max - passing);

    if (passRatio < 0.33) {
        return getRandom(MESSAGES.basico);
    }

    if (passRatio < 0.66) {
        return getRandom(MESSAGES.alto);
    }

    return getRandom(MESSAGES.superior);
}