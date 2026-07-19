# Design system — Syntheon Hub

## Voice

Talk · Work · Done. Precise, calm, inevitable.

## Color

Strategy: restrained monochrome on near-black.

| Token           | Value                         |
| --------------- | ----------------------------- |
| `--lp-bg`       | `#050505`                     |
| `--lp-ink`      | `#ffffff`                     |
| `--lp-muted`    | `rgba(255,255,255,0.45–0.55)` |
| `--lp-hairline` | `rgba(255,255,255,0.06–0.12)` |
| `--lp-surface`  | `rgba(255,255,255,0.02–0.04)` |

No purple glow. No cream/terracotta. Accent = white on black.

Dark app theme maps to the same canvas (`--background: #050505`, hairline borders, white primary).

## Typography

One family across brand and product:

| Role                   | Family                                   |
| ---------------------- | ---------------------------------------- |
| All UI + marketing     | Bricolage Grotesque (`--font-bricolage`) |
| Mono only (ticket IDs) | system mono                              |

Letter-spacing floor on display: `-0.03em`. Product titles use fixed rem (not fluid clamp). Hero clamp max ≈ `5.5rem`.

## Product / app (`.app`)

- Shell: near-black canvas, hairline dividers, quiet active nav (surface tint — not solid color fills).
- Density: Apple-like breathing room — large page titles, 13–15px body, KPI numbers ~1.75rem.
- Panels: `.app-panel` with subtle surface lift; avoid tinted card backgrounds (no purple/blue/orange washes).
- Forms: `.app-field` groups label + hint, then `gap-3` before controls — never jam description into pills/inputs.
- Section heads: `.app-section-head` keeps title copy clear of action pills.
- Semantic color only for state (overdue, blocked, done) — never as section decoration.
- Motion: 150–250ms expo ease-out; no page-load choreography.

## Motion

Expo ease-out `[0.16, 1, 0.3, 1]`. Signature (marketing): hero Talk→Work→Done stage cycle. Respect `prefers-reduced-motion`.

## Layout

Hero: brand mark + Talk. Work. Done. + one line + CTA + kinetic stage. Chapters: Talk / Work / Done. Quiet pricing. Final CTA.
