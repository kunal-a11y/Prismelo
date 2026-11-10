import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { accentHex, glyphTone } from "@/lib/accents";

/**
 * Infinite service strip. Two identical tracks scroll by 50% so the loop is
 * seamless; the second track is hidden from assistive tech.
 */
export function ServiceTicker() {
  return (
    <div className="marquee border-y border-line bg-[#030303]">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex shrink-0 items-center"
          >
            {services.map((service) => {
              const tone = glyphTone[service.glyph];
              return (
                <li key={`${copy}-${service.slug}`} className="shrink-0">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] md:px-7"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: accentHex(tone),
                        boxShadow: `0 0 10px ${accentHex(tone)}`,
                      }}
                    />
                    <span className="t-mono text-faint">{service.index}</span>
                    <span className="text-[12.5px] tracking-[-0.01em] text-white/85 transition-colors group-hover:text-white">
                      {service.name}
                    </span>
                    <ArrowUpRight
                      className="h-3 w-3 -translate-x-1 text-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
