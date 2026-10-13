# b-1-o Portfolio — UI/UX Pro Max Design System

**Purpose:** A personal frontend portfolio that communicates practical UI engineering, product thinking, and creative frontend work to recruiters and potential clients.

**Guidance applied from UI/UX Pro Max:** The repository's Portfolio/Personal reasoning profile recommends a storytelling-driven sequence, motion-driven minimalism, a distinctive personal voice, and avoiding generic template layouts or hiding the work. Style and UX guidance prioritizes consistent visual language, 4.5:1 contrast for ordinary text, keyboard-visible focus, responsive layouts without horizontal overflow, and motion that respects `prefers-reduced-motion`.

## Design direction

Keep the portfolio's recognizable traits: near-black surfaces, liquid glass, custom ripple distortion, WebGL project carousel, Nothing Phone notification sounds, and mono labels. Refine the hierarchy around actual project work instead of replacing the site with a generic landing page.

- **Style:** cinematic minimalism + purposeful glass surfaces + restrained editorial typography.
- **Color:** near-black background, cool white foreground, readable muted copy, a small wine accent. Preserve the existing violet ripple tint as part of the site's established visual effect.
- **Typography:** Inter for display/body text; DM Mono for metadata and system labels.
- **Composition:** hero → selected projects → about → capabilities → services → process → contact.
- **Motion:** retain the custom WebGL ripple and liquid carousel. Use short transform/opacity transitions for cards and controls; do not animate layout dimensions. Respect reduced-motion settings.
- **Accessibility:** visible keyboard focus; sufficiently sized controls; readable body copy; project details close with Escape; meaning is not conveyed by color alone.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#050507` | Page base |
| `--color-foreground` | `#f7f6fa` | Primary text |
| `--color-copy` | `#c8c6d1` | Body copy |
| `--color-muted` | `#a3a1ae` | Secondary labels |
| `--color-line` | `rgba(255,255,255,.17)` | Glass borders |
| `--color-panel` | `rgba(12,12,17,.70)` | Glass panel base |
| `--color-accent` | `#b63d60` | Restrained interaction accent |
| `--radius-card` | `22px` | Cards |
| `--radius-panel` | `28px` | Larger panels |
| `--motion-fast` | `160ms` | Small feedback |
| `--motion-base` | `260ms` | Hover and state transitions |

## Content and credibility rules

- Lead with selected work and concrete problems/features.
- Keep each project description specific and factual; no invented metrics.
- Show the actual technology and integration categories represented in the repositories.
- Clearly separate live demos from repository-only projects.
- Keep the portfolio useful when the GitHub API is unavailable using a local featured-project fallback.
- Use real repository preview images when the source project provides one; keep the existing custom icon artwork as the fallback.

## Pre-delivery checklist

- [ ] Desktop and mobile layout; no horizontal overflow.
- [ ] Contrast and keyboard focus reviewed.
- [ ] Existing sound assets and playback mapping preserved.
- [ ] Ripple distortion and FlexCarousel configuration preserved.
- [ ] GitHub API failure falls back to local curated data.
- [ ] Production build and deployment workflow succeed.
