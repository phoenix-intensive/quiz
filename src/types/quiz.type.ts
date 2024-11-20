export type QuizType = {
    id: number;
    name: string;
    questions: QuizQuestionType[];
    test: {
        id: number;
        name: string;
        questions: QuizQuestionType[];
    };

};

export type QuizQuestionType = {
    id: number;
    question: string;
    answers: QuizAnswerType[];
};

export type QuizAnswerType = {
    id: number;
    answer: string;
    correct: boolean;
};
