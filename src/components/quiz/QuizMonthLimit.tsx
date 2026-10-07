import { Button } from "@/components/ui";
import { Check } from "@/icons";
import { formatQuizNextDate } from "@/lib/quiz/format-next-date";
import {
  QuizCenteredMessage,
  QuizImmersiveLayout,
} from "./QuizImmersiveLayout";
import { QUIZ_EYEBROW_CLASS, QUIZ_SERIF_CLASS } from "./quiz-panel";

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
        <p className={`${QUIZ_EYEBROW_CLASS} text-primary`}>
          {first ? `Thank you, ${first}` : "Thank you"}
        </p>
        <h1
          className={`${QUIZ_SERIF_CLASS} mt-5 text-balance text-4xl leading-[1.1] text-ink`}
        >
          {monthlyLimit === 1
            ? "You have taken this month’s quiz"
            : `You have taken all ${monthlyLimit} quizzes this month`}
        </h1>
        <ul className="mt-8 flex justify-center gap-5">
          {Array.from({ length: monthlyLimit }, (_, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length chance markers
              key={index}
              className="flex items-center gap-2 text-xs text-ink/55"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                <Check size={9} strokeWidth={3} />
              </span>
              Quiz {index + 1}
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-10 max-w-xs border-y border-ink/8 py-6">
          <p className={`${QUIZ_EYEBROW_CLASS} text-ink/45`}>Next quiz opens</p>
          <p className={`${QUIZ_SERIF_CLASS} mt-2 text-2xl text-ink`}>
            {nextAvailableAt
              ? formatQuizNextDate(nextAvailableAt)
              : "Next month"}
          </p>
        </div>
        <Button href="/" variant="primary" size="md" className="mt-10">
          Back to the school
        </Button>
      </QuizCenteredMessage>
    </QuizImmersiveLayout>
  );
}
