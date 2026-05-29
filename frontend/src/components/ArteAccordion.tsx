'use client';

import { useState } from 'react';
import type { FAQItem } from '@/lib/arteData';

interface Props {
  items: FAQItem[];
}

export default function ArteAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#2a2a2a]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-start justify-between gap-4 py-5 text-left group"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className={`text-sm font-medium leading-relaxed transition-colors duration-150 ${
              open === i ? 'text-[#d4a017]' : 'text-[#f0f0f0] group-hover:text-[#d4a017]'
            }`}>
              {item.q}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-4 h-4 shrink-0 mt-0.5 text-[#555555] transition-transform duration-200 ${
                open === i ? 'rotate-180 text-[#d4a017]' : ''
              }`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open === i && (
            <div className="pb-5 animate-fade-in">
              <p className="text-sm text-[#888888] leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
