import { ExternalLink, Music } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { assetUrl } from '../assetUrl';
import { Lang, t } from '../i18n';

const LYRICS_GEM_URL =
  'https://gemini.google.com/gem/1Sbl0Fkjs_oplBphYPKEjLG40fSe5qX1r?usp=sharing';

const MUSIC_PROMPT = `[Intro]
Flame test, name the flame
Four metals, four colours, sing the same

[Rap Verse 1]
Three point five, the flame test, heat the sample strong
Metals and metallic compounds each burn with their own colour song
Clean the wire, platinum or nichrome, hold it in your hand
Concentrated hydrochloric acid, moisten the wire and
Dip it in the crushed sample, lift it to the light
Non-luminous Bunsen flame, inner blue cone, hottest height
Put the tip above that cone and watch the colour rise
The flame colour names the metal, so open up your eyes

[Chorus]
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame

[Rap Verse 2]
Read the colour, call the metal, say it loud and clear
Sodium ions in the fire, golden yellow appears
Common salt contains those sodium ions, so the flame goes golden yellow
Potassium ions hit the flame, the lilac starts to glow
Calcium ions burn brick-red, you know it when you see
Copper ions burn bluish green, that colour sets them free
One colour, one metal, lock the four inside your head
Golden yellow, lilac, brick-red, bluish green, that’s what the flame test said

[Chorus]
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame

[Bridge]
Golden yellow, sodium
Lilac, potassium
Brick-red, calcium
Bluish green, copper
Say it again

[Final Chorus]
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame

[Outro]
Sodium, golden yellow flame
Potassium, lilac flame
Calcium, brick-red flame
Copper, bluish green flame`;

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
        <div className="step-card">
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
        <PromptBlock text={MUSIC_PROMPT} label={t('copyPrompt', lang)} maxHeight="480px" />
      </div>
    </div>
  );
}
