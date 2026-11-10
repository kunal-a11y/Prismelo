import { cn } from "@/lib/utils";
import type { GlyphKey } from "@/lib/services";
import { accents, glyphTone, type Tone } from "@/lib/accents";

const line = "#2a2a2a";
const lineFaint = "#191919";
const lineStrong = "#5c5c5c";

/**
 * Hero composition: a system diagram of concentric fields, connected nodes
 * and measurement marks. Drawn as light-weight SVG, no raster assets.
 */
export function HeroSystemArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 620 560"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" stroke={lineFaint} strokeWidth="1" />
        </pattern>
        <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
        <filter id="hero-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
        <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accents.violet} stopOpacity="0.75" />
          <stop offset="50%" stopColor={accents.cyan} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accents.lime} stopOpacity="0.65" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="620" height="560" fill="url(#hero-grid)" />

      {/* orbit field */}
      <g stroke={line}>
        <circle cx="352" cy="268" r="218" />
        <circle cx="352" cy="268" r="164" stroke={lineFaint} />
        <circle cx="352" cy="268" r="110" />
      </g>
      <circle
        cx="352"
        cy="268"
        r="218"
        stroke="url(#hero-ring)"
        strokeDasharray="2 14"
        strokeLinecap="round"
        className="animate-orbit"
        style={{ transformOrigin: "352px 268px" }}
      />

      {/* coloured light field behind the prism */}
      <g filter="url(#hero-blur)" opacity="0.5">
        <circle cx="300" cy="212" r="74" fill={accents.violet} opacity="0.28" />
        <circle cx="398" cy="312" r="68" fill={accents.cyan} opacity="0.24" />
        <circle cx="352" cy="352" r="54" fill={accents.lime} opacity="0.18" />
      </g>

      {/* connected node graph */}
      <g stroke="url(#hero-fade)" strokeWidth="1">
        <path d="M120 118 L246 196 L246 318 L352 386" />
        <path d="M352 386 L472 330 L510 176" />
        <path d="M246 196 L510 176" stroke={lineFaint} />
        <path d="M120 118 L246 318" stroke={lineFaint} />
        <path d="M120 118 L510 176" stroke={lineFaint} />
        <path d="M352 386 L352 268" />
      </g>

      <g fill="#000" stroke="#8a8a8a">
        <circle cx="120" cy="118" r="4" />
        <circle cx="246" cy="196" r="4" />
        <circle cx="246" cy="318" r="4" />
        <circle cx="352" cy="386" r="4" />
        <circle cx="472" cy="330" r="4" />
        <circle cx="510" cy="176" r="4" />
      </g>
      <g className="pulse-dot">
        <circle cx="120" cy="118" r="3.5" fill={accents.violet} />
        <circle cx="510" cy="176" r="3.5" fill={accents.cyan} />
        <circle cx="352" cy="386" r="3.5" fill={accents.lime} />
      </g>
      <circle cx="352" cy="268" r="6" fill="currentColor" />

      {/* prism form */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M352 168 L448 332 L256 332 Z" />
      </g>
      <g stroke={lineStrong} strokeWidth="1" strokeDasharray="3 5">
        <path d="M352 168 L352 332" />
        <path d="M304 250 L400 250" />
      </g>

      {/* refracted beams */}
      <g fill="none" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        <path d="M448 332 L536 258" stroke={accents.violet} className="beam-flow" />
        <path d="M400 332 L504 356" stroke={accents.cyan} className="beam-flow" />
        <path d="M304 332 L236 394" stroke={accents.lime} className="beam-flow" />
      </g>

      {/* measurement marks */}
      <g stroke="#3d3d3d">
        <path d="M56 56 H84 M56 56 V84" />
        <path d="M564 56 H536 M564 56 V84" />
        <path d="M56 506 H84 M56 506 V478" />
        <path d="M564 506 H536 M564 506 V478" />
      </g>

      <g
        fill="#7a7a7a"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="9"
        letterSpacing="2"
      >
        <text x="56" y="40">PRISMELO / SYSTEMS</text>
        <text x="470" y="536">SECURE BY DESIGN</text>
        <text x="56" y="536">01 — 07</text>
      </g>
    </svg>
  );
}

/**
 * Editorial illustration: three layered planes on a shared axis.
 * The planes draw themselves in, then drift; a pulse travels down the axis and
 * the layers light up in sequence. All motion is CSS, so this stays a server
 * component and quiet for reduced-motion users.
 */
export function LayeredPlanesArt({ className }: { className?: string }) {
  const cx = 252;
  const half = 152;
  const rise = 66;
  const layers = [
    { y: 120, color: accents.violet, label: "EXPERIENCE", delay: "0s" },
    { y: 184, color: accents.cyan, label: "SECURITY", delay: "0.45s" },
    { y: 248, color: accents.lime, label: "INFRASTRUCTURE", delay: "0.9s" },
  ];
  const diamond = (y: number) =>
    `M${cx} ${y} L${cx + half} ${y + rise} L${cx} ${y + rise * 2} L${cx - half} ${y + rise} Z`;

  return (
    <svg
      viewBox="0 0 560 460"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <filter id="stack-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      {/* shared axis and a slow horizontal reference line */}
      <g stroke="#242424">
        <path
          d={`M${cx} 86 V432`}
          strokeDasharray="2 6"
          className="stack-fade"
          style={{ animationDelay: "0.1s" }}
        />
        <path
          d="M16 250 H544"
          stroke="#1b1b1b"
          strokeDasharray="2 9"
          className="animate-dash"
        />
      </g>

      {/* light travelling down the axis, system by system */}
      <circle
        cx={cx}
        cy={100}
        r="2.6"
        fill="#ffffff"
        className="stack-track"
        style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.55))" }}
      />

      {/* soft light behind each layer, staggered so it reads top → bottom */}
      <g filter="url(#stack-blur)" style={{ mixBlendMode: "screen" }}>
        {layers.map((layer, index) => (
          <ellipse
            key={`glow-${layer.label}`}
            cx={cx}
            cy={layer.y + rise}
            rx={half - 26}
            ry={rise - 18}
            fill={layer.color}
            className="stack-glow"
            style={{ animationDelay: `${index * 2.1}s` }}
          />
        ))}
      </g>

      {/* vertical edges tying the stack together */}
      <g stroke="#1e1e1e" strokeWidth="1">
        {[0, 1].map((index) => (
          <g key={`edge-${index}`}>
            <path d={`M${cx - half} ${layers[index].y + rise} V${layers[index + 1].y + rise}`} />
            <path d={`M${cx + half} ${layers[index].y + rise} V${layers[index + 1].y + rise}`} />
          </g>
        ))}
      </g>

      {layers.map((layer, index) => (
        <g
          key={layer.label}
          className="stack-drift"
          style={{ animationDelay: `${index * 1.4}s` }}
        >
          <g>
            <path
              d={diamond(layer.y)}
              fill="#050505"
              fillOpacity="0.72"
              stroke={layer.color}
              strokeOpacity="0.78"
              strokeWidth="1.2"
              strokeLinejoin="round"
              pathLength={1}
              className="stack-draw"
              style={{ animationDelay: layer.delay }}
            />

            {/* apex + side nodes */}
            <g
              className="stack-fade"
              style={{ animationDelay: `calc(${layer.delay} + 0.9s)` }}
            >
              <circle cx={cx} cy={layer.y} r="3.4" fill={layer.color} />
              <circle cx={cx} cy={layer.y} r="7" fill={layer.color} opacity="0.16" />
              <circle cx={cx - half} cy={layer.y + rise} r="2" fill={layer.color} opacity="0.55" />
              <circle cx={cx + half} cy={layer.y + rise} r="2" fill={layer.color} opacity="0.55" />
            </g>

            {/* connector into the label */}
            <path
              d={`M${cx + half + 8} ${layer.y + rise} H${cx + half + 24}`}
              stroke={layer.color}
              strokeOpacity="0.4"
              className="stack-fade"
              style={{ animationDelay: `calc(${layer.delay} + 1s)` }}
            />
            <text
              x={cx + half + 32}
              y={layer.y + rise + 3.5}
              fill="#8e8e8e"
              fontFamily="var(--font-geist-mono), monospace"
              fontSize="8.5"
              letterSpacing="1.5"
              className="stack-label"
              style={{ animationDelay: `calc(${layer.delay} + 1.05s)` }}
            >
              {layer.label}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

const beamRays = [
  { d: "M352 226 L810 84" },
  { d: "M362 250 L812 196" },
  { d: "M366 274 L812 330" },
  { d: "M356 298 L790 452" },
];

const beamRayGradients = [
  { id: "prism-ray-violet", color: accents.violet },
  { id: "prism-ray-cyan", color: accents.cyan },
  { id: "prism-ray-lime", color: accents.lime },
  { id: "prism-ray-rose", color: accents.rose },
];

/**
 * Prism split: a single beam entering a prism and leaving as four spectral
 * rays. Decorative hero backdrop, drawn so no raster asset is needed.
 */
export function HeroBeamArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 820 520"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id="prism-in" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor={accents.violet} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="prism-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="55%" stopColor={accents.violet} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accents.cyan} stopOpacity="0.7" />
        </linearGradient>
        {beamRayGradients.map(({ id, color }) => (
          <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="45%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* measurement rings behind the split */}
      <g stroke="#26262d" className="prism-beam__rings">
        <circle cx="330" cy="262" r="196" />
        <circle cx="330" cy="262" r="148" strokeDasharray="2 12" />
        <circle cx="330" cy="262" r="104" />
      </g>

      {/* incoming beam */}
      <path
        d="M0 250 H288"
        stroke="url(#prism-in)"
        strokeWidth="1.6"
        strokeDasharray="18 7"
        className="prism-beam__in"
      />

      {/* prism body */}
      <path d="M330 118 L466 344 L194 344 Z" fill="#07070a" fillOpacity="0.9" />
      <path
        d="M330 118 L466 344 L194 344 Z"
        stroke="url(#prism-edge)"
        strokeWidth="1.1"
        className="prism-beam__edge"
      />
      <path
        d="M330 118 L330 344"
        stroke="#ffffff"
        strokeOpacity="0.06"
      />

      {/* refracted rays */}
      <g strokeWidth="1.3" strokeLinecap="round">
        {beamRays.map((ray, index) => (
          <path
            key={ray.d}
            d={ray.d}
            stroke={`url(#${beamRayGradients[index].id})`}
            className="prism-beam__ray"
            style={{ animationDelay: `${index * 0.55}s` }}
          />
        ))}
      </g>

      {/* dust */}
      <g fill="#5a5a66" className="prism-beam__dust">
        <circle cx="520" cy="180" r="1.2" />
        <circle cx="612" cy="248" r="1" />
        <circle cx="548" cy="352" r="1.3" />
        <circle cx="700" cy="300" r="1" />
        <circle cx="436" cy="128" r="1" />
        <circle cx="660" cy="132" r="1.1" />
      </g>
    </svg>
  );
}

/**
 * Founder profile plate: initials in a ring on a measured grid. The ring
 * rotates, a halo pulses outward and the grid breathes. A portrait, when one is
 * available, is layered over the circle by the page.
 */
export function FounderProfileArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 360"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <radialGradient id="founder-halo" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor={accents.violet} stopOpacity="0.3" />
          <stop offset="55%" stopColor={accents.cyan} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accents.cyan} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="150" cy="180" r="140" fill="url(#founder-halo)" />

      <g stroke="#1b1b1b" className="founder-mono">
        <path d="M0 90 H300 M0 180 H300 M0 270 H300" />
        <path d="M60 0 V360 M150 0 V360 M240 0 V360" />
      </g>

      <circle
        cx="150"
        cy="180"
        r="124"
        stroke="#2c2c2c"
        strokeDasharray="2 10"
        className="founder-ring"
      />
      <circle cx="150" cy="180" r="96" stroke="#2c2c2c" />
      <circle
        cx="150"
        cy="180"
        r="96"
        stroke={accents.violet}
        strokeOpacity="0.4"
        className="founder-ping"
      />

      <g stroke="#4a4a4a" className="founder-tick">
        <path d="M150 56 V92 M150 268 V304 M60 180 H96 M204 180 H240" />
      </g>
      <path d="M150 284 L196 330 L104 330 Z" stroke="#3a3a3a" className="founder-trail" />
    </svg>
  );
}

/** Company ecosystem diagram — root node with one active company and room to grow. */
export function EcosystemArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 380"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <g stroke="#1e1e1e">
        <path d="M0 96 H720" />
        <path d="M0 284 H720" />
      </g>
      <g stroke="#2c2c2c">
        <path d="M150 190 H310" />
        <path d="M470 190 H560" stroke={accents.violet} strokeDasharray="3 6" strokeOpacity="0.7" />
      </g>
      <path d="M150 190 H310" stroke={accents.cyan} strokeWidth="1.2" className="beam-flow" strokeOpacity="0.8" />

      {/* root */}
      <g>
        <rect x="30" y="150" width="120" height="80" stroke="#5a5a5a" fill="#050505" />
        <text
          x="46"
          y="184"
          fill="currentColor"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="10"
          letterSpacing="2"
        >
          PRISMELO
        </text>
        <text
          x="46"
          y="204"
          fill="#6e6e6e"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="8"
          letterSpacing="1.4"
        >
          PARENT
        </text>
      </g>

      {/* active company */}
      <g>
        <rect x="310" y="138" width="160" height="104" stroke="#8a8a8a" fill="#0a0a0a" />
        <circle cx="330" cy="158" r="3" fill={accents.lime} className="pulse-dot" />
        <text
          x="342"
          y="162"
          fill="currentColor"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="9"
          letterSpacing="1.4"
        >
          ACTIVE
        </text>
        <text
          x="326"
          y="192"
          fill="currentColor"
          fontFamily="var(--font-geist-sans), sans-serif"
          fontSize="15"
        >
          HirenextAI
        </text>
        <text
          x="326"
          y="214"
          fill="#777"
          fontFamily="var(--font-geist-mono), monospace"
          fontSize="8"
          letterSpacing="1.2"
        >
          AI / RECRUITMENT
        </text>
      </g>

      {/* future slots */}
      <g stroke="#303030" strokeDasharray="3 5" className="glyph-breathe">
        <rect x="560" y="150" width="130" height="80" />
      </g>
      <text
        x="576"
        y="188"
        fill="#5a5a5a"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="8"
        letterSpacing="1.2"
      >
        FUTURE COMPANY
      </text>
      <text
        x="576"
        y="204"
        fill="#3d3d3d"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="8"
        letterSpacing="1.2"
      >
        NOT ANNOUNCED
      </text>
    </svg>
  );
}

const glyphs: Record<GlyphKey, React.ReactNode> = {
  pentest: (
    <>
      <circle cx="200" cy="200" r="128" stroke="#2a2a2a" className="glyph-dash" />
      <circle cx="200" cy="200" r="86" stroke="#3a3a3a" />
      <circle cx="200" cy="200" r="12" fill="currentColor" className="glyph-pulse" />
      <g stroke="#5c5c5c">
        <path d="M200 30 V104 M200 296 V370 M30 200 H104 M296 200 H370" />
      </g>
      <g stroke="currentColor" strokeWidth="1.3">
        <path d="M200 200 L302 98" className="glyph-pulse" />
        <path d="M200 200 L318 240" className="glyph-pulse" style={{ animationDelay: "0.9s" }} />
        <path d="M200 200 L140 322" className="glyph-pulse" style={{ animationDelay: "1.8s" }} />
      </g>
      <g fill="#000" stroke="#9a9a9a">
        <circle cx="302" cy="98" r="5" />
        <circle cx="318" cy="240" r="5" />
        <circle cx="140" cy="322" r="5" />
      </g>
      <rect x="288" y="84" width="28" height="28" stroke="#333" strokeDasharray="2 4" />
    </>
  ),
  cloud: (
    <>
      <g stroke="#2f2f2f" className="glyph-breathe">
        <rect x="96" y="96" width="208" height="52" />
        <rect x="96" y="174" width="208" height="52" />
        <rect x="96" y="252" width="208" height="52" />
      </g>
      <g stroke="#4a4a4a">
        <path d="M124 96 V304 M152 96 V304" />
      </g>
      <g stroke="currentColor">
        <path d="M200 96 V304" strokeDasharray="2 5" />
      </g>
      <g fill="currentColor" className="glyph-pulse">
        <circle cx="200" cy="96" r="3" />
        <circle cx="200" cy="200" r="3" />
        <circle cx="200" cy="304" r="3" />
      </g>
      <g stroke="#333" strokeDasharray="2 5" className="glyph-flow">
        <path d="M304 122 H360 M304 200 H360 M304 278 H360" />
      </g>
      <circle cx="372" cy="200" r="24" stroke="#5c5c5c" className="glyph-dash" />
      <circle cx="372" cy="200" r="4" fill="currentColor" />
    </>
  ),
  software: (
    <>
      <g stroke="#333">
        <rect x="60" y="176" width="70" height="48" />
        <rect x="272" y="96" width="70" height="48" />
        <rect x="272" y="256" width="70" height="48" />
        <rect x="272" y="176" width="70" height="48" stroke="#666" />
      </g>
      <g stroke="#5c5c5c">
        <path d="M130 200 H200 V120 H272" />
        <path d="M200 200 H272" />
        <path d="M200 200 V280 H272" />
      </g>
      <g fill="currentColor" className="glyph-pulse">
        <circle cx="200" cy="200" r="4" />
        <circle cx="130" cy="200" r="3" />
        <circle cx="342" cy="120" r="3" />
        <circle cx="342" cy="200" r="3" />
        <circle cx="342" cy="280" r="3" />
      </g>
      <g stroke="#252525">
        <path d="M60 260 H130 V304" />
      </g>
    </>
  ),
  ai: (
    <>
      <g stroke="#2c2c2c">
        <circle cx="200" cy="200" r="140" />
        <circle cx="200" cy="200" r="96" strokeDasharray="3 6" className="glyph-spin" />
      </g>
      <g stroke="#5a5a5a">
        <path d="M200 60 L200 340" />
        <path d="M80 140 L320 260" />
        <path d="M320 140 L80 260" />
      </g>
      <g fill="#000" stroke="#8f8f8f" className="glyph-pulse">
        <circle cx="200" cy="60" r="5" />
        <circle cx="200" cy="340" r="5" />
        <circle cx="80" cy="140" r="5" />
        <circle cx="320" cy="260" r="5" />
        <circle cx="320" cy="140" r="5" />
        <circle cx="80" cy="260" r="5" />
      </g>
      <g stroke="currentColor" strokeWidth="1.3">
        <path d="M200 148 L246 200 L200 252 L154 200 Z" className="glyph-breathe" />
      </g>
      <circle cx="200" cy="200" r="3" fill="currentColor" />
    </>
  ),
  consulting: (
    <>
      <g stroke="#242424" className="glyph-breathe">
        <path d="M60 80 H340 M60 140 H340 M60 200 H340 M60 260 H340 M60 320 H340" />
        <path d="M60 80 V320 M130 80 V320 M200 80 V320 M270 80 V320 M340 80 V320" />
      </g>
      <g fill="#5f5f5f">
        <circle cx="130" cy="140" r="2.5" />
        <circle cx="270" cy="140" r="2.5" />
        <circle cx="200" cy="260" r="2.5" />
      </g>
      <path
        d="M60 320 L130 260 L200 260 L270 200 L340 140"
        stroke="currentColor"
        strokeWidth="1.3"
        pathLength={1}
        className="glyph-trace"
      />
      <g fill="#000" stroke="currentColor" className="glyph-pulse">
        <circle cx="60" cy="320" r="4" />
        <circle cx="200" cy="260" r="4" />
        <circle cx="340" cy="140" r="4" />
      </g>
      <rect x="298" y="98" width="42" height="42" stroke="#3a3a3a" strokeDasharray="2 4" />
    </>
  ),
  security: (
    <>
      <g stroke="#333">
        <path d="M200 54 L304 114 V234 L200 294 L96 234 V114 Z" />
        <path d="M200 92 L268 131 V217 L200 256 L132 217 V131 Z" stroke="#5c5c5c" className="glyph-breathe" />
      </g>
      <g stroke="#2a2a2a">
        <path d="M96 114 L304 234 M304 114 L96 234" />
      </g>
      <circle cx="200" cy="174" r="20" stroke="currentColor" className="glyph-pulse" />
      <path d="M200 194 V212" stroke="currentColor" strokeWidth="2" />
      <g fill="#6b6b6b">
        <circle cx="200" cy="54" r="2.5" />
        <circle cx="96" cy="234" r="2.5" />
        <circle cx="304" cy="234" r="2.5" />
      </g>
    </>
  ),
  web: (
    <>
      <rect x="70" y="84" width="260" height="196" stroke="#3a3a3a" className="glyph-breathe" />
      <path d="M70 122 H330" stroke="#333" />
      <g fill="#6e6e6e" className="glyph-pulse">
        <circle cx="86" cy="103" r="2.5" />
        <circle cx="96" cy="103" r="2.5" />
        <circle cx="106" cy="103" r="2.5" />
      </g>
      <g stroke="#242424">
        <path d="M96 146 H200 M96 166 H170 M96 210 H250 M96 230 H214" />
      </g>
      <rect x="248" y="146" width="62" height="48" stroke="#4a4a4a" strokeDasharray="2 4" />
      <g stroke="currentColor">
        <path d="M200 280 V330" />
      </g>
      <rect x="152" y="280" width="200" height="72" stroke="#5a5a5a" fill="#050505" />
      <g stroke="#2a2a2a">
        <path d="M180 312 H250 M180 328 H310" />
      </g>
    </>
  ),
};

export function ServiceGlyph({
  glyph,
  className,
  tone,
}: {
  glyph: GlyphKey;
  className?: string;
  tone?: Tone;
}) {
  const resolved = tone ?? glyphTone[glyph];

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      style={{ color: resolved === "neutral" ? undefined : accents[resolved] }}
      className={cn("glyph-glow h-auto w-full", className)}
    >
      {glyphs[glyph]}
    </svg>
  );
}

const spectrum = [
  accents.rose,
  accents.cyan,
  accents.violet,
  accents.lime,
  accents.amber,
  accents.cyan,
  accents.violet,
];

/**
 * Animated prism: a white beam enters, seven coloured beams fan out.
 * `active` highlights one beam (used by the interactive spectrum section).
 */
export function PrismBeamArt({
  className,
  active = null,
}: {
  className?: string;
  active?: number | null;
}) {
  const colors = spectrum;

  return (
    <svg
      viewBox="0 0 620 460"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <filter id="prism-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <linearGradient id="prism-beam-in" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <g stroke="#1c1c1c">
        <path d="M0 60 H620" />
        <path d="M0 400 H620" />
        <path d="M560 40 V420" strokeDasharray="2 8" />
      </g>

      <g filter="url(#prism-blur)" opacity="0.55">
        {colors.map((color, index) => (
          <circle
            key={`glow-${index}`}
            cx={520}
            cy={110 + index * 38}
            r={active === index ? 34 : 20}
            fill={color}
            opacity={active === null ? 0.26 : active === index ? 0.7 : 0.12}
            style={{ transition: "opacity 500ms ease, r 500ms ease" }}
          />
        ))}
      </g>

      {/* incoming beam */}
      <path d="M40 230 H240" stroke="url(#prism-beam-in)" strokeWidth="2" className="beam-flow" />

      {/* prism */}
      <g stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M240 168 L372 392 L108 392 Z" fill="#040404" />
      </g>
      <path d="M240 168 L240 392" stroke="#3a3a3a" strokeDasharray="3 6" />
      <circle cx="240" cy="230" r="3.5" fill="#ffffff" />

      {/* refracted beams */}
      {colors.map((color, index) => {
        const y = 110 + index * 38;
        const dim = active !== null && active !== index;
        return (
          <g key={`beam-${index}`} opacity={dim ? 0.16 : 1} style={{ transition: "opacity 500ms ease" }}>
            <path
              d={`M250 300 L560 ${y}`}
              stroke={color}
              strokeWidth={active === index ? 2.2 : 1.2}
              strokeLinecap="round"
              className="beam-flow"
            />
            <circle cx={560} cy={y} r={active === index ? 5 : 3} fill={color} />
            <text
              x={572}
              y={y + 3.5}
              fill={color}
              fontSize="8"
              letterSpacing="1.6"
              fontFamily="var(--font-geist-mono), monospace"
              opacity="0.8"
            >
              {String(index + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}

      <g fill="#5c5c5c" fontSize="9" letterSpacing="2" fontFamily="var(--font-geist-mono), monospace">
        <text x="40" y="40">SPECTRUM / 01—07</text>
        <text x="40" y="432">WHITE LIGHT IN</text>
      </g>
      <g fill="#ffffff" fontSize="9" letterSpacing="2" fontFamily="var(--font-geist-mono), monospace" opacity="0.7">
        <text x="452" y="432">DISCIPLINES OUT</text>
      </g>
    </svg>
  );
}

/** Small abstract mark used in the process section. */
export function ProcessAxisArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
    >
      <circle cx="150" cy="150" r="110" stroke="#252525" className="glyph-breathe" />
      <circle cx="150" cy="150" r="74" stroke="#1c1c1c" />
      <g stroke="#4a4a4a">
        <path d="M150 40 V110 M150 190 V260 M40 150 H110 M190 150 H260" />
      </g>
      <path
        d="M150 96 L204 150 L150 204 L96 150 Z"
        stroke="currentColor"
        pathLength={1}
        className="glyph-trace"
      />
      <circle cx="150" cy="150" r="3" fill="currentColor" className="pulse-dot" />
      <g fill="#5a5a5a" className="glyph-pulse">
        <circle cx="150" cy="40" r="2.5" />
        <circle cx="260" cy="150" r="2.5" />
        <circle cx="150" cy="260" r="2.5" />
        <circle cx="40" cy="150" r="2.5" />
      </g>
    </svg>
  );
}
