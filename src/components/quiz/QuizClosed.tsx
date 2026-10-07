import { Button } from "@/components/ui";
import { Lotus } from "@/icons";
import {
  QuizCenteredMessage,
  QuizImmersiveLayout,
} from "./QuizImmersiveLayout";
import { QUIZ_SERIF_CLASS } from "./quiz-panel";

/**
 * Shown when the quiz is switched off in the CMS or has no active questions.
 */
export function QuizClosed() {
  return (
    <QuizImmersiveLayout>
      <QuizCenteredMessage>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-[0_20px_40px_-24px_rgb(163_36_50/0.5)]">
          <Lotus size={28} strokeWidth={1.4} />
        </span>
        <h1 className={`${QUIZ_SERIF_CLASS} mt-8 text-4xl text-ink`}>
          The quiz is resting
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink/55">
          New questions are on their way. Please check back soon.
        </p>
        <Button href="/" variant="primary" size="md" className="mt-10">
          Back to the school
        </Button>
      </QuizCenteredMessage>
    </QuizImmersiveLayout>
  );
}
