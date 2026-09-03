import { BookOpen, ExternalLink, FileText, Globe, Video } from 'lucide-react';
import { Lang, t } from '../i18n';

interface Props {
  lang: Lang;
}

const features = [
  { icon: FileText, titleKey: 'qwenFeatOfficeTitle', bodyKey: 'qwenFeatOfficeBody' },
  { icon: Video, titleKey: 'qwenFeatMediaTitle', bodyKey: 'qwenFeatMediaBody' },
  { icon: Globe, titleKey: 'qwenFeatWebTitle', bodyKey: 'qwenFeatWebBody' },
  { icon: BookOpen, titleKey: 'qwenFeatWorkflowTitle', bodyKey: 'qwenFeatWorkflowBody' },
] as const;

export function QwenWorkTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 p-6 text-white shadow-xl shadow-violet-200/40 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-sky-300/20 blur-2xl" />

        <p className="relative mb-3 text-sm font-medium tracking-wide text-violet-100">
          {t('qwenWorkEyebrow', lang)}
        </p>
        <h2 className="relative mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {t('qwenWorkHeadline', lang)}
        </h2>
        <p className="relative max-w-2xl text-sm leading-relaxed text-violet-50 sm:text-base">
          {t('qwenWorkIntro', lang)}
        </p>

        <a
          href="https://qwenwork.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 hover:shadow-md"
        >
          <ExternalLink size={16} />
          {t('openQwenWork', lang)}
          <span className="text-violet-400">qwenwork.ai</span>
        </a>
      </section>

      <section>
        <h3 className="section-title">{t('qwenWorkFeaturesTitle', lang)}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article
              key={titleKey}
              className="group rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
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
