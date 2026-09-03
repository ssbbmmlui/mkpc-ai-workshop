import { useEffect } from 'react';
import {
  Sparkles,
  Image,
  Gamepad2,
  Presentation,
  Briefcase,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { Lang, t } from '../i18n';

export type Page = 'gemini' | 'image' | 'app' | 'presentation' | 'qwen';

const geminiItems: { id: Exclude<Page, 'qwen'>; icon: typeof Sparkles; labelKey: string }[] = [
  { id: 'gemini', icon: Sparkles, labelKey: 'geminiGem' },
  { id: 'image', icon: Image, labelKey: 'imageGen' },
  { id: 'app', icon: Gamepad2, labelKey: 'appGame' },
  { id: 'presentation', icon: Presentation, labelKey: 'pptTab' },
];

interface NavProps {
  lang: Lang;
  activePage: Page;
  geminiOpen: boolean;
  onToggleGemini: () => void;
  onSelect: (page: Page) => void;
}

function SidebarNav({ lang, activePage, geminiOpen, onToggleGemini, onSelect }: NavProps) {
  const geminiActive = activePage !== 'qwen';

  return (
    <nav className="flex flex-col gap-2 p-4" aria-label={t('sidebarNav', lang)}>
      <div>
        <button
          type="button"
          onClick={onToggleGemini}
          aria-expanded={geminiOpen}
          className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
            geminiActive
              ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
              : 'text-slate-700 hover:bg-white/80'
          }`}
        >
          <Sparkles size={18} className="shrink-0" />
          <span className="flex-1 text-left">{t('geminiGroup', lang)}</span>
          {geminiOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {geminiOpen && (
          <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-slate-200/80 pl-2">
            {geminiItems.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-current={activePage === id ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${
                  activePage === id
                    ? 'bg-white font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-800'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                {t(labelKey, lang)}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect('qwen')}
        aria-current={activePage === 'qwen' ? 'page' : undefined}
        className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
          activePage === 'qwen'
            ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100'
            : 'text-slate-700 hover:bg-white/80'
        }`}
      >
        <Briefcase size={18} className="shrink-0" />
        <span className="text-left">{t('qwenWork', lang)}</span>
      </button>
    </nav>
  );
}

interface SidebarProps {
  lang: Lang;
  activePage: Page;
  geminiOpen: boolean;
  onToggleGemini: () => void;
  onSelect: (page: Page) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  lang,
  activePage,
  geminiOpen,
  onToggleGemini,
  onSelect,
  mobileOpen,
  onClose,
}: SidebarProps) {
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onClose]);

  const navProps: NavProps = {
    lang,
    activePage,
    geminiOpen,
    onToggleGemini,
    onSelect,
  };

  return (
    <>
      <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-white/70 bg-white/55 backdrop-blur-xl md:flex">
        <SidebarNav {...navProps} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label={t('closeMenu', lang)}
            onClick={onClose}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3">
              <span className="font-semibold text-slate-800">{t('sidebarNav', lang)}</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label={t('closeMenu', lang)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav {...navProps} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
