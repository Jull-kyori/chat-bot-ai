import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

interface FooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterGroup[][] = [
  [
    {
      title: "Produk",
      links: [
        { label: "VerapritygurlAI Web", href: "#" },
        { label: "Aplikasi Desktop", href: "#" },
        { label: "Aplikasi Seluler", href: "#" },
        { label: "Harga", href: "#pricing" },
      ],
    },
    {
      title: "Kemampuan",
      links: [
        { label: "Penulisan & Riset", href: "#" },
        { label: "Coding Agent", href: "#" },
        { label: "Analisis Dokumen", href: "#" },
      ],
    },
    {
      title: "Ekstensi",
      links: [
        { label: "Ekstensi Browser", href: "#" },
        { label: "Konektor Aplikasi", href: "#" },
      ],
    },
    {
      title: "Model",
      links: [
        { label: "VerapritygurlAI Cepat", href: "#" },
        { label: "VerapritygurlAI Penalaran", href: "#" },
        { label: "VerapritygurlAI Pro", href: "#" },
      ],
    },
  ],
  [
    {
      title: "Enterprise",
      links: [
        { label: "Solusi Perusahaan", href: "#" },
        { label: "Keamanan Data", href: "#" },
        { label: "Hubungi Penjualan", href: "#" },
      ],
    },
    {
      title: "Departemen",
      links: [
        { label: "Engineering", href: "#" },
        { label: "Produk & Desain", href: "#" },
        { label: "Pemasaran", href: "#" },
      ],
    },
    {
      title: "Industri",
      links: [
        { label: "Teknologi", href: "#" },
        { label: "Keuangan", href: "#" },
        { label: "Pendidikan", href: "#" },
      ],
    },
    {
      title: "Program",
      links: [
        { label: "Startup", href: "#" },
        { label: "Kampus", href: "#" },
      ],
    },
  ],
  [
    {
      title: "Developer",
      links: [
        { label: "Dokumentasi API", href: "#" },
        { label: "SDK & Contoh", href: "#" },
        { label: "Status Sistem", href: "#" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Konsol Developer", href: "#" },
        { label: "Integrasi MCP", href: "#" },
      ],
    },
    {
      title: "Sumber Daya",
      links: [
        { label: "Panduan Prompt", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Komunitas", href: "#" },
      ],
    },
    {
      title: "Bantuan dan keamanan",
      links: [
        { label: "Pusat Bantuan", href: "#" },
        { label: "Keamanan AI", href: "#" },
        { label: "Laporkan Masalah", href: "#" },
      ],
    },
  ],
  [
    {
      title: "Perusahaan",
      links: [
        { label: "Tentang Kami", href: "#" },
        { label: "Karier", href: "#" },
        { label: "Berita", href: "#" },
      ],
    },
    {
      title: "Ketentuan dan kebijakan",
      links: [
        { label: "Ketentuan Layanan", href: "#" },
        { label: "Kebijakan Privasi", href: "/privacy" },
        { label: "Kebijakan Penggunaan", href: "#" },
      ],
    },
  ],
];

/**
 * Footer halaman /login dengan branding VerapritygurlAI di kiri dan grid 4 kolom tautan di kanan.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-footer">
      <div className="mx-auto max-w-[1280px] px-6 py-14 sm:py-16 lg:px-12">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          {/* Kiri: Logo atas + Copyright & Sosmed bawah */}
          <div className="flex flex-col justify-between gap-8 lg:min-w-[220px]">
            <Link href="/login" className="w-fit">
              <BrandLogo />
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">VerapritygurlAI</span>
                <span>© 2026</span>
              </div>

              <div className="flex items-center gap-4 text-text-secondary">
                {/* X (Twitter) */}
                <a
                  href="#"
                  aria-label="X"
                  className="transition-colors hover:text-text-primary"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="transition-colors hover:text-text-primary"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="#"
                  aria-label="YouTube"
                  className="transition-colors hover:text-text-primary"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="transition-colors hover:text-text-primary"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Kanan: Grid 4 Kolom Link */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:max-w-[820px]">
            {FOOTER_COLUMNS.map((column, colIdx) => (
              <div key={colIdx} className="space-y-6">
                {column.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-2.5 text-xs font-medium text-text-muted">
                      {group.title}
                    </h3>
                    <ul className="space-y-2">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-xs text-text-secondary transition-colors hover:text-text-primary"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
