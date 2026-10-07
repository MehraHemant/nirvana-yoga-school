"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminQuizAttempt } from "@/lib/quiz/attempts";
import { formatDurationMs } from "@/lib/quiz/format-duration";
import { scorePercent } from "@/lib/quiz/scoring";
import { parseApiJson } from "@/lib/types/api";

/**
 * Date and time for a quiz attempt.
 *
 * @param iso - ISO timestamp
 */
function formatAttemptDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/**
 * Admin list of recent quiz attempts with headline numbers.
 */
export default function QuizResultsAdminPage() {
  const [attempts, setAttempts] = useState<AdminQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/quiz/attempts")
      .then((res) => parseApiJson<{ attempts: AdminQuizAttempt[] }>(res))
      .then((body) => setAttempts(body.attempts ?? []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const percents = attempts.map((attempt) =>
    scorePercent(attempt.score, attempt.maxScore),
  );
  const average = percents.length
    ? Math.round(
        percents.reduce((sum, value) => sum + value, 0) / percents.length,
      )
    : 0;
  const players = new Set(attempts.map((attempt) => attempt.userEmail)).size;
  const perfect = percents.filter((value) => value === 100).length;

  const stats = [
    { label: "Attempts", value: String(attempts.length), hint: "Latest 200" },
    { label: "Players", value: String(players), hint: "Unique accounts" },
    { label: "Average score", value: `${average}%`, hint: "Across attempts" },
    { label: "Perfect scores", value: String(perfect), hint: "100% correct" },
  ];

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <Link href="/admin/quiz" className="admin-back-link">
          ← Quiz
        </Link>
        <h1 className="admin-title">Quiz results</h1>
        <p className="admin-subtitle">
          Finished attempts from signed-in visitors, newest first.
        </p>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="admin-stat-card admin-stat-card--neutral"
          >
            <p className="admin-stat-label">{stat.label}</p>
            <p className="admin-stat-value">{stat.value}</p>
            <p className="admin-stat-hint">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div
        className="admin-card admin-card--flush"
        style={{ marginTop: "1.5rem" }}
      >
        {loading ? (
          <p className="admin-hint" style={{ padding: "1rem" }}>
            Loading results…
          </p>
        ) : attempts.length === 0 ? (
          <p className="admin-hint" style={{ padding: "1rem" }}>
            No one has finished the quiz yet.
          </p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Time</th>
                  <th>Finished</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, index) => (
                  <tr key={attempt.id}>
                    <td>
                      <div className="admin-table-title">
                        {attempt.userName ?? "Deleted account"}
                      </div>
                      <div className="admin-table-meta">
                        {attempt.userEmail ?? "—"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-status-chip ${
                          percents[index] >= 70
                            ? "admin-status-chip--ok"
                            : percents[index] >= 40
                              ? "admin-status-chip--warn"
                              : "admin-status-chip--danger"
                        }`}
                      >
                        {percents[index]}%
                      </span>
                      <div className="admin-table-meta">
                        {attempt.score}/{attempt.maxScore} pts
                      </div>
                    </td>
                    <td>
                      {attempt.correct === null
                        ? "—"
                        : `${attempt.correct}/${attempt.totalQuestions}`}
                    </td>
                    <td>
                      {attempt.durationMs === null
                        ? "—"
                        : formatDurationMs(attempt.durationMs)}
                    </td>
                    <td>{formatAttemptDate(attempt.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
