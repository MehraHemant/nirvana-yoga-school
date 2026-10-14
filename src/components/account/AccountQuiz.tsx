import { Button } from "@/components/ui";
import { ArrowRight, Check } from "@/icons";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import { scorePercent } from "@/lib/quiz/scoring";
import type { AccountQuizData } from "./AccountView";
import { ACCOUNT_CARD_CLASS, formatAccountDate } from "./format";

/**
 * This month's quiz allowance and the full attempt history.
 *
 * @param props - Remaining chances, next open date, and attempts
 */
export default function AccountQuiz({ quiz }: { quiz: AccountQuizData }) {
  const used = quiz.monthlyLimit - quiz.remaining;
  const percents = quiz.attempts.map((attempt) =>
    scorePercent(attempt.score, attempt.maxScore),
  );
  const best = percents.length ? Math.max(...percents) : null;
  const average = percents.length
    ? Math.round(
        percents.reduce((sum, value) => sum + value, 0) / percents.length,
      )
    : null;

  return (
    <div className="space-y-5">
      <div
        className={`${ACCOUNT_CARD_CLASS} grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center`}
      >
        <div>
          <p className="type-eyebrow text-primary">This month</p>
          <p className="type-h3 mt-2 text-ink">
            {quiz.remaining > 0
              ? `${quiz.remaining} of ${quiz.monthlyLimit} attempts left`
              : "Both attempts used"}
          </p>
          <ul className="mt-4 flex gap-2">
            {Array.from({ length: quiz.monthlyLimit }, (_, index) => {
              const done = index < used;
              return (
                <li
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
                  key={index}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${
                    done
                      ? "bg-primary/[0.06] text-primary ring-primary/20"
                      : "bg-surface-muted text-ink/55 ring-ink/8"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      done ? "bg-primary text-white" : "border border-ink/20"
                    }`}
                  >
                    {done ? <Check size={10} /> : null}
                  </span>
                  Attempt {index + 1}
                </li>
              );
            })}
          </ul>
        </div>
        {quiz.remaining > 0 && quiz.open ? (
          <Button href="/quiz" variant="primary" size="md" className="group">
            Take the quiz
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Button>
        ) : !quiz.open ? (
          <p className="rounded-2xl bg-surface-muted px-5 py-4 text-sm text-ink/60">
            The quiz is resting for now.
          </p>
        ) : (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-left sm:text-right">
            <p className="type-eyebrow text-primary/80">Next quiz opens</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {quiz.nextAvailableAt
                ? formatQuizNextDate(quiz.nextAvailableAt)
                : "Next month"}
            </p>
          </div>
        )}
      </div>

      <div className={ACCOUNT_CARD_CLASS}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type-eyebrow text-primary">History</p>
            <p className="type-h4 mt-2 text-ink">Your quiz scores</p>
          </div>
          {best !== null ? (
            <dl className="flex gap-6 text-right">
              <div>
                <dt className="text-xs text-ink/50">Best</dt>
                <dd className="text-xl font-semibold tabular-nums text-primary">
                  {best}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">Average</dt>
                <dd className="text-xl font-semibold tabular-nums text-ink">
                  {average}%
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        {quiz.attempts.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-surface-muted px-4 py-8 text-center text-sm text-ink/55">
            You have not taken the quiz yet.
          </p>
        ) : (
          <ol className="mt-6 divide-y divide-ink/[0.06]">
            {quiz.attempts.map((attempt, index) => {
              const percent = percents[index];
              return (
                <li
                  key={attempt.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3.5 sm:grid-cols-[9rem_1fr_auto]"
                >
                  <span className="text-sm text-ink/70">
                    {formatAccountDate(attempt.completedAt)}
                  </span>
                  <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded-full bg-primary/[0.08] sm:col-span-1 sm:row-start-auto">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="text-right text-sm tabular-nums">
                    <span className="font-semibold text-ink">{percent}%</span>
                    <span className="ml-2 text-ink/45">
                      {attempt.correct === null
                        ? `${attempt.score}/${attempt.maxScore} pts`
                        : `${attempt.correct}/${attempt.totalQuestions} correct`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
