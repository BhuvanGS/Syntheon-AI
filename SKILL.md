---
name: Syntheon-AI Frontend Design

description: Frontend design guidelines and consistency standards for the Syntheon-AI Next.js dashboard.
---

# Syntheon-AI Frontend Design

Use this skill when making any UI or frontend changes in the Syntheon-AI Next.js dashboard.

## Design System

- Use shadcn/ui components and Tailwind CSS utility classes.
- Use the project's custom color tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `foreground`, `background`, `card`.
- Avoid hardcoded hex/rgb colors (e.g. `#16a34a`, `#3d7abf`) unless they are intentional brand colors.
- Prefer `rounded-2xl` for cards, `rounded-xl` for sections, `rounded-lg` for inner blocks, and `rounded-full` for buttons.

## Cards & Surfaces

- Cards, empty states, and list containers should use `bg-muted/50` or `bg-muted/40` for a subtle grey background.
- Header/toolbar bars should use `bg-muted/30`.
- Use `border border-border` or `border-border/60` for subtle borders.
- Add `transition-all` or `transition-colors` to interactive cards.
- Use `hover:border-primary/30` for hover emphasis on interactive cards.

## Typography

- Page headings use `font-playfair`.
- Section labels use `text-xs uppercase tracking-wide text-muted-foreground`.
- Body text uses `text-sm` and `text-foreground`.

## Form Controls

- Always use shadcn/ui `Input`, `Textarea`, `Select`, `Switch`, and `Button` components.
- Do not use raw HTML `<input>` or `<select>` elements.
- Keep form fields inside a `rounded-2xl border border-border bg-card p-6` container.

## Buttons

- Primary actions: `Button` with default variant, `className="rounded-full gap-2"`.
- Secondary actions: `Button variant="outline"` with `rounded-full` or `rounded-lg`.
- Destructive actions: `Button variant="destructive"`.

## Feedback

- Use the `island-toast` system via `const { showToast } = useToast()`.
- Do not use the old `shadcn/ui` `toast` or `sonner` toasts.
- Show success toasts for completed actions, error toasts for failures.
- Loader spinners should be centered with `min-h-[50vh]` and `flex items-center justify-center`.

## Dialogs

- Use shadcn/ui `Dialog` components.
- Dialog content: `DialogContent className="sm:max-w-md border-border bg-background shadow-2xl"`.
- Dialog titles use `font-playfair text-2xl text-foreground`.
- Always provide clear `Cancel` and action buttons in `DialogFooter`.

## Settings UI

- The settings page uses tabs: `integrations`, `organizations`, `preferences`.
- Invite-related UI belongs in the `requests` tab under Organizations.
- Only show invite UI when `allowAccessRequests` is enabled.
- Show revoke/re-invite confirmation dialogs before destructive actions.

## Patterns to Avoid

- Do not use `bg-card` for standard cards anymore; use `bg-muted/*`.
- Do not show raw invite links; use a copy icon with a toast.
- Do not duplicate status badges (e.g., avoid "revoked revoked").
- Do not clear form inputs after successful actions unless explicitly requested.

## Verification

- Run `npx tsc --noEmit` after significant TSX changes.
- Run `pnpm prettier` to format modified files.
- Verify UI manually in the browser for the changed component.
