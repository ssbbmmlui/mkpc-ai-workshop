import { useState } from 'react';
import { Sparkles, Image, Gamepad2, LogIn, Languages, Presentation } from 'lucide-react';
import { GeminiTab } from './components/GeminiTab';
import { ImageGenTab } from './components/ImageGenTab';
import { AppGameTab } from './components/AppGameTab';
import { LoginTab } from './components/LoginTab';
import { PresentationTab } from './components/PresentationTab';
import { Lang, t } from './i18n';

type Tab = 'gemini' | 'image' | 'app' | 'presentation' | 'login';

const tabs: { id: Tab; icon: typeof Sparkles; labelKey: string; color: string }[] = [
  { id: 'gemini', icon: Sparkles, labelKey: 'geminiGem', color: 'sky' },
  { id: 'image', icon: Image, labelKey: 'imageGen', color: 'rose' },
  { id: 'app', icon: Gamepad2, labelKey: 'appGame', color: 'violet' },
  { id: 'presentation', icon: Presentation, labelKey: 'pptTab', color: 'amber' },
  { id: 'login', icon: LogIn, labelKey: 'login', color: 'emerald' },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [lang, setLang] = useState<Lang>('tc');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/MKPC-Logo.png" alt="MKPC Logo" className="h-14 w-auto" />
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 tracking-tight">
              {t('title', lang)}
            </h1>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1">
            <Languages size={16} className="text-slate-500" />
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

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto pb-0 -mb-px scrollbar-hide">
            {tabs.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === id ? 'tab-active' : 'tab-inactive'
                }`}
              >
                <Icon size={16} />
                {t(labelKey, lang)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'gemini' && <GeminiTab lang={lang} />}
        {activeTab === 'image' && <ImageGenTab lang={lang} />}
        {activeTab === 'app' && <AppGameTab lang={lang} />}
        {activeTab === 'presentation' && <PresentationTab lang={lang} />}
        {activeTab === 'login' && <LoginTab lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        MKPC AI Workshop 2026
      </footer>
    </div>
  );
}

export default App;
