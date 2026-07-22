"use client";

import { useState } from "react";
import { Spinner } from "@heroui/react";
import { CheckCircle2, ChevronDown, XCircle } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useStudentTestsForStudent } from "@/features/student-tests/hooks/use-student-tests-for-student";

interface TeacherTestAttemptsProps {
  studentId: string;
  protectedAreaId: string;
}

/** Panel del docente: intentos de examen de un estudiante, expandibles para
 * ver, pregunta por pregunta, qué respondió contra la respuesta correcta. */
export function TeacherTestAttempts({
  studentId,
  protectedAreaId,
}: TeacherTestAttemptsProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useStudentTestsForStudent(
    studentId,
    protectedAreaId,
    { limit: 20, sort: "createdAt:desc" },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <p className="py-3 text-sm text-muted">
        {en ? "No test attempts yet." : "Todavía no hay intentos de examen."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((attempt) => {
        const isExpanded = expandedId === attempt.id;

        return (
          <li
            key={attempt.id}
            className="rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="text-sm text-foreground">
                {en ? "Attempt" : "Intento"} {attempt.attempt}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    attempt.passed
                      ? "bg-success-soft text-success-soft-foreground"
                      : "bg-danger-soft text-danger-soft-foreground"
                  }`}
                >
                  {attempt.score}/{attempt.passingScore}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>
            {isExpanded && (
              <ul className="flex flex-col gap-2 border-t border-border px-4 py-3">
                {attempt.answers.map((answer) => (
                  <li
                    key={answer.questionId}
                    className={`rounded-lg border p-3 text-sm ${
                      answer.isCorrect
                        ? "border-success/30 bg-success-soft/20"
                        : "border-danger/30 bg-danger-soft/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {answer.question}
                      </p>
                      {answer.isCorrect ? (
                        <CheckCircle2
                          className="h-4 w-4 shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="h-4 w-4 shrink-0 text-danger"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {en ? "Answered" : "Respondió"}:{" "}
                      <span className="text-foreground">
                        {answer.studentAnswer}
                      </span>
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-xs text-muted">
                        {en ? "Correct answer" : "Respuesta correcta"}:{" "}
                        <span className="text-foreground">
                          {answer.correctAnswer}
                        </span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
