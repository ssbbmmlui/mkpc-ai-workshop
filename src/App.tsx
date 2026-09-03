import { useState } from 'react';
import { Languages, Menu } from 'lucide-react';
import { GeminiTab } from './components/GeminiTab';
import { ImageGenTab } from './components/ImageGenTab';
import { AppGameTab } from './components/AppGameTab';
import { PresentationTab } from './components/PresentationTab';
import { QwenWorkTab } from './components/QwenWorkTab';
import { Page, Sidebar } from './components/Sidebar';
import { Lang, t } from './i18n';
import { assetUrl } from './assetUrl';

function App() {
  const [activePage, setActivePage] = useState<Page>('gemini');
  const [lang, setLang] = useState<Lang>('tc');
  const [geminiOpen, setGeminiOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSelect = (page: Page) => {
    setActivePage(page);
    if (page !== 'qwen') {
      setGeminiOpen(true);
    }
    setMenuOpen(false);
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-40 h-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="md:hidden -ml-1 rounded-xl p-2 text-slate-600 transition hover:bg-white hover:text-slate-800 hover:shadow-sm"
              aria-label={t('openMenu', lang)}
            >
              <Menu size={20} />
            </button>
            <img src={assetUrl('MKPC-Logo.png')} alt="MKPC Logo" className="h-12 w-auto shrink-0" />
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-800 md:text-2xl">
              {t('title', lang)}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-slate-200/70">
            <Languages size={16} className="ml-2 hidden text-slate-400 sm:block" />
            <button
              onClick={() => setLang(lang === 'tc' ? 'sc' : 'tc')}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
            >
              {lang === 'tc' ? t('simplified', lang) : t('traditional', lang)}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'tc' : 'en')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                lang === 'en'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {t('english', lang)}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <Sidebar
          lang={lang}
          activePage={activePage}
          geminiOpen={geminiOpen}
          onToggleGemini={() => setGeminiOpen((open) => !open)}
          onSelect={handleSelect}
          mobileOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-8">
            {activePage === 'gemini' && <GeminiTab lang={lang} />}
            {activePage === 'image' && <ImageGenTab lang={lang} />}
            {activePage === 'app' && <AppGameTab lang={lang} />}
            {activePage === 'presentation' && <PresentationTab lang={lang} />}
            {activePage === 'qwen' && <QwenWorkTab lang={lang} />}
          </main>

          <footer className="border-t border-slate-200/70 py-6 text-center text-sm text-slate-400">
            MKPC AI Workshop 2026
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
