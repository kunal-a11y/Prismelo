export type GlyphKey =
  | "pentest"
  | "cloud"
  | "software"
  | "ai"
  | "consulting"
  | "security"
  | "web";

export type Service = {
  slug: string;
  name: string;
  navLabel: string;
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
  summary: string;
  meta: { label: string; value: string }[];
  notice?: string;
  intro: {
    heading: string;
    paragraphs: string[];
    points?: { title: string; body: string }[];
  };
  capabilities: { title: string; body: string }[];
  process: { title: string; body: string }[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
  glyph: GlyphKey;
};

export const services: Service[] = [
  {
    slug: "penetration-testing",
    name: "Penetration Testing",
    navLabel: "Penetration Testing",
    index: "01",
    eyebrow: "Service — Offensive Security",
    title: "Security testing that ends with a fix, not a PDF.",
    lead: "Authorized, scoped assessment of your applications and APIs — with findings confirmed by hand and remediation guidance your engineers can act on.",
    summary:
      "Authorized application and API security assessments, with validated findings and remediation guidance.",
    meta: [
      { label: "Engagement", value: "Scoped project" },
      { label: "Requirement", value: "Written authorization" },
      { label: "Output", value: "Findings & remediation plan" },
    ],
    notice:
      "All testing is performed only with explicit written authorization from the system owner, within an agreed scope and rules of engagement. Prismelo does not test systems it has not been authorized to test.",
    intro: {
      heading: "Findings you can trust",
      paragraphs: [
        "Automated scanners produce noise. What matters is whether a weakness is actually exploitable, what an attacker could reach from it, and how quickly it can be closed. Our assessments combine tooling with manual testing, then validate every reported finding before it reaches your team.",
        "Testing is planned around your architecture and your risk. We agree scope, timing, test accounts and escalation contacts in writing before anything begins, and we keep a channel open throughout the engagement so nothing is discovered in a report you receive weeks later.",
      ],
      points: [
        {
          title: "Scope agreed in writing",
          body: "Targets, exclusions, timing windows and rules of engagement are documented and signed off before testing starts.",
        },
        {
          title: "Validated, not generated",
          body: "Each finding is reproduced manually and carries evidence, impact and a concrete remediation path.",
        },
      ],
    },
    capabilities: [
      {
        title: "Web application testing",
        body: "Authentication, session handling, authorization boundaries, input handling, business logic and common vulnerability classes across your application surface.",
      },
      {
        title: "API security testing",
        body: "Endpoint enumeration, access control between roles and tenants, token handling, rate limiting, mass assignment and data exposure.",
      },
      {
        title: "Access control review",
        body: "Vertical and horizontal privilege checks — the failures that scanners routinely miss and that matter most in multi-user systems.",
      },
      {
        title: "Business logic testing",
        body: "Abuse of intended workflows: pricing, approvals, quotas, state transitions and anything an attacker can bend without breaking.",
      },
      {
        title: "Vulnerability validation",
        body: "Manual confirmation of scanner output and third-party findings, separating real exploitable issues from noise before they consume engineering time.",
      },
      {
        title: "Remediation guidance & retest",
        body: "Fix guidance written for your stack, a walkthrough with your engineers, and verification of remediated issues where included in scope.",
      },
    ],
    process: [
      {
        title: "Scope & authorization",
        body: "Define targets, exclusions, environments, accounts and escalation paths. Written approval is collected before any active testing.",
      },
      {
        title: "Reconnaissance & mapping",
        body: "Map the application surface, roles, integrations and data flows to focus effort where risk is highest.",
      },
      {
        title: "Manual testing",
        body: "Work through authentication, authorization, injection, logic and infrastructure boundaries with controlled, non-destructive techniques.",
      },
      {
        title: "Validation & triage",
        body: "Reproduce each issue, remove false positives, and rank findings by exploitability and business impact rather than by scanner severity alone.",
      },
      {
        title: "Report & walkthrough",
        body: "Deliver a findings register with evidence and remediation guidance, then review it live with the team that will implement the fixes.",
      },
    ],
    deliverables: [
      "Scope and rules of engagement document signed by both parties",
      "Findings register with severity, evidence and reproduction steps",
      "Per-finding remediation guidance specific to your stack",
      "Executive summary written for non-technical stakeholders",
      "Live walkthrough session with your engineering team",
      "Retest of remediated findings where agreed in scope",
    ],
    faqs: [
      {
        q: "Do you need access to production?",
        a: "Not necessarily. Testing usually runs against a staging environment that mirrors production. When production testing is required, we restrict techniques, agree time windows and work with your team on standby.",
      },
      {
        q: "How is severity decided?",
        a: "We use CVSS as a reference point, then adjust for reachability, required access and business context. A finding's priority reflects what an attacker could realistically do, not only a base score.",
      },
      {
        q: "Will testing disrupt our systems?",
        a: "Testing is planned to be non-destructive. Techniques with a realistic chance of disruption are excluded by default and only used if explicitly authorized and scheduled.",
      },
      {
        q: "Which testing types are out of scope by default?",
        a: "Social engineering, physical intrusion, denial-of-service and testing of third-party systems are excluded unless separately agreed and lawful. We will say so plainly if a request falls outside what we can do.",
      },
      {
        q: "Do you sign NDAs?",
        a: "Yes. We can work under your NDA, and we treat all assessment material as confidential by default.",
      },
    ],
    glyph: "pentest",
  },
  {
    slug: "cloud-hosting",
    name: "Cloud & Hosting",
    navLabel: "Cloud & Hosting",
    index: "02",
    eyebrow: "Service — Infrastructure",
    title: "Infrastructure that stays quiet.",
    lead: "Planning, deployment and operation of hosting architecture built for uptime — designed around your workloads instead of a template.",
    summary:
      "Infrastructure planning, deployment and hosting architecture built for reliable, understandable operation.",
    meta: [
      { label: "Engagement", value: "Advisory or build" },
      { label: "Scope", value: "Single service to full stack" },
      { label: "Output", value: "Architecture & runbook" },
    ],
    notice:
      "Prismelo does not currently sell a public hosting product. Cloud and hosting work is delivered as an engineering service for specific engagements.",
    intro: {
      heading: "Boring infrastructure, deliberately",
      paragraphs: [
        "Good infrastructure is the part nobody talks about. We design environments that are simple enough to reason about, documented well enough to hand over, and instrumented well enough that problems surface before your users find them.",
        "That means starting from real constraints — traffic shape, data residency, team size, budget and the systems you already run — rather than deploying a reference architecture that looks impressive and costs more than it needs to.",
      ],
      points: [
        {
          title: "Right-sized by design",
          body: "Environments sized to actual demand, with a clear path to scale instead of unused capacity.",
        },
        {
          title: "Documented for handover",
          body: "Architecture, access and recovery procedures written down, so your team is not dependent on ours.",
        },
      ],
    },
    capabilities: [
      {
        title: "Infrastructure planning",
        body: "Compute, networking, storage and data layout planned against your workload profile, budget and compliance constraints.",
      },
      {
        title: "Deployment & CI/CD",
        body: "Repeatable build and release pipelines with environment separation, previews where useful and rollback that works.",
      },
      {
        title: "Server & runtime management",
        body: "Runtime configuration, process supervision, TLS, caching layers and routine maintenance handled with clear conventions.",
      },
      {
        title: "Observability",
        body: "Logs, metrics, traces and alerting that answer 'is it healthy?' in one place, with alerts tuned to avoid fatigue.",
      },
      {
        title: "Backup & recovery",
        body: "Backup schedules, retention and restore drills documented and tested — recovery plans that have actually been run.",
      },
      {
        title: "Reliability & cost review",
        body: "Failure-mode review, capacity checks and spend analysis, with concrete changes ranked by impact.",
      },
    ],
    process: [
      {
        title: "Discovery",
        body: "Understand workloads, traffic patterns, data sensitivity, team capacity and existing spend.",
      },
      {
        title: "Reference architecture",
        body: "Produce a documented design with trade-offs, costs and the operational burden of each component.",
      },
      {
        title: "Provision & deploy",
        body: "Build the environment through code and pipelines where possible, so it can be recreated rather than repaired.",
      },
      {
        title: "Migration & cutover",
        body: "Move traffic in controlled steps with rollback points and verification at each stage.",
      },
      {
        title: "Handover",
        body: "Deliver runbooks, monitoring and a walkthrough so your team owns the environment confidently.",
      },
    ],
    deliverables: [
      "Architecture diagram and decision notes",
      "Infrastructure and deployment configuration in version control",
      "Environment separation with documented promotion path",
      "Monitoring, logging and alert routing",
      "Backup and restore procedure, tested at least once",
      "Operational runbook covering routine and incident tasks",
    ],
    faqs: [
      {
        q: "Which cloud providers do you work with?",
        a: "We are provider-agnostic and choose based on fit: existing commitments, workload shape, team familiarity and cost. Common environments include AWS, Cloudflare, Vercel and conventional Linux hosting.",
      },
      {
        q: "Can you manage hosting for us on an ongoing basis?",
        a: "Ongoing operational support is agreed per engagement. It is not a packaged hosting product, and we will be explicit about what is and is not covered.",
      },
      {
        q: "Can you take over an existing setup?",
        a: "Yes. We start with an audit of what exists, document it, then improve incrementally rather than rebuilding for its own sake.",
      },
      {
        q: "Do you handle migrations without downtime?",
        a: "Where the architecture allows it, yes — with staged cutovers and rollback plans. We will tell you honestly when a maintenance window is the safer option.",
      },
    ],
    glyph: "cloud",
  },
  {
    slug: "software-development",
    name: "Software Development",
    navLabel: "Software Development",
    index: "03",
    eyebrow: "Service — Engineering",
    title: "Software built to be maintained.",
    lead: "Custom systems, APIs and internal tools engineered with as much care for the codebase as for the launch date.",
    summary:
      "Custom software, backend systems, API design and integrations built for long-term maintenance.",
    meta: [
      { label: "Engagement", value: "Project or retainer" },
      { label: "Scope", value: "Product, platform or system" },
      { label: "Output", value: "Shipped software & docs" },
    ],
    intro: {
      heading: "The launch is the midpoint",
      paragraphs: [
        "Most software problems are maintenance problems wearing a launch costume. We build with that in mind: clear module boundaries, typed interfaces, tests around the paths that matter, and documentation that explains decisions rather than restating code.",
        "Work is delivered in increments you can review and use, not a single handover at the end. You see the system take shape, and course corrections stay cheap.",
      ],
      points: [
        {
          title: "Incremental delivery",
          body: "Working software at each stage, reviewed against agreed acceptance criteria.",
        },
        {
          title: "You own everything",
          body: "Code, infrastructure configuration and documentation are handed over fully, in your repositories.",
        },
      ],
    },
    capabilities: [
      {
        title: "Backend systems",
        body: "Services, data models, authentication, background jobs and the operational concerns that keep them dependable.",
      },
      {
        title: "Frontend applications",
        body: "Typed, component-driven interfaces that stay coherent as features accumulate rather than drifting into inconsistency.",
      },
      {
        title: "API design & integration",
        body: "Versioned APIs and third-party integrations with explicit contracts, error handling and retry behavior.",
      },
      {
        title: "Internal tools",
        body: "Operational interfaces and automation that remove manual work from the teams running your business.",
      },
      {
        title: "Modernisation",
        body: "Untangling legacy paths incrementally — with tests in place first, so improvement does not become risk.",
      },
      {
        title: "Maintenance & performance",
        body: "Ongoing fixes, dependency work, profiling and the unglamorous improvements that compound over time.",
      },
    ],
    process: [
      {
        title: "Problem definition",
        body: "Agree what the software must do, who uses it and how success will be judged — before architecture is chosen.",
      },
      {
        title: "Architecture & plan",
        body: "Set system boundaries, data model, technology choices and a delivery sequence with checkpoints.",
      },
      {
        title: "Build in increments",
        body: "Ship reviewable slices with tests, code review and a running environment from early on.",
      },
      {
        title: "Quality gates",
        body: "Type checking, automated tests, accessibility and performance checks applied to the flows that carry real weight.",
      },
      {
        title: "Handover & support",
        body: "Documentation, walkthrough and an agreed support period so the team taking over is not guessing.",
      },
    ],
    deliverables: [
      "Full source code committed to your repository",
      "Architecture and technical decision notes",
      "Automated tests for core business flows",
      "Environment setup and deployment pipeline",
      "API and integration documentation",
      "Handover walkthrough with your team",
    ],
    faqs: [
      {
        q: "Do you work with existing codebases?",
        a: "Yes. We start with a short technical review, agree the highest-value work, and improve the codebase in place where that is safer than a rewrite.",
      },
      {
        q: "Who owns the code?",
        a: "You do. Work is delivered in your repository with full rights and no lock-in to our tooling.",
      },
      {
        q: "What stack do you use?",
        a: "Primarily TypeScript across the stack — Next.js and React on the web, Node-based services and PostgreSQL or equivalent data stores — chosen per project rather than imposed.",
      },
      {
        q: "Can you work alongside our team?",
        a: "Yes. We can own a workstream, pair with in-house engineers, or operate in a review capacity depending on what is useful.",
      },
    ],
    glyph: "software",
  },
  {
    slug: "ai-solutions",
    name: "AI Solutions",
    navLabel: "AI Solutions",
    index: "04",
    eyebrow: "Service — Applied AI",
    title: "AI where it earns its place.",
    lead: "Applied AI features, integrations and workflow automation — built around a defined task, measured against a baseline, and honest about the limits.",
    summary:
      "Applied AI features, workflow automation and integrations designed around measurable tasks.",
    meta: [
      { label: "Engagement", value: "Discovery, then build" },
      { label: "Scope", value: "Feature or workflow" },
      { label: "Output", value: "Integration & evaluation" },
    ],
    intro: {
      heading: "Start with the task, not the model",
      paragraphs: [
        "AI is useful when it is attached to a specific job with a clear definition of done. We begin with that job: what the current process costs, where it fails, and whether a model actually improves it. Sometimes the answer is a simpler piece of software — and we will say so.",
        "When AI is the right tool, the work becomes engineering: retrieval that grounds outputs in your data, guardrails for the failure paths, and evaluation that gives you evidence rather than a demo.",
      ],
      points: [
        {
          title: "Measured against a baseline",
          body: "Every use case is compared with the current process on accuracy, time and cost.",
        },
        {
          title: "Designed for failure",
          body: "Confidence thresholds, human review and fallbacks are part of the design, not an afterthought.",
        },
      ],
    },
    capabilities: [
      {
        title: "AI feature design",
        body: "Scoping the task, choosing the approach, and defining success criteria before a line of integration code is written.",
      },
      {
        title: "LLM integration",
        body: "Server-side model integration with structured outputs, streaming where it helps, and provider abstraction that avoids lock-in.",
      },
      {
        title: "Retrieval & grounding",
        body: "Connecting models to your own documents and data with retrieval, citations and access rules that respect permissions.",
      },
      {
        title: "Workflow automation",
        body: "Replacing repetitive manual steps — classification, extraction, drafting, triage — with reviewable automation.",
      },
      {
        title: "Evaluation & guardrails",
        body: "Test sets, scoring and regression checks, plus input/output validation and prompt-injection defenses.",
      },
      {
        title: "Cost & latency engineering",
        body: "Caching, routing and model selection tuned to keep operating costs and response times predictable.",
      },
    ],
    process: [
      {
        title: "Task selection",
        body: "Identify a workflow with a real cost and a measurable outcome. Establish the non-AI baseline first.",
      },
      {
        title: "Feasibility & risk",
        body: "Review data availability, privacy constraints, failure impact and what 'good enough' actually means.",
      },
      {
        title: "Prototype",
        body: "Build the narrowest version that can be evaluated on real examples from your workload.",
      },
      {
        title: "Evaluation",
        body: "Score results against the baseline, document failure modes, and decide whether to continue, adjust or stop.",
      },
      {
        title: "Production integration",
        body: "Ship with guardrails, logging, cost monitoring and a human-review path for uncertain outputs.",
      },
    ],
    deliverables: [
      "Use case definition with measurable success criteria",
      "Working integration in your application or workflow",
      "Evaluation set and results against the baseline",
      "Guardrails, fallback behavior and review path",
      "Operating notes covering cost, latency and known limits",
    ],
    faqs: [
      {
        q: "Can AI handle our specific process?",
        a: "Sometimes. It depends on the data, the tolerance for error and how the output is checked. We assess this on real examples before recommending a build.",
      },
      {
        q: "Where does our data go?",
        a: "Model providers, retention settings and data handling are agreed explicitly before implementation. Where required, we design around providers with suitable terms or keep processing on your own infrastructure.",
      },
      {
        q: "Will this replace our team?",
        a: "The realistic aim is removing repetitive work and speeding up drafts and triage. We design with human review for anything consequential.",
      },
      {
        q: "Do you guarantee accuracy?",
        a: "No credible engineer would. We measure accuracy on your workload, set thresholds, and design the product so uncertain outputs are visible rather than silently wrong.",
      },
    ],
    glyph: "ai",
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    navLabel: "IT Consulting",
    index: "05",
    eyebrow: "Service — Advisory",
    title: "Technical decisions, made legible.",
    lead: "Independent guidance on architecture, infrastructure and technology choices — written so engineering and leadership can act on the same document.",
    summary:
      "Architecture planning, technical strategy and independent evaluation of technology decisions.",
    meta: [
      { label: "Engagement", value: "Short, focused advisory" },
      { label: "Scope", value: "Review or strategy" },
      { label: "Output", value: "Written assessment" },
    ],
    intro: {
      heading: "Judgement, not a shopping list",
      paragraphs: [
        "Technology decisions fail quietly: a platform chosen for a demo, an architecture that assumes a team you do not have, a migration that never quite finishes. A short, structured review is often the cheapest way to avoid years of that.",
        "We work from your constraints — team size, budget, existing commitments and timeline — and produce a written assessment with options and trade-offs. If the right answer is to change very little, the recommendation will say that.",
      ],
      points: [
        {
          title: "Written, not verbal",
          body: "Decisions need a reference. You receive a document your team can revisit and challenge.",
        },
        {
          title: "Independent",
          body: "Recommendations are not tied to reselling a platform. Any relevant interest is disclosed upfront.",
        },
      ],
    },
    capabilities: [
      {
        title: "Architecture review",
        body: "A structured assessment of system design, boundaries, data flow and the risks that will surface as you grow.",
      },
      {
        title: "Technical strategy",
        body: "A sequenced roadmap connecting product goals to engineering capacity, with the trade-offs made explicit.",
      },
      {
        title: "Build vs buy",
        body: "Honest comparison of building, buying or assembling — including the maintenance cost that is usually omitted.",
      },
      {
        title: "Platform & vendor evaluation",
        body: "Requirements-led evaluation of providers, with scoring against your actual constraints rather than feature lists.",
      },
      {
        title: "Cost & risk assessment",
        body: "Where spend and operational risk concentrate, and which changes would reduce both.",
      },
      {
        title: "Delivery review",
        body: "Process, tooling and team structure reviewed for the friction that slows reliable delivery.",
      },
    ],
    process: [
      {
        title: "Context",
        body: "Understand the business goal, the team, the constraints and the decision that actually needs making.",
      },
      {
        title: "Review",
        body: "Interviews, architecture walkthroughs and documentation review, focused on the questions at hand.",
      },
      {
        title: "Analysis",
        body: "Compare viable options on cost, risk, operational burden and reversibility.",
      },
      {
        title: "Recommendation",
        body: "A written assessment with a clear recommended path and the conditions under which it changes.",
      },
      {
        title: "Decision support",
        body: "A working session with stakeholders to answer questions and pressure-test the recommendation.",
      },
    ],
    deliverables: [
      "Written assessment of the current state",
      "Options with explicit trade-offs",
      "Recommended path with sequencing",
      "Risk and cost notes",
      "Stakeholder working session",
    ],
    faqs: [
      {
        q: "Will you recommend your own stack?",
        a: "We recommend what fits your constraints. Where a recommendation overlaps with work we could deliver, we disclose it so you can weigh that.",
      },
      {
        q: "How long does an advisory engagement take?",
        a: "Most focused reviews run for a small number of sessions over one to three weeks, ending with a written assessment. Larger strategy work is scoped separately.",
      },
      {
        q: "Can you implement the recommendations?",
        a: "Yes, if you want that. The assessment stands on its own, and implementation is a separate decision.",
      },
      {
        q: "Do you work with non-technical leadership?",
        a: "Frequently. Recommendations are written to be understood by decision-makers without diluting the technical detail engineers need.",
      },
    ],
    glyph: "consulting",
  },
  {
    slug: "cybersecurity-consulting",
    name: "Cybersecurity Consulting",
    navLabel: "Cybersecurity Consulting",
    index: "06",
    eyebrow: "Service — Security",
    title: "Security designed in, not bolted on.",
    lead: "Security architecture, risk assessment and practical improvements that fit how your systems and your team actually operate.",
    summary:
      "Security architecture, risk assessment and practical improvements aligned to how your team works.",
    meta: [
      { label: "Engagement", value: "Assessment or advisory" },
      { label: "Scope", value: "Architecture & practice" },
      { label: "Output", value: "Prioritized roadmap" },
    ],
    intro: {
      heading: "Security that survives contact with delivery",
      paragraphs: [
        "A security programme that assumes unlimited time and a dedicated team will be ignored. We look at where risk actually sits, then propose changes that can be adopted by the engineers you have — ordered so the most consequential work happens first.",
        "This is advisory and architecture work. Where deeper assurance is needed, it pairs naturally with penetration testing, but the goal here is durable practice rather than a single report.",
      ],
      points: [
        {
          title: "Risk-led",
          body: "Effort concentrates on the systems and data whose failure would genuinely hurt.",
        },
        {
          title: "Built for adoption",
          body: "Controls are chosen for the team that must maintain them, with a realistic adoption path.",
        },
      ],
    },
    capabilities: [
      {
        title: "Security architecture",
        body: "Trust boundaries, segmentation, key management and authentication design reviewed against realistic threats.",
      },
      {
        title: "Risk assessment",
        body: "Assets, threats and exposure mapped into a prioritized view of what to fix first and why.",
      },
      {
        title: "Threat modelling",
        body: "Structured analysis of how your system could be abused, run early enough to influence design.",
      },
      {
        title: "Identity & access",
        body: "Authentication, authorization, session and secret handling designed around least privilege in practice.",
      },
      {
        title: "Secure development practice",
        body: "Review gates, dependency handling and secure defaults that fit your existing workflow.",
      },
      {
        title: "Policy & readiness",
        body: "Practical policies, logging expectations and incident runbooks — documents people can follow under pressure.",
      },
    ],
    process: [
      {
        title: "Baseline",
        body: "Understand architecture, data flows, current controls and the threats that matter to your business.",
      },
      {
        title: "Threat model & risk map",
        body: "Identify realistic attack paths and rank the resulting risk by impact and likelihood.",
      },
      {
        title: "Prioritized plan",
        body: "Sequence improvements by risk reduction per unit of effort, with owners and dependencies named.",
      },
      {
        title: "Implementation support",
        body: "Work alongside your engineers on the changes that need design decisions rather than tickets.",
      },
      {
        title: "Verification",
        body: "Confirm the controls work, document the operating practice, and define what to review next.",
      },
    ],
    deliverables: [
      "Security assessment of the current environment",
      "Threat model for the systems in scope",
      "Prioritized remediation roadmap with rationale",
      "Architecture and identity recommendations",
      "Policy and process guidance where relevant",
      "Follow-up review session with stakeholders",
    ],
    faqs: [
      {
        q: "How is this different from penetration testing?",
        a: "Penetration testing validates exploitable weaknesses in a defined scope. Consulting works earlier and wider: design, process and prioritization. They are complementary.",
      },
      {
        q: "Can you certify us for ISO 27001 or SOC 2?",
        a: "No — certification is issued by accredited auditors. We can help you prepare evidence and close gaps, and we will be clear about where an auditor is required.",
      },
      {
        q: "Do you provide 24/7 monitoring?",
        a: "We do not operate a monitoring service. We can design logging, alerting and incident procedures for the team or provider that does.",
      },
      {
        q: "What if we have no security function yet?",
        a: "That is a common starting point. The first engagement focuses on the highest-risk gaps and a sequence your team can actually follow.",
      },
    ],
    glyph: "security",
  },
  {
    slug: "web-development",
    name: "Web Development",
    navLabel: "Web Development",
    index: "07",
    eyebrow: "Service — Web",
    title: "Websites and platforms that carry the brand.",
    lead: "Marketing sites, business platforms and web applications — fast, accessible and built on a foundation your team can extend.",
    summary:
      "Modern responsive websites, business platforms and web applications with clean frontend engineering.",
    meta: [
      { label: "Engagement", value: "Design & build" },
      { label: "Scope", value: "Site, platform or app" },
      { label: "Output", value: "Launched product" },
    ],
    intro: {
      heading: "Craft at the surface, structure underneath",
      paragraphs: [
        "A website is often the first serious interaction someone has with your company. It should load quickly, read clearly, behave well on a phone, and feel considered in the details — spacing, type, motion, the way a menu opens.",
        "Underneath, the same standard applies. We build with a real component system, semantic markup and content models that let your team publish without breaking the design.",
      ],
      points: [
        {
          title: "Design and build together",
          body: "Layouts are designed against the component system that will implement them, so nothing is lost in translation.",
        },
        {
          title: "Performance as a feature",
          body: "Measured budgets for loading, layout stability and interaction — checked before launch, not after.",
        },
      ],
    },
    capabilities: [
      {
        title: "Marketing & corporate sites",
        body: "Editorial, art-directed websites with clear structure, strong typography and no template aftertaste.",
      },
      {
        title: "Design systems",
        body: "Tokens, components and documentation that keep a growing product visually coherent.",
      },
      {
        title: "Web applications",
        body: "Authenticated interfaces, dashboards and tools built with typed, maintainable frontend architecture.",
      },
      {
        title: "Content architecture",
        body: "CMS and content models designed around what your team publishes, not what the template supports.",
      },
      {
        title: "Backend integration",
        body: "APIs, forms, payments and third-party services connected with proper validation and error handling.",
      },
      {
        title: "Performance & accessibility",
        body: "Core Web Vitals, keyboard navigation, contrast and screen-reader semantics treated as acceptance criteria.",
      },
    ],
    process: [
      {
        title: "Structure",
        body: "Define audiences, page architecture, content priorities and the technical constraints that shape the build.",
      },
      {
        title: "Design system",
        body: "Establish type, colour, spacing and components before composing individual pages.",
      },
      {
        title: "Build",
        body: "Implement responsive, accessible pages with real content and working states rather than placeholders.",
      },
      {
        title: "Quality pass",
        body: "Cross-device review, accessibility checks, performance budgets, metadata and redirects.",
      },
      {
        title: "Launch & iterate",
        body: "Ship with analytics and monitoring in place, then improve based on what real usage shows.",
      },
    ],
    deliverables: [
      "Responsive website or web application",
      "Reusable component library",
      "CMS or content model setup where in scope",
      "Accessibility and performance checks",
      "SEO metadata, sitemap and redirects",
      "Handover documentation for your team",
    ],
    faqs: [
      {
        q: "Do you handle design as well as development?",
        a: "Yes. Most web engagements cover both, from information architecture through to the finished build.",
      },
      {
        q: "Can you work with our existing brand?",
        a: "Yes. Existing identity, type and tone are carried into the design system. We will flag where the brand needs an addition rather than inventing one.",
      },
      {
        q: "Do you build with a CMS?",
        a: "Where content will change regularly, yes — chosen to fit the team publishing it. Some sites are better as code-only builds, and we will recommend that when it is true.",
      },
      {
        q: "What about ongoing maintenance?",
        a: "Available as an agreed support arrangement covering updates, fixes and small improvements.",
      },
    ],
    glyph: "web",
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const relatedServices = (slug: string, count = 3) => {
  const index = services.findIndex((service) => service.slug === slug);
  if (index === -1) return services.slice(0, count);
  return Array.from({ length: count }, (_, offset) => {
    return services[(index + offset + 1) % services.length];
  });
};
