import { Button } from "@/components/ui";
import { Check } from "@/icons";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import {
  QuizCenteredMessage,
  QuizImmersiveLayout,
} from "./QuizImmersiveLayout";

type QuizMonthLimitProps = {
  /** Signed-in name for the greeting. */
  userName?: string | null;
  /** ISO instant the next chance opens. */
  nextAvailableAt: string | null;
  /** Monthly attempt allowance. */
  monthlyLimit: number;
};

/**
 * Shown when every monthly quiz chance is already used.
 *
 * @param props - Name, next open date, and the monthly allowance
 */
export function QuizMonthLimit({
  userName = null,
  nextAvailableAt,
  monthlyLimit,
}: QuizMonthLimitProps) {
  const first = userName?.trim().split(/\s+/)[0];

  return (
    <QuizImmersiveLayout>
      <QuizCenteredMessage>
        <p className="type-eyebrow text-primary">
          {first ? `Thank you, ${first}` : "Thank you"}
        </p>
        <h1 className="type-h3 mt-3 text-balance text-ink">
          {monthlyLimit === 1
            ? "You have taken this month’s quiz"
            : `You have taken all ${monthlyLimit} quizzes this month`}
        </h1>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: monthlyLimit }, (_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
              key={index}
              className="flex items-center gap-2 rounded-full bg-ink/4 px-3 py-1.5 text-xs font-medium text-ink/65"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                <Check size={9} strokeWidth={3} />
              </span>
              Quiz {index + 1}
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-8 max-w-xs rounded-2xl bg-primary/5 px-6 py-5">
          <p className="type-eyebrow text-ink/50">Next quiz opens</p>
          <p className="type-h4 mt-1.5 text-primary">
            {nextAvailableAt
              ? formatQuizNextDate(nextAvailableAt)
              : "Next month"}
          </p>
        </div>
        <Button href="/" variant="primary" size="md" className="mt-8">
          Back to the school
        </Button>
      </QuizCenteredMessage>
    </QuizImmersiveLayout>
  );
}
