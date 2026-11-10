import { Plus } from "lucide-react";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
            <span className="text-[15px] leading-snug text-white">
              {item.q}
            </span>
            <Plus
              className="mt-0.5 h-4 w-4 shrink-0 text-faint transition-transform duration-300 group-open:rotate-45 group-open:text-white"
              aria-hidden="true"
            />
          </summary>
          <div className="max-w-2xl pb-6 pr-8">
            <p className="t-body text-[14px]">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
