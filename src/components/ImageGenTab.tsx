import { PromptBlock } from './PromptBlock';
import { Image } from 'lucide-react';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';

const COMIC_PROMPT = `生成一個四格漫畫
內容是教導中三級學生圓錐體的體積及總表面面積
Chiikawa風格
繁體中文`;

const FIGURE_PROMPT = `Create a 1/7 scale commercialized figurine of the character in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base. The content on the computer screen is a 3D modeling process of this figurine. Next to the computer screen is a toy packaging box, designed in a style reminiscent of high-quality collectible figures, printed with original artwork. The packaging features two-dimensional flat illustrations of the figurine.`;

interface Props {
  lang: Lang;
}

export function ImageGenTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      {/* Steps */}
      <div>
        <h3 className="section-title">
          <Image size={22} className="text-rose-500" />
          {t('imageGenSteps', lang)}
        </h3>

        <div className="space-y-6">
          <div className="step-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">1</span>
              <span className="font-medium text-slate-700">{t('imageStep1', lang)}</span>
            </div>
            <img src={assetUrl('images/image-generation/image1.png')} alt="Step 1" className="rounded-lg border border-slate-200 max-w-full md:max-w-lg" />
          </div>

          <div className="step-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-sm font-bold">2</span>
              <span className="font-medium text-slate-700">{t('imageStep2', lang)}</span>
            </div>
            <img src={assetUrl('images/image-generation/image2.png')} alt="Step 2" className="rounded-lg border border-slate-200 max-w-full md:max-w-sm" />
          </div>
        </div>
      </div>

      {/* Comic Prompt */}
      <div>
        <h3 className="section-title">{t('comicPromptTitle', lang)}</h3>
        <PromptBlock text={COMIC_PROMPT} label={t('copyPrompt', lang)} />
        <div className="mt-4">
          <p className="text-sm text-slate-500 mb-2">{t('sampleOutput', lang)}</p>
          <img src={assetUrl('images/image-generation/image3.png')} alt="Comic example" className="rounded-lg border border-slate-200 max-w-full md:max-w-md" />
        </div>
      </div>

      {/* Figure Prompt */}
      <div>
        <h3 className="section-title">{t('figurePromptTitle', lang)}</h3>
        <p className="text-sm text-slate-500 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          {t('figureNote', lang)}
        </p>
        <PromptBlock text={FIGURE_PROMPT} label={t('copyPrompt', lang)} />
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-500">{t('sampleOutput', lang)}</p>
          <img src={assetUrl('images/image-generation/image4.png')} alt="Figure input" className="rounded-lg border border-slate-200 max-w-full md:max-w-lg" />
          <img src={assetUrl('images/image-generation/image5.png')} alt="Figure result" className="rounded-lg border border-slate-200 max-w-full md:max-w-lg" />
        </div>
      </div>
    </div>
  );
}
