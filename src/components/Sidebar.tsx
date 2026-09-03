import { useEffect } from 'react';
import {
  Sparkles,
  Image,
  Gamepad2,
  Presentation,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Globe,
  X,
} from 'lucide-react';
import { Lang, t } from '../i18n';

export type Page = 'gemini' | 'geminiGem' | 'image' | 'app' | 'presentation' | 'qwen' | 'qwenWeb';

const geminiItems: { id: Exclude<Page, 'gemini' | 'qwen' | 'qwenWeb'>; icon: typeof Sparkles; labelKey: string }[] = [
  { id: 'geminiGem', icon: Sparkles, labelKey: 'geminiGem' },
  { id: 'image', icon: Image, labelKey: 'imageGen' },
  { id: 'app', icon: Gamepad2, labelKey: 'appGame' },
  { id: 'presentation', icon: Presentation, labelKey: 'pptTab' },
];

const qwenItems: { id: Extract<Page, 'qwenWeb'>; icon: typeof Sparkles; labelKey: string }[] = [
  { id: 'qwenWeb', icon: Globe, labelKey: 'qwenFeatWebTitle' },
];

const GEMINI_PAGES: Page[] = ['gemini', 'geminiGem', 'image', 'app', 'presentation'];
const QWEN_PAGES: Page[] = ['qwen', 'qwenWeb'];

interface NavProps {
  lang: Lang;
  activePage: Page;
  geminiOpen: boolean;
  qwenOpen: boolean;
  onToggleGemini: () => void;
  onToggleQwen: () => void;
  onSelect: (page: Page) => void;
}

function itemClass(active: boolean, tone: 'sky' | 'violet') {
  if (active) {
    return tone === 'sky'
      ? 'bg-white font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100'
      : 'bg-white font-semibold text-violet-700 shadow-sm ring-1 ring-violet-100';
  }
  return 'text-slate-600 hover:bg-white/70 hover:text-slate-800';
}

function SidebarNav({
  lang,
  activePage,
  geminiOpen,
  qwenOpen,
  onToggleGemini,
  onToggleQwen,
  onSelect,
}: NavProps) {
  const geminiActive = GEMINI_PAGES.includes(activePage);
  const qwenActive = QWEN_PAGES.includes(activePage);

  return (
    <nav className="flex flex-col gap-2 p-4" aria-label={t('sidebarNav', lang)}>
      <div>
        <div
          className={`flex w-full items-center gap-1 rounded-2xl px-1.5 py-1 text-sm font-semibold transition ${
            geminiActive
              ? 'bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100'
              : 'text-slate-700'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelect('gemini');
              if (!geminiOpen) onToggleGemini();
            }}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left hover:bg-white/60"
            aria-current={activePage === 'gemini' ? 'page' : undefined}
          >
            <Sparkles size={18} className="shrink-0" />
            <span className="truncate">{t('geminiGroup', lang)}</span>
          </button>
          <button
            type="button"
            onClick={onToggleGemini}
            aria-expanded={geminiOpen}
            aria-label={t('geminiGroup', lang)}
            className="rounded-xl p-1.5 hover:bg-white/70"
          >
            {geminiOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {geminiOpen && (
          <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-slate-200/80 pl-2">
            {geminiItems.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-current={activePage === id ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${itemClass(activePage === id, 'sky')}`}
              >
                <Icon size={16} className="shrink-0" />
                {t(labelKey, lang)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div
          className={`flex w-full items-center gap-1 rounded-2xl px-1.5 py-1 text-sm font-semibold transition ${
            qwenActive
              ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-100'
              : 'text-slate-700'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelect('qwen');
              if (!qwenOpen) onToggleQwen();
            }}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left hover:bg-white/60"
            aria-current={activePage === 'qwen' ? 'page' : undefined}
          >
            <Briefcase size={18} className="shrink-0" />
            <span className="truncate">{t('qwenWork', lang)}</span>
          </button>
          <button
            type="button"
            onClick={onToggleQwen}
            aria-expanded={qwenOpen}
            aria-label={t('qwenWork', lang)}
            className="rounded-xl p-1.5 hover:bg-white/70"
          >
            {qwenOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {qwenOpen && (
          <div className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-slate-200/80 pl-2">
            {qwenItems.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-current={activePage === id ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition ${itemClass(activePage === id, 'violet')}`}
              >
                <Icon size={16} className="shrink-0" />
                {t(labelKey, lang)}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

interface SidebarProps {
  lang: Lang;
  activePage: Page;
  geminiOpen: boolean;
  qwenOpen: boolean;
  onToggleGemini: () => void;
  onToggleQwen: () => void;
  onSelect: (page: Page) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  lang,
  activePage,
  geminiOpen,
  qwenOpen,
  onToggleGemini,
  onToggleQwen,
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
    qwenOpen,
    onToggleGemini,
    onToggleQwen,
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
