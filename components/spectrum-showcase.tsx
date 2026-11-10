"use client";

import { useEffect, useState } from "react";
import { PrismBeamArt } from "@/components/art";
import { Tag } from "@/components/tag";
import { services } from "@/lib/services";
import { accentHex, glyphTone } from "@/lib/accents";
import { cn } from "@/lib/utils";

/**
 * Interactive capability spectrum: hovering or focusing a discipline
 * highlights its beam in the prism. Cycles gently when untouched.
 */
export function SpectrumShowcase() {
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % services.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [reduced, paused]);

  const activeService = services[active];
  const activeTone = glyphTone[activeService.glyph];

  return (
    <div
      className="grid gap-10 lg:grid-cols-12 lg:gap-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="lg:col-span-5">
        <ul className="border-t border-line">
          {services.map((service, index) => {
            const tone = glyphTone[service.glyph];
            const isActive = index === active;
            return (
              <li key={service.slug}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  className="group relative flex w-full items-center gap-4 border-b border-line py-3.5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-6 w-px bg-transparent transition-colors duration-300",
                    )}
                    style={{ backgroundColor: isActive ? accentHex(tone) : undefined }}
                  />
                  <span className="t-mono text-faint">{service.index}</span>
                  <span
                    className={cn(
                      "flex-1 text-[14px] transition-colors duration-300",
                      isActive ? "text-white" : "text-muted group-hover:text-white",
                    )}
                  >
                    {service.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: accentHex(tone),
                      opacity: isActive ? 1 : 0.25,
                      boxShadow: isActive ? `0 0 12px ${accentHex(tone)}` : "none",
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:col-span-7">
        <div className="relative overflow-hidden border border-line bg-[#040404] p-3 sm:p-4">
          <PrismBeamArt active={active} />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line px-1 pt-3">
            <Tag tone={activeTone}>{activeService.name}</Tag>
            <span className="t-mono text-faint">
              {activeService.index} / 07 · {activeService.eyebrow.replace("Service — ", "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
