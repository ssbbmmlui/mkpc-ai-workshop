import { ExternalLink, FolderOpen, Layers, Mic, Palette } from 'lucide-react';
import { Lang, t } from '../i18n';

interface Props {
  lang: Lang;
}

const features = [
  { icon: Layers, titleKey: 'geminiFeatMultiTitle', bodyKey: 'geminiFeatMultiBody' },
  { icon: FolderOpen, titleKey: 'geminiFeatGoogleTitle', bodyKey: 'geminiFeatGoogleBody' },
  { icon: Mic, titleKey: 'geminiFeatLiveTitle', bodyKey: 'geminiFeatLiveBody' },
  { icon: Palette, titleKey: 'geminiFeatCreateTitle', bodyKey: 'geminiFeatCreateBody' },
] as const;

export function GeminiHomeTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-6 text-white shadow-xl shadow-sky-200/40 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-300/20 blur-2xl" />

        <p className="relative mb-3 text-sm font-medium tracking-wide text-sky-100">
          {t('geminiEyebrow', lang)}
        </p>
        <h2 className="relative mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {t('geminiHeadline', lang)}
        </h2>
        <p className="relative max-w-2xl text-sm leading-relaxed text-sky-50 sm:text-base">
          {t('geminiPlatformIntro', lang)}
        </p>

        <a
          href="https://gemini.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50 hover:shadow-md"
        >
          <ExternalLink size={16} />
          {t('openGemini', lang)}
          <span className="text-sky-400">gemini.google.com</span>
        </a>
      </section>

      <section>
        <h3 className="section-title">{t('geminiFeaturesTitle', lang)}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article
              key={titleKey}
              className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                <Icon size={20} />
              </div>
              <h4 className="mb-2 text-base font-semibold text-slate-800">{t(titleKey, lang)}</h4>
              <p className="text-sm leading-relaxed text-slate-600">{t(bodyKey, lang)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
