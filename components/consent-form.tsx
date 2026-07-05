'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ChevronDown,
  FileText,
  Lock,
  Mail,
  Mic,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

const CONSENT_PURPOSES = [
  {
    id: 'account_creation',
    label: 'Account Creation & Authentication',
    icon: Lock,
    what: 'Your name, email address, and profile photo are collected to create and verify your Syntheon Hub account.',
    why: 'To identify you, secure your account, and provide access to the platform.',
    retention:
      'Retained for the duration of your account. Deleted within 30 days of account closure request.',
    required: true,
  },
  {
    id: 'meeting_processing',
    label: 'Meeting Audio & Transcript Processing',
    icon: Mic,
    what: 'Audio recordings and AI-generated transcripts from meetings you join via the Syntheon bot are processed.',
    why: 'To extract action items, generate tickets, and provide meeting summaries.',
    retention: 'Audio retained for 30 days. Transcripts retained for the duration of your account.',
    required: true,
  },
  {
    id: 'ticket_management',
    label: 'Ticket & Project Data',
    icon: FileText,
    what: 'Ticket titles, descriptions, comments, attachments, assignees, and project associations you create are stored.',
    why: 'To provide the core project management functionality of Syntheon Hub.',
    retention:
      'Retained for the duration of your projects. Deleted when you delete the project or ticket.',
    required: true,
  },
  {
    id: 'analytics_usage',
    label: 'Product Usage Analytics',
    icon: BarChart3,
    what: 'Aggregated, anonymized usage metrics (features used, session duration, error rates) are collected.',
    why: 'To improve product performance, fix bugs, and prioritize feature development.',
    retention: 'Aggregated data retained for 24 months. No individual identification possible.',
    required: false,
  },
  {
    id: 'notifications',
    label: 'Email & In-App Notifications',
    icon: Mail,
    what: 'Your email address is used to send product notifications (ticket assignments, meeting summaries, mentions).',
    why: 'To keep you informed of activity relevant to your projects and tickets.',
    retention:
      'Active for the duration of your account. You can unsubscribe from non-critical notifications in Settings.',
    required: false,
  },
] as const;

export interface ConsentFormProps {
  onConsentGiven: (purposes: string[]) => void;
  loading?: boolean;
}

export function ConsentForm({ onConsentGiven, loading }: ConsentFormProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkedPurposes, setCheckedPurposes] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const requiredPurposes = CONSENT_PURPOSES.filter((p) => p.required);
  const allRequiredChecked = requiredPurposes.every((p) => checkedPurposes[p.id]);
  const canSubmit = hasScrolledToBottom && allRequiredChecked && !submitting && !loading;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [hasScrolledToBottom]);

  const togglePurpose = (id: string) => {
    setCheckedPurposes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async () => {
    const selected = CONSENT_PURPOSES.filter((p) => checkedPurposes[p.id]).map((p) => p.id);
    if (!allRequiredChecked) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purposes: selected }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[consent] Failed:', err);
        return;
      }

      onConsentGiven(selected);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground tracking-tight">
          Data Privacy & Consent
        </h1>
        <p className="text-base text-muted-foreground mt-3 font-sans max-w-xl mx-auto">
          Under the Digital Personal Data Protection Act 2023 (India), we need your explicit consent
          before collecting your data.
        </p>
      </div>

      {/* Scrollable consent document */}
      <div
        ref={scrollRef}
        className={cn(
          'relative rounded-2xl border border-border bg-muted/30 overflow-y-auto transition-all',
          'max-h-[70vh] scroll-smooth'
        )}
      >
        <div className="p-6 space-y-6">
          {/* Intro */}
          <section>
            <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-foreground mb-3">
              What data we collect and why
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed font-sans">
              Syntheon Hub processes your personal data to provide meeting transcription, ticket
              management, and project analytics. Below is a clear breakdown of each data category,
              why we collect it, and how long we keep it.
            </p>
          </section>

          {/* Purpose cards */}
          {CONSENT_PURPOSES.map((purpose) => {
            const Icon = purpose.icon;
            const isChecked = !!checkedPurposes[purpose.id];
            return (
              <div
                key={purpose.id}
                className={cn(
                  'rounded-xl border p-5 transition-colors',
                  isChecked ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground">
                        {purpose.label}
                      </h3>
                      {purpose.required && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                          Required
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mt-3">
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          What we collect
                        </span>
                        <p className="text-base text-foreground/80 leading-relaxed font-sans mt-1">
                          {purpose.what}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Why we collect it
                        </span>
                        <p className="text-base text-foreground/80 leading-relaxed font-sans mt-1">
                          {purpose.why}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Retention period
                        </span>
                        <p className="text-base text-foreground/80 leading-relaxed font-sans mt-1">
                          {purpose.retention}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 mt-4 cursor-pointer select-none">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => togglePurpose(purpose.id)}
                        disabled={!hasScrolledToBottom}
                        className="h-5 w-5"
                      />
                      <span className="text-base text-foreground font-sans">
                        I consent to this data processing
                        {!hasScrolledToBottom && (
                          <span className="text-muted-foreground/50 ml-1">
                            (scroll down to enable)
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Rights section */}
          <section className="rounded-xl border border-border bg-background/50 p-5">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground mb-3">
              Your rights under DPDP Act 2023
            </h3>
            <ul className="space-y-2 text-base text-foreground/80 font-sans leading-relaxed">
              <li>
                - <strong>Access:</strong> You can request a copy of all personal data we hold about
                you.
              </li>
              <li>
                - <strong>Correction:</strong> You can request correction of inaccurate personal
                data.
              </li>
              <li>
                - <strong>Erasure:</strong> You can request deletion of your personal data ("right
                to be forgotten").
              </li>
              <li>
                - <strong>Withdrawal:</strong> You can withdraw consent at any time in Settings.
                Withdrawal is as easy as giving consent.
              </li>
              <li>
                - <strong>Grievance:</strong> Contact our Data Protection Officer at
                privacy@syntheon.ai for any concerns.
              </li>
            </ul>
          </section>

          {/* Third-party disclosure */}
          <section className="rounded-xl border border-border bg-background/50 p-5">
            <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground mb-3">
              Third-party processors
            </h3>
            <p className="text-base text-foreground/80 font-sans leading-relaxed">
              We use the following third-party services to process your data. Each has signed Data
              Processing Agreements:
            </p>
            <ul className="space-y-1.5 text-base text-foreground/80 font-sans mt-3">
              <li>
                - <strong>Clerk</strong> — Authentication & user identity (name, email, profile
                photo)
              </li>
              <li>
                - <strong>AWS DynamoDB</strong> — Data storage (tickets, meetings, projects, consent
                records)
              </li>
              <li>
                - <strong>Deepgram</strong> — Speech-to-text transcription (audio data, ephemeral)
              </li>
              <li>
                - <strong>Groq</strong> — AI inference for ticket extraction (transcript text,
                ephemeral)
              </li>
            </ul>
          </section>

          {/* Penalty notice */}
          <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground mb-1">
                  Important
                </h3>
                <p className="text-base text-foreground/80 font-sans leading-relaxed">
                  By checking the boxes above, you provide specific, granular consent under Section
                  6 of the DPDP Act 2023. Your consent record (timestamp, IP address, device ID,
                  consent version) is stored securely and can be accessed in your account settings.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Scroll indicator */}
        {!hasScrolledToBottom && (
          <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-3 flex flex-col items-center gap-1 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted-foreground animate-bounce" />
            <span className="text-xs text-muted-foreground font-sans">
              Scroll to bottom to enable consent
            </span>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full max-w-md h-12 text-base font-semibold"
        >
          {submitting ? 'Recording consent...' : 'I consent — Continue to Syntheon'}
        </Button>
        {!allRequiredChecked && hasScrolledToBottom && (
          <p className="text-sm text-muted-foreground font-sans">
            Please check all required consent boxes to continue
          </p>
        )}
      </div>
    </div>
  );
}
