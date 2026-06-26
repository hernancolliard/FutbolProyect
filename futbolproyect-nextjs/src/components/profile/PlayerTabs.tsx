"use client";

interface PlayerTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function PlayerTabs({ tabs, activeTab, onChange }: PlayerTabsProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-[#071C3C] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
