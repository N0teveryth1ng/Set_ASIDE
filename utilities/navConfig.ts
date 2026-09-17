export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Index", href: "#index" },
  { label: "Systems", href: "#systems" },
  { label: "Contact", href: "#contact" },
] as const;

export const NAV_LINK_HASHES = NAV_LINKS.map((link) => link.href) as readonly string[];