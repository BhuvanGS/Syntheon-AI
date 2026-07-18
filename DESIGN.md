# Design system — Syntheon Hub (brand)

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

## Typography

One family on the entire landing surface (`.lp`), including nested demos:

| Role                   | Family                                   |
| ---------------------- | ---------------------------------------- |
| All landing text       | Bricolage Grotesque (`--font-bricolage`) |
| Mono only (ticket IDs) | system mono                              |

Letter-spacing floor on display: `-0.03em`. Hero clamp max ≈ `5.5rem`.

## Motion

Expo ease-out `[0.16, 1, 0.3, 1]`. Signature: hero Talk→Work→Done stage cycle. Respect `prefers-reduced-motion`.

## Layout

Hero: brand mark + Talk. Work. Done. + one line + CTA + kinetic stage. Chapters: Talk / Work / Done. Quiet pricing. Final CTA.
