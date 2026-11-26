export type PlanAudience = "personal" | "team";

export interface PlanTier {
  id: string;
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  ctaLabel: string;
  footnote: string;
  featuresTitle?: string;
  features: string[];
  highlighted?: boolean;
  illustrationLevel: 1 | 2 | 3;
}

export const PLAN_TABS: { id: PlanAudience; label: string }[] = [
  { id: "personal", label: "Perorangan" },
  { id: "team", label: "Team dan Enterprise" },
];

export const PLANS_BY_AUDIENCE: Record<PlanAudience, PlanTier[]> = {
  personal: [
    {
      id: "free",
      name: "Free",
      tagline: "Coba VerapritygurlAI",
      price: "$0",
      priceNote: "Gratis untuk semua orang",
      ctaLabel: "Coba VerapritygurlAI",
      footnote: "Tanpa komitmen · Batalkan kapan saja",
      features: [
        "Chat di web, desktop, dan seluler",
        "Cari di web, buat file, dan jalankan kode",
        "Memori lintas percakapan",
        "Hubungkan aplikasi dan alat Anda",
      ],
      illustrationLevel: 1,
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Untuk pekerjaan sehari-hari",
      price: "$17",
      priceNote: "per bulan (diskon langganan tahunan)",
      ctaLabel: "Coba VerapritygurlAI",
      footnote: "Tanpa komitmen · Batalkan kapan saja",
      featuresTitle: "Semua yang ada di Free, ditambah:",
      features: [
        "Lebih banyak penggunaan",
        "Coding agent",
        "Proyek",
        "Lebih banyak model",
        "Ekstensi browser",
      ],
      illustrationLevel: 2,
    },
    {
      id: "max-ultra",
      name: "Max dan Ultra",
      tagline: "Untuk orang-orang yang bekerja dengan VerapritygurlAI sepanjang hari",
      price: "Mulai dari $100",
      priceNote: "per bulan",
      ctaLabel: "Coba VerapritygurlAI",
      footnote: "Tanpa komitmen · Batalkan kapan saja",
      featuresTitle: "Semua yang ada di Pro, ditambah:",
      features: [
        "Batas penggunaan 5x/10x lebih besar",
        "Akses lebih awal ke fitur baru",
        "Akses prioritas saat trafik tinggi",
      ],
      highlighted: true,
      illustrationLevel: 3,
    },
  ],
  team: [
    {
      id: "team-standard",
      name: "Team Standard",
      tagline: "Untuk tim kecil yang berkolaborasi setiap hari",
      price: "$25",
      priceNote: "per pengguna / bulan (penagihan tahunan)",
      ctaLabel: "Coba VerapritygurlAI",
      footnote: "Minimal 5 anggota · Kelola akses terpusat",
      features: [
        "Semua fitur paket Pro untuk setiap anggota",
        "Ruang kerja proyek bersama tim",
        "Konsol admin dan manajemen anggota",
        "Data percakapan tidak digunakan untuk melatih model",
      ],
      illustrationLevel: 1,
    },
    {
      id: "team-premium",
      name: "Team Premium",
      tagline: "Untuk tim produk dan engineering berkecepatan tinggi",
      price: "$125",
      priceNote: "per pengguna / bulan (penagihan tahunan)",
      ctaLabel: "Coba NamaBot",
      footnote: "Termasuk akses coding agent prioritas",
      featuresTitle: "Semua yang ada di Team Standard, ditambah:",
      features: [
        "Kapasitas penggunaan tim lebih besar",
        "Coding agent terintegrasi repositori",
        "Analitik pemakaian dan audit aktivitas",
        "Dukungan teknis prioritas",
      ],
      illustrationLevel: 2,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Skala organisasi dengan keamanan dan kontrol penuh",
      price: "Khusus",
      priceNote: "Sesuai kebutuhan organisasi Anda",
      ctaLabel: "Hubungi bagian penjualan",
      footnote: "Kontrak tahunan · SLA khusus tersedia",
      featuresTitle: "Semua yang ada di Team Premium, ditambah:",
      features: [
        "Jendela konteks ekstra besar",
        "Single Sign-On (SSO) dan provisi SCIM",
        "Kontrol kepatuhan, retensi data, dan audit log",
        "Manajer akun dan tim onboarding khusus",
      ],
      highlighted: true,
      illustrationLevel: 3,
    },
  ],
};
