export const site = {
  name: "Prismelo",
  wordmark: "PRISMELO",
  legalName: "Prismelo Technology",
  url: "https://prismelo.tech",
  shortDescription:
    "A technology and cybersecurity company building secure software, cloud infrastructure and intelligent systems.",
  description:
    "Prismelo is a technology and cybersecurity company. We engineer secure software, cloud infrastructure and intelligent systems for businesses building what comes next.",
  founder: "Kunal Purohit",
  // Drop a portrait in /public and set this to e.g. "/founder.jpg".
  founderPhoto: "",
  contactEmail: "hello@prismelo.tech",
  ownedCompanies: [
    {
      name: "HirenextAI",
      relationship: "Owned by Prismelo",
      status: "Active",
      industry: "AI / Recruitment Technology",
      url: "https://hirenextai.com",
      summary:
        "HirenextAI applies artificial intelligence to recruitment workflows — its own product company, operated within the Prismelo group.",
    },
  ],
} as const;

export type NavChild = {
  label: string;
  href: string;
  description: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  children?: NavChild[];
};

export const servicesNav: NavChild[] = [
  {
    label: "Penetration Testing",
    href: "/services/penetration-testing",
    description: "Authorized security assessments and validation.",
  },
  {
    label: "Cybersecurity Consulting",
    href: "/services/cybersecurity-consulting",
    description: "Security architecture, risk and practice.",
  },
  {
    label: "Cloud & Hosting",
    href: "/services/cloud-hosting",
    description: "Infrastructure planning, deployment, reliability.",
  },
  {
    label: "Software Development",
    href: "/services/software-development",
    description: "Custom systems, APIs and integrations.",
  },
  {
    label: "AI Solutions",
    href: "/services/ai-solutions",
    description: "Applied AI features and workflow automation.",
  },
  {
    label: "Web Development",
    href: "/services/web-development",
    description: "Websites, platforms and web applications.",
  },
  {
    label: "IT Consulting",
    href: "/services/it-consulting",
    description: "Technical strategy and architecture decisions.",
  },
];

export const resourcesNav: NavChild[] = [
  {
    label: "Documentation",
    href: "/docs",
    description: "Platform, service and integration reference.",
  },
  {
    label: "Community",
    href: "/community",
    description: "Discussions across engineering and security.",
  },
  {
    label: "Blog / Resources",
    href: "/resources",
    description: "Notes, guides and sample articles.",
  },
];

export const navLinks: NavGroup[] = [
  { label: "Services", href: "/services", children: servicesNav },
  { label: "Companies", href: "/companies" },
  { label: "About", href: "/about" },
  { label: "Founder", href: "/founder" },
  { label: "Resources", href: "/resources", children: resourcesNav },
];

export const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Companies", href: "/companies" },
      { label: "Founder", href: "/founder" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Penetration Testing", href: "/services/penetration-testing" },
      { label: "Cloud & Hosting", href: "/services/cloud-hosting" },
      { label: "Software Development", href: "/services/software-development" },
      { label: "AI Solutions", href: "/services/ai-solutions" },
      { label: "Web Development", href: "/services/web-development" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Community", href: "/community" },
      { label: "Blog", href: "/resources" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export const serviceOptions = servicesNav.map((service) => service.label);
