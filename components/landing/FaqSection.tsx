"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apa itu VerapritygurlAI dan bagaimana cara kerjanya?",
    answer:
      "VerapritygurlAI adalah asisten kecerdasan buatan yang dirancang untuk membantu Anda berpikir, menulis, menganalisis data, dan menyusun kode. Anda cukup mengetikkan pertanyaan atau melampirkan dokumen, lalu VerapritygurlAI merespons secara real-time dengan penalaran yang terstruktur dan kontekstual.",
  },
  {
    question: "Untuk apa saya menggunakan VerapritygurlAI?",
    answer:
      "Anda dapat memakai VerapritygurlAI untuk merangkum artikel atau riset panjang, menyusun draf email dan laporan, melakukan brainstorming ide produk, menulis serta meninjau kode program, hingga mempelajari topik baru secara interaktif.",
  },
  {
    question: "Berapa biaya penggunaannya?",
    answer:
      "VerapritygurlAI tersedia gratis melalui paket Free untuk penggunaan harian dasar. Jika Anda membutuhkan kapasitas pesan lebih besar, model lanjutan, fitur Proyek, dan coding agent, Anda dapat meningkatkan ke paket Pro mulai $17/bulan atau paket Max dan Ultra.",
  },
];

/**
 * Bagian FAQ dengan accordion lebar maksimum 700px dan animasi chevron halus.
 */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="mx-auto w-full max-w-[700px] px-6 py-14 sm:py-20">
      <h2 className="mb-10 text-center font-serif text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">
        Pertanyaan yang sering diajukan
      </h2>

      <div className="divide-y divide-border-subtle border-y border-border-subtle">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.question} className="py-4 sm:py-5">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleItem(idx)}
                className="flex w-full items-center justify-between gap-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50 rounded-lg"
              >
                <span className="text-base font-medium text-text-primary sm:text-lg">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200",
                    isOpen && "rotate-180 text-text-primary"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 pr-8 text-sm leading-relaxed text-text-secondary">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
