"use client";

import { useEffect, useState } from "react";
import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { ImageField } from "@/components/admin/ImageField";
import { SectionLiveField } from "@/components/admin/SectionLiveField";
import { TextField } from "@/components/admin/TextField";
import {
  createEmptyOfferPopup,
  formatOfferDeadline,
  normalizeOfferPopup,
  type OfferPopupContent,
  type OfferPopupFrequency,
  offerDeadlineMs,
} from "@/content/types/offer-popup";
import { parseApiJson } from "@/lib/types/api";

const FREQUENCIES: { value: OfferPopupFrequency; label: string }[] = [
  { value: "session", label: "Once per visit (browser session)" },
  { value: "day", label: "Once per day" },
  { value: "week", label: "Once per week" },
];

/**
 * Admin editor for the site-wide offer popup (`global_settings.offerPopup`).
 */
export function OfferPopupEditor() {
  const [doc, setDoc] = useState<OfferPopupContent | null>(null);
  const [baseline, setBaseline] = useState("");
  const [perksText, setPerksText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/offerPopup")
      .then((res) => parseApiJson<{ settings: OfferPopupContent }>(res))
      .then((body) => {
        const next = normalizeOfferPopup(body.settings);
        setDoc(next);
        setPerksText(next.perks.join("\n"));
        setBaseline(JSON.stringify(next));
      })
      .catch((err: Error) => {
        setDoc(createEmptyOfferPopup());
        setError(err.message);
      });
  }, []);

  if (!doc) return <p className="admin-hint">Loading offer popup…</p>;

  const dirty = JSON.stringify(doc) !== baseline;
  const deadlineMs = offerDeadlineMs(doc.deadline);
  const expired = deadlineMs !== null && deadlineMs <= Date.now();
  const status = !doc.live
    ? { tone: "", text: "Off — not shown to visitors" }
    : expired
      ? {
          tone: "admin-status-chip--danger",
          text: `Ended ${formatOfferDeadline(doc.deadline)} — hidden until you set a new deadline`,
        }
      : {
          tone: "admin-status-chip--ok",
          text: deadlineMs
            ? `Live until ${formatOfferDeadline(doc.deadline)}`
            : "Live (no end date)",
        };

  function patch(next: Partial<OfferPopupContent>) {
    setDoc((current) => (current ? { ...current, ...next } : current));
  }

  async function handleSave() {
    if (!doc) return;
    if (doc.live && !doc.title.trim()) {
      setError("Add a title before turning the popup on.");
      return;
    }
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/settings/offerPopup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: doc }),
      });
      await parseApiJson(res);
      setBaseline(JSON.stringify(doc));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-header">
        <div className="admin-editor-title-row">
          <div>
            <h1 className="admin-title">Offer popup</h1>
            <p className="admin-subtitle admin-subtitle--flush">
              The limited-time offer shown on public pages. It hides itself
              after the deadline, and visitors who closed an old offer see a new
              one again.
            </p>
            <p className="admin-offer-status">
              <span className={`admin-status-chip ${status.tone}`}>
                {status.text}
              </span>
            </p>
          </div>
          <div className="admin-offer-head-actions">
            <SectionLiveField
              id="offer-live"
              value={doc.live}
              onChange={(live) => patch({ live })}
              liveLabel="On"
              hiddenLabel="Off"
            />
            <a
              href="/?offer-preview=1"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-sm"
              title={dirty ? "Save first to preview your changes" : undefined}
            >
              Preview on site
            </a>
          </div>
        </div>
      </div>

      <div className="admin-offer-grid">
        <section className="admin-card admin-offer-card">
          <h2 className="admin-offer-card__title">Message</h2>
          <TextField
            label="Eyebrow"
            value={doc.eyebrow}
            placeholder="Yoga Teacher Training"
            onChange={(eyebrow) => patch({ eyebrow })}
          />
          <TextField
            label="Title"
            value={doc.title}
            placeholder="Limited Time Offer"
            onChange={(title) => patch({ title })}
          />
          <TextField
            label="Description"
            value={doc.description}
            multiline
            rows={3}
            onChange={(description) => patch({ description })}
          />
          <TextField
            label="Perks"
            value={perksText}
            multiline
            rows={4}
            hint="One per line — shown as a checklist"
            onChange={(text) => {
              setPerksText(text);
              patch({
                perks: text
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              });
            }}
          />
        </section>

        <section className="admin-card admin-offer-card">
          <h2 className="admin-offer-card__title">Offer &amp; timing</h2>
          <div className="admin-offer-pair">
            <TextField
              label="Discount badge"
              value={doc.discountLabel}
              placeholder="25%"
              hint="Shown as “Save 25%”. Empty hides it."
              onChange={(discountLabel) => patch({ discountLabel })}
            />
            <div className="admin-field">
              <label className="admin-label" htmlFor="offer-deadline">
                Last day of offer
              </label>
              <input
                id="offer-deadline"
                type="date"
                className="admin-input"
                value={doc.deadline}
                onChange={(event) => patch({ deadline: event.target.value })}
              />
              <p className="admin-hint admin-hint--tight">
                Countdown ends 11:59 pm India time. Empty = no countdown.
              </p>
            </div>
          </div>
          <div className="admin-offer-pair">
            <div className="admin-field">
              <label className="admin-label" htmlFor="offer-delay">
                Delay before showing (seconds)
              </label>
              <input
                id="offer-delay"
                type="number"
                min={0}
                max={60}
                className="admin-input"
                value={doc.delaySeconds}
                onChange={(event) =>
                  patch({ delaySeconds: Number(event.target.value) || 0 })
                }
              />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="offer-frequency">
                After a visitor closes it
              </label>
              <select
                id="offer-frequency"
                className="admin-input admin-select"
                value={doc.frequency}
                onChange={(event) =>
                  patch({
                    frequency: event.target.value as OfferPopupFrequency,
                  })
                }
              >
                {FREQUENCIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    Show again {option.label.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="admin-card admin-offer-card">
          <h2 className="admin-offer-card__title">Buttons</h2>
          <div className="admin-offer-pair">
            <TextField
              label="Main button"
              value={doc.primaryCta.label}
              placeholder="Book Now"
              onChange={(label) =>
                patch({ primaryCta: { ...doc.primaryCta, label } })
              }
            />
            <TextField
              label="Main button link"
              value={doc.primaryCta.href}
              placeholder="/booking"
              onChange={(href) =>
                patch({ primaryCta: { ...doc.primaryCta, href } })
              }
            />
          </div>
          <div className="admin-offer-pair">
            <TextField
              label="Second button"
              value={doc.secondaryCta.label}
              placeholder="Enquire Now"
              onChange={(label) =>
                patch({ secondaryCta: { ...doc.secondaryCta, label } })
              }
            />
            <TextField
              label="Second button link"
              value={doc.secondaryCta.href}
              placeholder="/enquire-now"
              onChange={(href) =>
                patch({ secondaryCta: { ...doc.secondaryCta, href } })
              }
            />
          </div>
        </section>

        <section className="admin-card admin-offer-card">
          <h2 className="admin-offer-card__title">Image</h2>
          <ImageField
            label="Photo"
            value={doc.image}
            onChange={(image) => patch({ image })}
          />
          <TextField
            label="Image description (alt text)"
            value={doc.imageAlt}
            onChange={(imageAlt) => patch({ imageAlt })}
          />
        </section>
      </div>

      <AdminSaveBar
        title="Offer popup"
        subtitle="global_settings.offerPopup"
        saving={saving}
        saved={saved}
        dirty={dirty}
        error={error}
        onSave={handleSave}
        previewHref="/?offer-preview=1"
      />
    </div>
  );
}
