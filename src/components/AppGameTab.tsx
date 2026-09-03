import { PromptBlock } from './PromptBlock';
import { Gamepad2 } from 'lucide-react';
import { Lang, t } from '../i18n';

const SNAKE_PROMPT = `生成一個html數學貪食蛇遊戲
讓學生學習有向數的四式運算
可選擇難度：容易、中等、困難
加入道具系統增添遊玩趣味性(例如穿牆)`;

const TITRATION_PROMPT = `請扮演一位專業的前端開發工程師兼化學教育專家，使用 HTML、CSS 和 JavaScript 在單一檔案中撰寫一個功能完整的酸鹼滴定互動式網頁模擬器。在使用者介面的設計上，請將畫面清晰地劃分為控制面板與視覺模擬區，讓使用者能夠直觀地看見滴定管與錐形瓶的圖形呈現。模擬器必須允許使用者自由設定滴定液與待測液，可選擇的化學物質包含：強酸（HCl、H2SO4、HNO3）、弱酸（CH3COOH）、強鹼（NaOH、KOH）以及弱鹼（NH3、Na2CO3）。在指示劑方面，僅限提供甲基橙與酚酞供使用者選擇。在互動邏輯上，請設計一個滑桿或按鈕來精確控制從滴定管滴入錐形瓶的液體體積，並根據所選的酸鹼組合，在背景動態計算出即時的 pH 值。最重要的是，錐形瓶內的液體顏色必須根據當前的 pH 值與所選指示劑的化學特性進行精準的視覺變化（例如：甲基橙在 pH < 3.1 時為紅色，pH > 4.4 時為黃色；酚酞在 pH < 8.3 時為無色，pH > 10.0 時為紫紅色）。最後，請確保輸出的程式碼結構清晰、附帶註解，並且是可以直接執行於瀏覽器中的完整代碼。`;

interface Props {
  lang: Lang;
}

export function AppGameTab({ lang }: Props) {
  return (
    <div className="space-y-8 fade-in-up">
      {/* Steps */}
      <div>
        <h3 className="section-title">
          <Gamepad2 size={22} className="text-violet-500" />
          {t('appStepsTitle', lang)}
        </h3>

        <div className="space-y-6">
          <div className="step-card">
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">1</span>
                <span className="font-medium text-slate-700">{t('appStep1', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">2</span>
                <span className="font-medium text-slate-700">{t('appStep2', lang)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">3</span>
                <span className="font-medium text-slate-700">{t('appStep3', lang)}</span>
              </div>
            </div>
            <img src="/images/app-game-generation/app1.png" alt="App generation steps" className="rounded-lg border border-slate-200 max-w-full md:max-w-md" />
          </div>
        </div>
      </div>

      {/* Snake Prompt */}
      <div>
        <h3 className="section-title">{t('snakePromptTitle', lang)}</h3>
        <PromptBlock text={SNAKE_PROMPT} label={t('copyPrompt', lang)} />
      </div>

      {/* Playable game */}
      <div>
        <h3 className="section-title">{t('tryGame', lang)}</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <iframe
            src="/apps/index.html"
            title="Math Snake Game"
            className="w-full h-[600px] border-0"
          />
        </div>
      </div>

      {/* Other prompts */}
      <div>
        <h3 className="section-title">{t('otherPrompts', lang)}</h3>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-700">{t('titrationPromptTitle', lang)}</h4>
          <PromptBlock text={TITRATION_PROMPT} label={t('copyPrompt', lang)} />
        </div>
      </div>
    </div>
  );
}
