# Frontend

Everything the visitor sees. Server components by default; client JavaScript is
added only where something has to react to the pointer, scroll or input.

## Where things live

```
app/                    routes (App Router)
  layout.tsx            shell: header, footer, fonts, metadata
  page.tsx              home
  globals.css           design tokens + every animation
  icon.svg              favicon (transparent prism)
  opengraph-image.tsx   generated 1200x630 social card
components/             UI, grouped by area
  section.tsx           Container, Section, SectionHead, Eyebrow, CtaSection
  button.tsx            Button / ButtonLink + sheen and press ripple
  logo.tsx              PrismeloMark, Wordmark, Logo
  art.tsx               inline SVG artwork (hero, planes, prism beam)
  reveal.tsx            scroll reveal + FadeIn + the paint marker
lib/                    content and helpers (site copy, services, accents)
content/                MDX for docs and resources
public/                 images, email logo, social preview
```

## Design system

Monochrome base, white ink, neutral greys, hairline borders. Colour appears only
as small accent dots and tags, defined in `lib/accents.ts` and consumed through
`accentHex()` / `glyphTone` so nothing hard-codes a hex value twice.

Type and spacing utilities live in `app/globals.css`: `t-display`, `t-lead`,
`t-mono`, `t-label`, `page-shell`. Tailwind v4 reads its tokens from the
`@theme` block at the top of that file — change a colour there and the whole
site follows.

## Animations

| Class / component | What it does |
| --- | --- |
| `.hero-word` | Headline words slide up on first paint (transform only) |
| `.reveal` / `Reveal` | Fades a block in when it scrolls into view |
| `.fade-in` / `FadeIn` | Fades in immediately on mount, above the fold |
| `.marquee` | Service strip loop; pauses on hover |
| `.prism-mark` | Header logo float and 180° hover rotation |
| `.btn-sheen` | Light sweep across buttons on hover, ripple on press |

Two rules keep animation from costing performance:

1. Only `transform` and `opacity` are animated, so frames stay on the compositor.
2. `prefers-reduced-motion: reduce` kills every animation and transition in one
   block at the end of `globals.css`.

The headline deliberately does **not** animate opacity: it is fully opaque on
the first frame so it can be the Largest Contentful Paint immediately. Earlier
versions faded it in, which delayed the largest text by about a second.

## Navigation speed

Static routes are prerendered at build time, and `next/link` prefetches the ones
in the viewport, so a click usually swaps content without a network wait.

On top of that, `PagePaintMarker` (in `components/reveal.tsx`, mounted once in
the layout) flips a flag after the first page has rendered. Any reveal mounted
after that came from a navigation, so content already on screen is shown
instantly with `transition: none` instead of fading in a second time. First load
still animates; page changes do not.

## Adding a page

1. Create `app/<route>/page.tsx`.
2. Export `metadata` with a title, description and `alternates.canonical`.
3. Wrap content in `<Section>` and `<Container>` for consistent rhythm.
4. Use `<Reveal>` for below-the-fold blocks and `<FadeIn>` above the fold.

`npm run lint` typechecks, `npm run build` proves the page prerenders.

## Accessibility

Skip link in the layout, focus-visible rings everywhere, `aria-pressed` on the
capability spectrum, `aria-hidden` on duplicated marquee content, and reduced
motion honoured. Form fields are labelled and errors are announced in the
contact and community forms.
