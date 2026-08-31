import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MessageCircle, Send, Star, X } from "lucide-react";
import { useState } from "react";
import tailwindStyles from "../index.css?inline";
import supabase from "../supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const widgetStyles = `
  .nexx-widget {
    --nexx-accent: #2563eb;
    --nexx-accent-contrast: #ffffff;
    --nexx-surface: #ffffff;
    --nexx-text: #111827;
    --nexx-muted: #6b7280;
    --nexx-border: color-mix(in srgb, var(--nexx-text) 14%, transparent);
    --nexx-soft: color-mix(in srgb, var(--nexx-accent) 9%, var(--nexx-surface));
    --nexx-danger: #b91c1c;
    --nexx-radius: 12px;
    --nexx-font: inherit;
    color: var(--nexx-text);
    font-family: var(--nexx-font);
  }

  .nexx-launcher-wrap {
    position: fixed;
    z-index: 2147483647;
  }

  .nexx-position-right-middle {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .nexx-position-left-middle {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .nexx-position-bottom-right { bottom: 1rem; right: 1rem; }
  .nexx-position-bottom-left { bottom: 1rem; left: 1rem; }
  .nexx-position-top-right { top: 1rem; right: 1rem; }
  .nexx-position-top-left { top: 1rem; left: 1rem; }

  .nexx-launcher {
    width: 44px;
    min-width: 44px;
    height: 136px;
    gap: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--nexx-accent) 70%, #ffffff);
    border-radius: 12px 0 0 12px;
    background: var(--nexx-accent);
    color: var(--nexx-accent-contrast);
    box-shadow: 0 18px 42px color-mix(in srgb, var(--nexx-accent) 28%, transparent);
    flex-direction: column;
    font-family: var(--nexx-font);
    letter-spacing: 0;
    padding: 0.75rem 0.35rem;
    white-space: normal;
  }

  .nexx-launcher:hover {
    background: color-mix(in srgb, var(--nexx-accent) 88%, #000000);
    transform: translateX(-2px);
  }

  .nexx-position-left-middle .nexx-launcher {
    border-radius: 0 12px 12px 0;
  }

  .nexx-position-left-middle .nexx-launcher:hover {
    transform: translateX(2px);
  }

  .nexx-position-bottom-right .nexx-launcher,
  .nexx-position-bottom-left .nexx-launcher,
  .nexx-position-top-right .nexx-launcher,
  .nexx-position-top-left .nexx-launcher {
    width: auto;
    min-width: 0;
    height: 46px;
    border-radius: 999px;
    flex-direction: row;
    padding: 0 1rem;
    white-space: nowrap;
  }

  .nexx-position-bottom-right .nexx-launcher:hover,
  .nexx-position-bottom-left .nexx-launcher:hover,
  .nexx-position-top-right .nexx-launcher:hover,
  .nexx-position-top-left .nexx-launcher:hover {
    transform: translateY(-1px);
  }

  .nexx-launcher-label {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 0.78rem;
    font-weight: 800;
    line-height: 1;
  }

  .nexx-position-bottom-right .nexx-launcher-label,
  .nexx-position-bottom-left .nexx-launcher-label,
  .nexx-position-top-right .nexx-launcher-label,
  .nexx-position-top-left .nexx-launcher-label {
    writing-mode: horizontal-tb;
    transform: none;
    font-size: 0.875rem;
  }

  .nexx-panel {
    width: min(calc(100vw - 2rem), 420px);
    border: 1px solid var(--nexx-border);
    border-radius: var(--nexx-radius);
    background: var(--nexx-surface);
    color: var(--nexx-text);
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
    overflow: hidden;
    font-family: var(--nexx-font);
  }

  .nexx-panel-header {
    display: flex;
    gap: 0.75rem;
    padding: 1.25rem 1.25rem 1rem;
    background: linear-gradient(180deg, var(--nexx-soft), var(--nexx-surface));
  }

  .nexx-icon-badge {
    display: grid;
    width: 38px;
    height: 38px;
    min-width: 38px;
    place-items: center;
    border-radius: calc(var(--nexx-radius) - 4px);
    background: var(--nexx-accent);
    color: var(--nexx-accent-contrast);
  }

  .nexx-title {
    margin: 0;
    color: var(--nexx-text);
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0;
  }

  .nexx-description {
    margin: 0.25rem 0 0;
    color: var(--nexx-muted);
    font-size: 0.875rem;
    line-height: 1.45;
  }

  .nexx-form {
    display: grid;
    gap: 1rem;
    padding: 0 1.25rem 1.25rem;
  }

  .nexx-field-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0.75rem;
  }

  .nexx-field {
    display: grid;
    gap: 0.45rem;
  }

  .nexx-label {
    color: var(--nexx-text);
    font-size: 0.8rem;
  }

  .nexx-input {
    border-color: var(--nexx-border);
    border-radius: calc(var(--nexx-radius) - 5px);
    background: color-mix(in srgb, var(--nexx-surface) 96%, var(--nexx-text));
    color: var(--nexx-text);
    box-shadow: none;
    font-family: var(--nexx-font);
  }

  .nexx-input:focus-visible {
    border-color: var(--nexx-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--nexx-accent) 18%, transparent);
  }

  .nexx-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .nexx-stars {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nexx-star-button {
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: color-mix(in srgb, var(--nexx-text) 35%, transparent);
    cursor: pointer;
  }

  .nexx-star-button:hover,
  .nexx-star-button:focus-visible {
    background: var(--nexx-soft);
    color: var(--nexx-accent);
    outline: none;
  }

  .nexx-star-button[data-active="true"] {
    color: #f59e0b;
  }

  .nexx-submit {
    gap: 0.45rem;
    border-radius: calc(var(--nexx-radius) - 4px);
    background: var(--nexx-accent);
    color: var(--nexx-accent-contrast);
    font-family: var(--nexx-font);
  }

  .nexx-submit:hover {
    background: color-mix(in srgb, var(--nexx-accent) 88%, #000000);
  }

  .nexx-error {
    margin: -0.25rem 1.25rem 1rem;
    border: 1px solid color-mix(in srgb, var(--nexx-danger) 30%, transparent);
    border-radius: calc(var(--nexx-radius) - 5px);
    background: color-mix(in srgb, var(--nexx-danger) 8%, var(--nexx-surface));
    color: var(--nexx-danger);
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  .nexx-success {
    padding: 0 1.25rem 1.25rem;
  }

  .nexx-success-card {
    border: 1px solid var(--nexx-border);
    border-radius: calc(var(--nexx-radius) - 4px);
    background: var(--nexx-soft);
    padding: 1rem;
  }

  .nexx-success-icon {
    color: var(--nexx-accent);
  }

  .nexx-footer {
    padding: 0 1.25rem 1rem;
    color: var(--nexx-muted);
    font-size: 0.75rem;
  }

  .nexx-footer a {
    color: var(--nexx-accent);
    font-weight: 700;
    text-decoration: none;
  }

  .nexx-footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 430px) {
    .nexx-position-right-middle,
    .nexx-position-left-middle {
      top: auto;
      bottom: 5.5rem;
      transform: none;
    }

    .nexx-position-bottom-right,
    .nexx-position-bottom-left {
      right: 0.75rem;
      bottom: 0.75rem;
      left: 0.75rem;
    }

    .nexx-position-top-right,
    .nexx-position-top-left {
      right: 0.75rem;
      top: 0.75rem;
      left: 0.75rem;
    }

    .nexx-launcher {
      margin-left: auto;
    }

    .nexx-field-grid {
      grid-template-columns: 1fr;
    }

    .nexx-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .nexx-stars {
      justify-content: space-between;
    }

    .nexx-submit {
      width: 100%;
    }
  }
`;

const positionClasses = {
  "right-middle": "nexx-position-right-middle",
  "left-middle": "nexx-position-left-middle",
  "bottom-left": "nexx-position-bottom-left",
  "top-right": "nexx-position-top-right",
  "top-left": "nexx-position-top-left",
  "bottom-right": "nexx-position-bottom-right",
};

const popoverSides = {
  "right-middle": "left",
  "left-middle": "right",
  "bottom-right": "top",
  "bottom-left": "top",
  "top-right": "bottom",
  "top-left": "bottom",
};

const clampRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 3;
  return Math.min(5, Math.max(1, Math.round(parsed)));
};

export const Widget = ({
  projectId,
  pageTheme = {},
  accentColor,
  accentContrast,
  surfaceColor,
  textColor,
  mutedColor,
  radius,
  fontFamily,
  position = "right-middle",
  buttonLabel = "  Feedback  ",
  title = "Send us your feedback",
  description = "Tell us what worked, what did not, and what would make this page better.",
  successTitle = "Feedback received",
  successMessage = "Thanks for taking a moment to share this. Your note helps the team improve the experience.",
  brandName = "Nexx Widget",
  brandUrl = "https://www.mrdmilkyway.com",
  defaultRating = 3,
}) => {
  const [rating, setRating] = useState(() => clampRating(defaultRating));
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const themeStyle = {
    "--nexx-accent": accentColor || pageTheme.accentColor || "#2563eb",
    "--nexx-accent-contrast": accentContrast || pageTheme.accentContrast || "#ffffff",
    "--nexx-surface": surfaceColor || pageTheme.surfaceColor || "#ffffff",
    "--nexx-text": textColor || pageTheme.textColor || "#111827",
    "--nexx-muted": mutedColor || pageTheme.mutedColor || "#6b7280",
    "--nexx-radius": radius || pageTheme.radius || "12px",
    "--nexx-font": fontFamily || pageTheme.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
  };

  const onSelectStar = (index) => {
    setRating(index + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!form.name.value || !form.email.value || !form.feedback.value) {
      setError("Please fill out every field before submitting.");
      return;
    }

    const data = {
      p_project_id: projectId,
      p_user_name: form.name.value,
      p_user_email: form.email.value,
      p_message: form.feedback.value,
      p_rating: rating,
    };

    setError("");
    setLoading(true);

    try {
      const { data: returnedData, error } = await supabase.rpc("add_feedback", data);

      if (error) {
        console.error("Error submitting feedback:", error.message);
        setError("Feedback could not be submitted. Please try again.");
        return;
      }

      setSubmitted(true);
      console.log("Feedback submitted successfully:", returnedData);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Feedback could not be submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{tailwindStyles}</style>
      <style>{widgetStyles}</style>
      <div
        className={`widget nexx-widget nexx-launcher-wrap ${
          positionClasses[position] || positionClasses["bottom-right"]
        }`}
        style={themeStyle}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="nexx-launcher" aria-label={open ? "Close feedback form" : buttonLabel}>
              {open ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <span>◊</span>
              )}
              <span className="nexx-launcher-label">{buttonLabel}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="widget nexx-widget nexx-panel p-0"
            side={popoverSides[position] || "left"}
            align="center"
            sideOffset={10}
            style={themeStyle}
          >
            <style>{tailwindStyles}</style>
            <style>{widgetStyles}</style>
            <div className="nexx-panel-header">
              <div className="nexx-icon-badge">
                {submitted ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <MessageCircle aria-hidden="true" className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="nexx-title">{submitted ? successTitle : title}</h3>
                <p className="nexx-description">
                  {submitted ? successMessage : description}
                </p>
              </div>
            </div>
            {submitted ? (
              <div className="nexx-success">
                <div className="nexx-success-card">
                  <CheckCircle2 aria-hidden="true" className="nexx-success-icon mb-2 h-6 w-6" />
                  <p className="nexx-description">
                    You can close this panel and continue browsing.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <form className="nexx-form" onSubmit={submit}>
                  <div className="nexx-field-grid">
                    <div className="nexx-field">
                      <Label htmlFor="name" className="nexx-label">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        placeholder="Your name"
                        className="nexx-input"
                        required
                      />
                    </div>
                    <div className="nexx-field">
                      <Label htmlFor="email" className="nexx-label">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="nexx-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="nexx-field">
                    <Label htmlFor="feedback" className="nexx-label">Feedback</Label>
                    <Textarea
                      id="feedback"
                      name="feedback"
                      placeholder="What should we improve?"
                      className="nexx-input min-h-[118px] resize-none"
                      required
                    />
                  </div>
                  <div className="nexx-actions">
                    <div className="nexx-stars" role="radiogroup" aria-label="Rating">
                      {[...Array(5)].map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className="nexx-star-button"
                          data-active={rating > index}
                          role="radio"
                          aria-checked={rating === index + 1}
                          aria-label={`${index + 1} star${index === 0 ? "" : "s"}`}
                          onClick={() => onSelectStar(index)}
                        >
                          <Star
                            aria-hidden="true"
                            className="h-5 w-5"
                            fill={rating > index ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>

                    <Button type="submit" disabled={loading} className="nexx-submit">
                      <Send aria-hidden="true" className="h-4 w-4" />
                      {loading ? "Sending" : "Submit"}
                    </Button>
                  </div>
                </form>
                {error ? <div className="nexx-error">{error}</div> : null}
              </>
            )}
            <Separator className="mb-3 bg-[var(--nexx-border)]" />
            <div className="nexx-footer">
              Powered by{" "}
              <a
                href={brandUrl}
                target="_blank"
                rel="noreferrer"
              >
                {brandName}
              </a>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};
