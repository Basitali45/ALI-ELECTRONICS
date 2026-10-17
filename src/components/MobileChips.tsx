import React from 'react';
import { Category } from '../types';

interface MobileChipsProps {
  categories: Category[];
  selected: string;
  onSelect: (name: string) => void;
}

export function MobileChips({ categories, selected, onSelect }: MobileChipsProps) {
  const cats = categories.filter((c) => c.isVisible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const isAll = selected === 'all';

  return (
    <section id="home" className="md:hidden pt-4 pb-1">
      <p className="text-center text-[15px] text-black px-5">All-Products • Minimal Luxury • Curated Quality</p>
      <div className="mt-5 flex items-center gap-2.5 overflow-x-auto scrollbar-none px-5 pb-1">
        <button
          onClick={() => onSelect('all')}
          className={`px-5 py-2.5 rounded-full text-[15px] font-medium whitespace-nowrap border cursor-pointer ${isAll ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-black border-slate-300'}`}
        >
          All
        </button>
        {cats.map((c) => {
          const active = selected.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.name)}
              className={`px-5 py-2.5 rounded-full text-[15px] font-medium whitespace-nowrap border cursor-pointer ${active ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-black border-slate-300'}`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
