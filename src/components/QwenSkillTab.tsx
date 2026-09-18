import { ExternalLink, Wand2 } from 'lucide-react';
import { PromptBlock } from './PromptBlock';
import { Lang, t } from '../i18n';
import { promptForLang } from '../promptLang';

export const QWEN_SKILL_SAVE_PROMPT =
  '幫我整理以上對話重點並分析我的習慣和需求，保存成skill，名稱是【數學分層工作紙】';

export const QWEN_SKILL_SAVE_PROMPT_EN =
  'Please summarise the key points of the conversation above, analyse my habits and needs, and save them as a skill named 【數學分層工作紙】.';

export const QWEN_SKILL_TEST_PROMPT =
  '建立skill後自動用一句新題目跑一次，並用一句模糊嘅話測試會唔會觸發。';

export const QWEN_SKILL_TEST_PROMPT_EN =
  'After creating the skill, automatically run it once with a new question, then test with a vague sentence whether it will trigger.';

export const QWEN_SKILL_UPDATE_PROMPT =
  '更新skill【數學分層工作紙】：要點如下：1.XXXX 2.XXXX';

export const QWEN_SKILL_UPDATE_PROMPT_EN =
  'Update skill 【數學分層工作紙】 with these points: 1.XXXX 2.XXXX';

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
    </div>
  );
}
