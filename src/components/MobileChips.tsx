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
    <section id="home" className="md:hidden pt-3 pb-1">
      <p className="text-center text-[12px] font-bold text-amber-600 dark:text-amber-400 tracking-wide px-4">
        FREE HOME DELIVERY ON ALL ORDERS &bull; CASH ON DELIVERY
      </p>
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto scrollbar-none px-4 pb-1">
        <button
          onClick={() => onSelect('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
            isAll
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-black border-slate-900 dark:border-amber-500 shadow-sm'
              : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          All
        </button>
        {cats.map((c) => {
          const active = selected.toLowerCase() === c.name.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.name)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-black border-slate-900 dark:border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default MobileChips;
