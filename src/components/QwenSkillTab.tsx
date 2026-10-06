import { ExternalLink, Wand2 } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { assetUrl } from '../assetUrl';
import { Lang, t } from '../i18n';
import { promptForLang } from '../promptLang';

export const QWEN_SKILL_SAVE_PROMPT =
  '請整理上述對話的重點，並分析本人的習慣與需求，建立一份可上載至 Qwen Work 的 SKILL.md。Skill 名稱為【數學分層工作紙】。請於檔案開頭以 YAML 寫明 name 與 description。';

export const QWEN_SKILL_SAVE_PROMPT_EN =
  'Please summarise the key points of the conversation above, analyse my habits and needs, and create a SKILL.md file that can be uploaded to Qwen Work. Name the skill 【數學分層工作紙】. Write the name and description in YAML at the top of the file.';

export const QWEN_SKILL_TEST_PROMPT =
  '建立 Skill 後，請先以一道新題目自動執行一次，再以一句含糊的語句測試是否會觸發。';

export const QWEN_SKILL_TEST_PROMPT_EN =
  'After creating the skill, automatically run it once with a new question, then test with a vague sentence whether it will trigger.';

export const QWEN_SKILL_UPDATE_PROMPT =
  '請更新 Skill【數學分層工作紙】，要點如下：1.XXXX 2.XXXX';

export const QWEN_SKILL_UPDATE_PROMPT_EN =
  'Please update the skill 【數學分層工作紙】 with these points: 1.XXXX 2.XXXX';

const SKILL_UPLOAD_STEPS = [
  { step: 1, image: 'images/qwen-work/skill-add.png' },
  { step: 2, image: 'images/qwen-work/skill-upload.png' },
  { step: 3, image: 'images/qwen-work/skill-use.png' },
  { step: 4, image: 'images/qwen-work/skill-test.png' },
] as const;

interface Props {
  lang: Lang;
}

export function QwenSkillTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      <div className="step-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400 to-indigo-600">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="section-title mb-2">{t('qwenSkill', lang)}</h2>
            <p className="leading-relaxed text-slate-600">{t('qwenSkillIntro', lang)}</p>
            <a
              href="https://qwenwork.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
            >
              <ExternalLink size={14} />
              {t('openQwenWork', lang)}
            </a>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title">
          <Wand2 size={22} className="text-violet-500" />
          {t('qwenSkillBenefitsTitle', lang)}
        </h3>
        <div className="step-card space-y-4">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
            <li>{t('qwenSkillBenefit1', lang)}</li>
            <li>
              {t('qwenSkillBenefit2', lang)}
              <p className="mt-2 rounded-xl bg-violet-50 px-3.5 py-2.5 text-slate-700 ring-1 ring-violet-100">
                {t('qwenSkillTriggerExample', lang)}
              </p>
            </li>
          </ol>
        </div>
      </div>

      <div>
        <h3 className="section-title">{t('qwenSkillStepsTitle', lang)}</h3>
        <div className="step-card space-y-3">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-start gap-2">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {step}
              </span>
              <span className="font-medium text-slate-700">{t(`qwenSkillStep${step}`, lang)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{t('qwenSkillStepsNote', lang)}</p>
      </div>

      <div>
        <h3 className="section-title">{t('qwenSkillSavePromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_SKILL_SAVE_PROMPT, QWEN_SKILL_SAVE_PROMPT_EN)} label={t('copyPrompt', lang)} />
      </div>

      <div>
        <h3 className="section-title">{t('qwenSkillTestPromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_SKILL_TEST_PROMPT, QWEN_SKILL_TEST_PROMPT_EN)} label={t('copyPrompt', lang)} />
      </div>

      <div>
        <h3 className="section-title">{t('qwenSkillUpdatePromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, QWEN_SKILL_UPDATE_PROMPT, QWEN_SKILL_UPDATE_PROMPT_EN)} label={t('copyPrompt', lang)} />
      </div>

      <div>
        <h3 className="section-title">{t('qwenSkillUploadTitle', lang)}</h3>
        <p className="mb-4 leading-relaxed text-slate-600">{t('qwenSkillUploadIntro', lang)}</p>
        <div className="space-y-6">
          {SKILL_UPLOAD_STEPS.map(({ step, image }) => {
            const caption = t(`qwenSkillUploadStep${step}`, lang);
            return (
              <figure key={step} className="step-card">
                <figcaption className="mb-3 flex items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                    {step}
                  </span>
                  <span className="font-medium leading-relaxed text-slate-700">{caption}</span>
                </figcaption>
                <img
                  src={assetUrl(image)}
                  alt={caption}
                  className="h-auto w-full max-w-3xl rounded-lg border border-slate-200"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
