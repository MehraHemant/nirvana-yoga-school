import { Button } from "@/components/ui";
import { Lotus } from "@/icons";
import {
  QuizCenteredMessage,
  QuizImmersiveLayout,
} from "./QuizImmersiveLayout";

/**
 * Shown when the quiz is switched off in the CMS or has no active questions.
 */
export function QuizClosed() {
  return (
    <QuizImmersiveLayout>
      <QuizCenteredMessage>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lotus size={26} strokeWidth={1.4} />
        </span>
        <h1 className="type-h3 mt-6 text-ink">The quiz is resting</h1>
        <p className="type-body mx-auto mt-2 max-w-sm text-ink/60">
          New questions are on their way. Please check back soon.
        </p>
        <Button href="/" variant="primary" size="md" className="mt-8">
          Back to the school
        </Button>
      </QuizCenteredMessage>
    </QuizImmersiveLayout>
  );
}
