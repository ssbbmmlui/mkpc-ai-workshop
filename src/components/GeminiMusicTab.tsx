import { ExternalLink, Music } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { assetUrl } from '../assetUrl';
import { Lang, t } from '../i18n';

const LYRICS_GEM_URL =
  'https://gemini.google.com/gem/1Sbl0Fkjs_oplBphYPKEjLG40fSe5qX1r?usp=sharing';

const MUSIC_PROMPT = `Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame

Moderate-tempo modern pop rap with a youthful clear-diction duet, alternating rhythmic rap verses and a repetitive sung chorus.`;

interface Props {
  lang: Lang;
}

export function GeminiMusicTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600">
            <Music size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('geminiMusic', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('geminiMusicIntro', lang)}</p>
            <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-100">
              {t('geminiMusicAgeNote', lang)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={LYRICS_GEM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
              >
                <ExternalLink size={14} />
                {t('geminiMusicLyricsOpen', lang)}
              </a>
              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
              >
                <ExternalLink size={14} />
                {t('openGemini', lang)}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">
          <Music size={22} className="text-sky-500" />
          {t('geminiMusicShotTitle', lang)}
        </h3>
        <div className="step-card space-y-4">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('geminiMusicPoint1', lang)}</li>
            <li>{t('geminiMusicPoint2', lang)}</li>
            <li>{t('geminiMusicPoint3', lang)}</li>
            <li>{t('geminiMusicPoint4', lang)}</li>
          </ol>
          <img
            src={assetUrl('images/gemini/music-composer.png')}
            alt={t('geminiMusicShotAlt', lang)}
            className="h-auto w-full max-w-3xl rounded-lg border border-slate-200"
          />
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('geminiMusicLyricsTitle', lang)}</h3>
        <div className="step-card space-y-3">
          <p className="leading-relaxed text-slate-600">{t('geminiMusicLyricsIntro', lang)}</p>
          <a
            href={LYRICS_GEM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all rounded-full bg-sky-50 px-3.5 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100"
          >
            <ExternalLink size={14} className="shrink-0" />
            AI generated music on Gemini
          </a>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('geminiMusicPromptTitle', lang)}</h3>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">{t('geminiMusicPromptNote', lang)}</p>
        <PromptBlock text={MUSIC_PROMPT} label={t('copyPrompt', lang)} />
      </div>
    </div>
  );
}
