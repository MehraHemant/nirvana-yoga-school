"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { CollapsiblePanel } from "@/components/admin/CollapsiblePanel";
import { ImageField } from "@/components/admin/ImageField";
import { NestedItemCard } from "@/components/admin/NestedItemCard";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { SelectField } from "@/components/admin/SelectField";
import {
  reorderItems,
  SortableList,
  SortableRow,
} from "@/components/admin/SortableList";
import { TextField } from "@/components/admin/TextField";
import { useStableListKeys } from "@/components/admin/useStableListKeys";
import {
  createDefaultQuizSettings,
  QUIZ_LIMITS,
  type QuizOption,
  type QuizOptionType,
  type QuizQuestion,
  type QuizSettings,
} from "@/content/types/quiz";
import { Trash } from "@/icons";
import { parseApiJson } from "@/lib/types/api";

type QuizDoc = {
  settings: QuizSettings;
  questions: QuizQuestion[];
};

const OPTION_TYPE_CHOICES: { value: QuizOptionType; label: string }[] = [
  { value: "text", label: "Text answers" },
  { value: "image", label: "Image answers" },
];

/**
 * Blank question of the given answer type.
 *
 * @param optionType - Text or image answers
 */
function createQuestion(optionType: QuizOptionType): QuizQuestion {
  return {
    id: "",
    prompt: "",
    promptImageUrl: "",
    optionType,
    options: Array.from({ length: 4 }, () => ({ label: "", imageUrl: "" })),
    correctIndex: 0,
    explanation: "",
    active: true,
  };
}

/**
 * Whole number from a text field, or 0.
 *
 * @param value - Raw input
 */
function toInt(value: string): number {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Short problem with a question, shown on its card before saving.
 *
 * @param question - Question being edited
 */
function questionIssue(question: QuizQuestion): string | null {
  if (!question.prompt.trim()) return "Add the question text";
  if (question.optionType === "image") {
    const missing = question.options.findIndex(
      (option) => !option.imageUrl.trim(),
    );
    if (missing >= 0) {
      return `Answer ${String.fromCharCode(65 + missing)} needs an image`;
    }
  } else {
    const missing = question.options.findIndex(
      (option) => !option.label.trim(),
    );
    if (missing >= 0) {
      return `Answer ${String.fromCharCode(65 + missing)} needs text`;
    }
  }
  return null;
}

/**
 * CMS editor for the site quiz: settings, copy, and the question bank.
 */
export function QuizEditor() {
  const [doc, setDoc] = useState<QuizDoc | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const questions = doc?.questions ?? [];
  const keys = useStableListKeys(questions.length);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/quiz")
      .then((res) => parseApiJson<QuizDoc>(res))
      .then((body) => {
        if (cancelled) return;
        const next = {
          settings: body.settings ?? createDefaultQuizSettings(),
          questions: body.questions ?? [],
        };
        setDoc(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        const fallback = {
          settings: createDefaultQuizSettings(),
          questions: [],
        };
        setDoc(fallback);
        setBaseline(JSON.stringify(fallback));
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = useMemo(
    () => Boolean(doc) && JSON.stringify(doc) !== baseline,
    [doc, baseline],
  );
  const activeCount = questions.filter((question) => question.active).length;

  function patchSettings(patch: Partial<QuizSettings>) {
    if (!doc) return;
    setDoc({ ...doc, settings: { ...doc.settings, ...patch } });
  }

  function updateQuestion(index: number, patch: Partial<QuizQuestion>) {
    if (!doc) return;
    setDoc({
      ...doc,
      questions: questions.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    });
  }

  function addQuestion(optionType: QuizOptionType) {
    if (!doc) return;
    keys.addKey();
    setDoc({ ...doc, questions: [...questions, createQuestion(optionType)] });
  }

  function removeQuestion(index: number) {
    if (!doc) return;
    keys.removeKey(index);
    setDoc({ ...doc, questions: questions.filter((_, i) => i !== index) });
  }

  function reorder(fromIndex: number, toIndex: number) {
    if (!doc) return;
    keys.reorderKeys(fromIndex, toIndex);
    setDoc({ ...doc, questions: reorderItems(questions, fromIndex, toIndex) });
  }

  async function handleSave() {
    if (!doc) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/quiz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      const body = await parseApiJson<QuizDoc>(res);
      setDoc(body);
      setBaseline(JSON.stringify(body));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !doc) {
    return <p className="admin-hint">Loading quiz…</p>;
  }

  const { settings } = doc;

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">Quiz</h1>
            <p className="admin-subtitle">
              Questions, answers, and copy for the floating quiz on the site.
              Signed-in visitors take it from the button at the bottom right.
            </p>
          </div>
          <Link href="/admin/quiz/results" className="admin-btn-sm">
            View results
          </Link>
        </div>
      </div>

      <div className="admin-tip-banner">
        <strong>Quick guide:</strong> Use <em>Add text question</em> for written
        answers, or <em>Add image question</em> when the answers are pictures
        (for example “Which image shows Tree pose?”). Any question can also show
        a photo above it (for example “Name this pose”). Tick the right answer
        on each card. Answers are checked on the server, so visitors never see
        them in advance.
      </div>

      <div className="admin-editor-layout">
        <div className="admin-editor-sections">
          <CollapsiblePanel
            id="quiz-settings"
            step={1}
            title="Rules"
            subtitle={settings.live ? "Live on the site" : "Hidden"}
            description="Switching the quiz off hides the floating button and the quiz page."
            defaultOpen
            actions={
              <SectionLiveField
                id="quiz-live"
                value={settings.live}
                onChange={(live) => patchSettings({ live })}
              />
            }
          >
            <div className="admin-grid-4">
              <TextField
                id="quiz-monthly-limit"
                label="Attempts per month"
                value={String(settings.monthlyLimit)}
                onChange={(value) =>
                  patchSettings({ monthlyLimit: toInt(value) })
                }
                hint={`Per account, ${QUIZ_LIMITS.monthlyLimit.min}–${QUIZ_LIMITS.monthlyLimit.max}. Resets on the 1st (India time).`}
              />
              <TextField
                id="quiz-points"
                label="Points per correct answer"
                value={String(settings.pointsPerCorrect)}
                onChange={(value) =>
                  patchSettings({ pointsPerCorrect: toInt(value) })
                }
              />
              <TextField
                id="quiz-per-attempt"
                label="Questions per attempt"
                value={String(settings.questionsPerAttempt)}
                onChange={(value) =>
                  patchSettings({ questionsPerAttempt: toInt(value) })
                }
                hint={`0 uses all ${activeCount} active questions. A smaller number picks a random set each time.`}
              />
              <TextField
                id="quiz-minutes"
                label="Estimated minutes"
                value={String(settings.estimatedMinutes)}
                onChange={(value) =>
                  patchSettings({ estimatedMinutes: toInt(value) })
                }
                hint="Shown on the intro screen."
              />
            </div>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={settings.shuffleQuestions}
                onChange={(event) =>
                  patchSettings({ shuffleQuestions: event.target.checked })
                }
              />
              <span>Shuffle question order for each attempt</span>
            </label>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={settings.showAnswerReview}
                onChange={(event) =>
                  patchSettings({ showAnswerReview: event.target.checked })
                }
              />
              <span>
                Show the right answers and explanations after the quiz
              </span>
            </label>
          </CollapsiblePanel>

          <CollapsiblePanel
            id="quiz-copy"
            step={2}
            title="Copy"
            subtitle="Button, intro, and gift note"
            description="Text visitors see around the questions."
          >
            <div className="admin-grid-2">
              <TextField
                id="quiz-launcher-label"
                label="Floating button title"
                value={settings.launcherLabel}
                onChange={(launcherLabel) => patchSettings({ launcherLabel })}
              />
              <TextField
                id="quiz-launcher-tagline"
                label="Floating button subtitle"
                value={settings.launcherTagline}
                onChange={(launcherTagline) =>
                  patchSettings({ launcherTagline })
                }
                hint="Shown to visitors who are not signed in."
              />
            </div>
            <div className="admin-grid-3">
              <TextField
                id="quiz-intro-eyebrow"
                label="Intro eyebrow"
                value={settings.introEyebrow}
                onChange={(introEyebrow) => patchSettings({ introEyebrow })}
              />
              <TextField
                id="quiz-intro-title"
                label="Intro title"
                value={settings.introTitle}
                onChange={(introTitle) => patchSettings({ introTitle })}
              />
              <TextField
                id="quiz-intro-highlight"
                label="Intro title highlight"
                value={settings.introHighlight}
                onChange={(introHighlight) => patchSettings({ introHighlight })}
                hint="Shown after the title in the brand colour."
              />
            </div>
            <TextField
              id="quiz-intro-body"
              label="Intro text"
              value={settings.introBody}
              onChange={(introBody) => patchSettings({ introBody })}
              multiline
            />
            <div className="admin-grid-2">
              <TextField
                id="quiz-gift-eyebrow"
                label="Gift note eyebrow"
                value={settings.giftEyebrow}
                onChange={(giftEyebrow) => patchSettings({ giftEyebrow })}
              />
              <TextField
                id="quiz-gift-title"
                label="Gift note heading"
                value={settings.giftTitle}
                onChange={(giftTitle) => patchSettings({ giftTitle })}
                hint="{name} becomes the visitor's first name."
              />
            </div>
            <TextField
              id="quiz-gift-body"
              label="Gift note text"
              value={settings.giftBody}
              onChange={(giftBody) => patchSettings({ giftBody })}
              multiline
            />
            <div className="admin-grid-2">
              <TextField
                id="quiz-gift-cta-label"
                label="Gift button label"
                value={settings.giftCtaLabel}
                onChange={(giftCtaLabel) => patchSettings({ giftCtaLabel })}
                hint="Leave empty to hide the button."
              />
              <TextField
                id="quiz-gift-cta-href"
                label="Gift button link"
                value={settings.giftCtaHref}
                onChange={(giftCtaHref) => patchSettings({ giftCtaHref })}
                placeholder="/enquire-now"
              />
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            id="quiz-questions"
            step={3}
            title="Questions"
            subtitle={`${activeCount} active of ${questions.length}`}
            description="Drag to reorder. Switched-off questions stay here but are never shown."
            defaultOpen
          >
            <div className="admin-field-header">
              <span className="admin-label">Question bank</span>
              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => addQuestion("text")}
                >
                  Add text question
                </button>
                <button
                  type="button"
                  className="admin-btn-sm"
                  onClick={() => addQuestion("image")}
                >
                  Add image question
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="admin-empty-card">
                <p>No questions yet.</p>
                <div className="admin-empty-card-actions">
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => addQuestion("text")}
                  >
                    Add text question
                  </button>
                  <button
                    type="button"
                    className="admin-btn-sm"
                    onClick={() => addQuestion("image")}
                  >
                    Add image question
                  </button>
                </div>
              </div>
            ) : (
              <SortableList
                ids={keys.keys}
                onReorder={reorder}
                className="admin-stack"
              >
                {questions.map((question, index) => (
                  <SortableRow key={keys.keys[index]} id={keys.keys[index]}>
                    {({ dragHandleProps }) => (
                      <QuestionCard
                        question={question}
                        index={index}
                        dragHandleProps={dragHandleProps}
                        onChange={(patch) => updateQuestion(index, patch)}
                        onRemove={() => removeQuestion(index)}
                      />
                    )}
                  </SortableRow>
                ))}
              </SortableList>
            )}
          </CollapsiblePanel>
        </div>
      </div>

      <AdminSaveBar
        title="Quiz"
        subtitle={`${questions.length} question${questions.length === 1 ? "" : "s"}`}
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/quiz"
      />
    </div>
  );
}

type QuestionCardProps = {
  question: QuizQuestion;
  index: number;
  dragHandleProps: React.ComponentProps<
    typeof NestedItemCard
  >["dragHandleProps"];
  onChange: (patch: Partial<QuizQuestion>) => void;
  onRemove: () => void;
};

/**
 * One editable question with its answers.
 *
 * @param props - Question, position, and handlers
 */
function QuestionCard({
  question,
  index,
  dragHandleProps,
  onChange,
  onRemove,
}: QuestionCardProps) {
  const issue = questionIssue(question);
  const imageOptions = question.optionType === "image";
  const fieldPrefix = `quiz-q${index}`;

  function updateOption(optionIndex: number, patch: Partial<QuizOption>) {
    onChange({
      options: question.options.map((option, i) =>
        i === optionIndex ? { ...option, ...patch } : option,
      ),
    });
  }

  function removeOption(optionIndex: number) {
    const options = question.options.filter((_, i) => i !== optionIndex);
    let correctIndex = question.correctIndex;
    if (optionIndex === correctIndex) correctIndex = 0;
    else if (optionIndex < correctIndex) correctIndex -= 1;
    onChange({ options, correctIndex });
  }

  return (
    <NestedItemCard
      title={question.prompt.trim() || "New question"}
      subtitle={
        issue ??
        `${imageOptions ? "Image" : "Text"} answers · correct: ${String.fromCharCode(65 + question.correctIndex)}`
      }
      index={index}
      collapsible
      defaultOpen={!question.prompt.trim()}
      dragHandleProps={dragHandleProps}
      onRemove={onRemove}
      headerActions={
        <SectionLiveField
          id={`${fieldPrefix}-active`}
          value={question.active}
          onChange={(active) => onChange({ active })}
          liveLabel="On"
          hiddenLabel="Off"
        />
      }
    >
      <TextField
        id={`${fieldPrefix}-prompt`}
        label="Question"
        value={question.prompt}
        onChange={(prompt) => onChange({ prompt })}
        placeholder={
          imageOptions
            ? "Which image shows Vrikshasana (Tree pose)?"
            : "What is the name of this pose?"
        }
      />
      <div className="admin-grid-2">
        <ImageField
          label="Question image (optional)"
          value={question.promptImageUrl}
          onChange={(promptImageUrl) => onChange({ promptImageUrl })}
          hint="Shown above the answers, e.g. a pose to name."
        />
        <SelectField
          id={`${fieldPrefix}-type`}
          label="Answer type"
          value={question.optionType}
          options={OPTION_TYPE_CHOICES}
          onChange={(value) =>
            onChange({ optionType: value === "image" ? "image" : "text" })
          }
          hint={
            imageOptions
              ? "Each answer is a picture. Captions are optional and also used as alt text, so leave them empty if they would give the answer away."
              : "Each answer is a line of text."
          }
        />
      </div>

      <div className="admin-field">
        <span className="admin-label">
          Answers — tick the correct one ({QUIZ_LIMITS.options.min}–
          {QUIZ_LIMITS.options.max})
        </span>
        <div className="admin-quiz-options">
          {question.options.map((option, optionIndex) => {
            const letter = String.fromCharCode(65 + optionIndex);
            const correct = question.correctIndex === optionIndex;
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: answers are positional
                key={optionIndex}
                className={`admin-quiz-option${correct ? " admin-quiz-option--correct" : ""}`}
              >
                <div className="admin-quiz-option-head">
                  <label className="admin-quiz-correct">
                    <input
                      type="radio"
                      name={`${fieldPrefix}-correct`}
                      checked={correct}
                      onChange={() => onChange({ correctIndex: optionIndex })}
                    />
                    <span>
                      {letter}
                      {correct ? " · Correct" : ""}
                    </span>
                  </label>
                  {question.options.length > QUIZ_LIMITS.options.min ? (
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--sm admin-icon-btn--danger"
                      aria-label={`Remove answer ${letter}`}
                      title="Remove answer"
                      onClick={() => removeOption(optionIndex)}
                    >
                      <Trash size={14} />
                    </button>
                  ) : null}
                </div>
                {imageOptions ? (
                  <ImageField
                    label={`Answer ${letter} image`}
                    hideLabel
                    compact
                    value={option.imageUrl}
                    onChange={(imageUrl) =>
                      updateOption(optionIndex, { imageUrl })
                    }
                  />
                ) : null}
                <TextField
                  id={`${fieldPrefix}-option-${optionIndex}`}
                  label={
                    imageOptions ? "Caption (optional)" : `Answer ${letter}`
                  }
                  value={option.label}
                  onChange={(label) => updateOption(optionIndex, { label })}
                />
              </div>
            );
          })}
        </div>
        {question.options.length < QUIZ_LIMITS.options.max ? (
          <button
            type="button"
            className="admin-btn-sm admin-btn-sm--ghost"
            onClick={() =>
              onChange({
                options: [...question.options, { label: "", imageUrl: "" }],
              })
            }
          >
            Add answer
          </button>
        ) : null}
      </div>

      <TextField
        id={`${fieldPrefix}-explanation`}
        label="Explanation (optional)"
        value={question.explanation}
        onChange={(explanation) => onChange({ explanation })}
        multiline
        rows={2}
        hint="Shown in the answer review after the quiz."
      />
    </NestedItemCard>
  );
}
