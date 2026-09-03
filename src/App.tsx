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
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="h-full px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              aria-label={t('openMenu', lang)}
            >
              <Menu size={20} />
            </button>
            <img src={assetUrl('MKPC-Logo.png')} alt="MKPC Logo" className="h-12 w-auto shrink-0" />
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight truncate">
              {t('title', lang)}
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Languages size={16} className="text-slate-500 hidden sm:block" />
            <button
              onClick={() => setLang(lang === 'tc' ? 'sc' : 'tc')}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
            >
              {lang === 'tc' ? t('simplified', lang) : t('traditional', lang)}
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'tc' : 'en')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
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

        <div className="flex-1 min-w-0 flex flex-col">
          <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
            {activePage === 'gemini' && <GeminiTab lang={lang} />}
            {activePage === 'image' && <ImageGenTab lang={lang} />}
            {activePage === 'app' && <AppGameTab lang={lang} />}
            {activePage === 'presentation' && <PresentationTab lang={lang} />}
            {activePage === 'qwen' && <QwenWorkTab lang={lang} />}
          </main>

          <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
            MKPC AI Workshop 2026
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
