import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { AlertTriangle, Info, PencilLine } from "lucide-react";
import { CodeBlock } from "@/components/docs/code-block";
import { cn } from "@/lib/utils";

function extractText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in (node as never)) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return "";
}

function Pre({ children }: { children?: ReactNode }) {
  const child = Array.isArray(children) ? children[0] : children;
  const props =
    child && typeof child === "object" && "props" in (child as never)
      ? ((child as { props?: { className?: string; children?: ReactNode } })
          .props ?? {})
      : {};
  const language =
    /language-([\w-]+)/.exec(props.className ?? "")?.[1] ?? "text";
  const code = extractText(props.children ?? children);

  return <CodeBlock code={code} language={language} />;
}

const calloutTones = {
  note: { icon: Info, label: "Note" },
  warning: { icon: AlertTriangle, label: "Important" },
  draft: { icon: PencilLine, label: "Placeholder" },
} as const;

function Callout({
  title,
  tone = "note",
  children,
}: {
  title?: string;
  tone?: keyof typeof calloutTones;
  children: ReactNode;
}) {
  const { icon: Icon, label } = calloutTones[tone] ?? calloutTones.note;

  return (
    <aside
      className={cn(
        "my-6 border border-line bg-[#070707] px-5 py-4",
        tone === "warning" && "border-l-white/70",
        tone === "draft" && "border-dashed",
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        <p className="t-label text-white">{title ?? label}</p>
      </div>
      <div className="mt-3 text-[13.5px] leading-relaxed text-muted [&>*+*]:mt-3 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </aside>
  );
}

function Steps({
  items,
}: {
  items: { title: string; body: string }[];
}) {
  return (
    <ol className="my-7 border-t border-line">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="grid grid-cols-[auto_1fr] gap-5 border-b border-line py-5"
        >
          <span className="t-mono pt-0.5 text-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <p className="text-[14px] text-white">{item.title}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              {item.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function H2({ id, children }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={id} className="group">
      <a href={`#${id}`} className="!no-underline">
        {children}
      </a>
    </h2>
  );
}

function H3({ id, children }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 id={id}>
      <a href={`#${id}`} className="!no-underline">
        {children}
      </a>
    </h3>
  );
}

export const mdxComponents = {
  pre: Pre,
  h2: H2,
  h3: H3,
  Callout,
  Steps,
  CodeBlock,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto border border-line">
      <table {...props} className="!my-0 min-w-[520px]" />
    </div>
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const external = props.href?.startsWith("http");
    return (
      <a
        {...props}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      />
    );
  },
};
