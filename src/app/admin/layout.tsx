import Link from "next/link";

const tabs = [
  { href: "/admin", label: "Panoramica" },
  { href: "/admin/giochi", label: "Giochi e copie" },
  { href: "/admin/traduzioni", label: "Traduzioni" },
  { href: "/admin/prestiti", label: "Prestiti" },
  { href: "/admin/socie", label: "Socie e quote" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div>
      <div className="border-b border-ink/10 bg-paper-soft">
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap px-3.5 py-3 text-sm font-medium text-ink/60 hover:text-felt"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
