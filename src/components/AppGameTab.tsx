import { PromptBlock } from './PromptBlock';
import { Gamepad2 } from 'lucide-react';
import { Lang, t } from '../i18n';
import { assetUrl } from '../assetUrl';
import { promptForLang } from '../promptLang';

const SNAKE_PROMPT = `請幫我製作一個「學科 HTML 互動遊戲」，並輸出完整的單一 HTML 檔案，HTML、CSS、JavaScript 全部放在同一個檔案內，可直接在瀏覽器運行。

遊戲資料：
科目：【數學】
年級：【初中】
學習主題：【正負數的運算】
學生程度：【基礎／中等／進階】
遊戲風格：【可愛卡通】
遊戲玩法：【貪食蛇】
游戲道具：【穿墻、慢速、增加生命值】
游戲難度：【隨著分數增加進階：青銅、白銀、黃金、鑽石、王者】

設計要求：
1.需要包含開始畫面、玩法說明、互動操作、分數系統、即時回饋、完成畫面和重新開始按鈕。
2.介面要清晰、美觀，適配電腦、平板和手機使用，右上角允許玩家切換不同的設備。
3.不要使用外部圖片或第三方套件，圖像可用 CSS、emoji 或簡單圖形製作。
4.請直接輸出完整 HTML 程式碼，不要省略任何部分。
5.允許你自行優化這個遊戲，增加可玩性並滿足學習需求。
6.在最後生成一張證書，以鼓勵學生。`;

const SNAKE_PROMPT_EN = `Please create a “subject HTML interactive game” and output a complete single HTML file. Put the HTML, CSS, and JavaScript all in the same file so it can run directly in a browser.

Game details:
Subject: 【Mathematics】
Year group: 【Junior secondary】
Learning topic: 【Operations with positive and negative numbers】
Student level: 【Foundation / Intermediate / Advanced】
Game style: 【Cute cartoon】
Gameplay: 【Snake】
Game items: 【Pass through walls, slow down, extra lives】
Difficulty: 【Advances with score: Bronze, Silver, Gold, Diamond, King】

Design requirements:
1. Include a start screen, how-to-play, interactive controls, a score system, instant feedback, a completion screen, and a restart button.
2. The interface should be clear and attractive, and work on computer, tablet, and phone. Allow the player to switch devices in the top-right corner.
3. Do not use external images or third-party libraries. Graphics may be made with CSS, emoji, or simple shapes.
4. Output the complete HTML code directly. Do not omit any part.
5. You may improve the game yourself to make it more playable and to meet the learning needs.
6. Generate a certificate at the end to encourage students.`;

const TITRATION_PROMPT = `請扮演一位專業的前端開發工程師兼化學教育專家，使用 HTML、CSS 和 JavaScript 在單一檔案中撰寫一個功能完整的酸鹼滴定互動式網頁模擬器。在使用者介面的設計上，請將畫面清晰地劃分為控制面板與視覺模擬區，讓使用者能夠直觀地看見滴定管與錐形瓶的圖形呈現。模擬器必須允許使用者自由設定滴定液與待測液，可選擇的化學物質包含：強酸（HCl、H2SO4、HNO3）、弱酸（CH3COOH）、強鹼（NaOH、KOH）以及弱鹼（NH3、Na2CO3）。在指示劑方面，僅限提供甲基橙與酚酞供使用者選擇。在互動邏輯上，請設計一個滑桿或按鈕來精確控制從滴定管滴入錐形瓶的液體體積，並根據所選的酸鹼組合，在背景動態計算出即時的 pH 值。最重要的是，錐形瓶內的液體顏色必須根據當前的 pH 值與所選指示劑的化學特性進行精準的視覺變化（例如：甲基橙在 pH < 3.1 時為紅色，pH > 4.4 時為黃色；酚酞在 pH < 8.3 時為無色，pH > 10.0 時為紫紅色）。最後，請確保輸出的程式碼結構清晰、附帶註解，並且是可以直接執行於瀏覽器中的完整代碼。`;

const TITRATION_PROMPT_EN = `Please act as a professional front-end engineer and chemistry education expert. Using HTML, CSS, and JavaScript in a single file, write a fully functional interactive acid–base titration web simulator. For the user interface, divide the screen clearly into a control panel and a visual simulation area so users can see the burette and conical flask graphically. The simulator must let users freely set the titrant and the analyte. Available chemicals include: strong acids (HCl, H2SO4, HNO3), a weak acid (CH3COOH), strong bases (NaOH, KOH), and weak bases (NH3, Na2CO3). For indicators, provide only methyl orange and phenolphthalein. For interaction, design a slider or buttons to precisely control the volume dropped from the burette into the flask, and dynamically calculate the live pH in the background from the chosen acid–base pair. Most importantly, the liquid colour in the flask must change accurately according to the current pH and the chemical properties of the selected indicator (for example: methyl orange is red when pH < 3.1 and yellow when pH > 4.4; phenolphthalein is colourless when pH < 8.3 and magenta when pH > 10.0). Finally, ensure the output code is clearly structured, commented, and a complete file that can run directly in a browser.`;

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
            <img src={assetUrl('images/app-game-generation/app1.png')} alt="App generation steps" className="rounded-lg border border-slate-200 max-w-full md:max-w-md" />
          </div>
        </div>
      </div>

      {/* Snake Prompt */}
      <div>
        <h3 className="section-title">{t('snakePromptTitle', lang)}</h3>
        <PromptBlock text={promptForLang(lang, SNAKE_PROMPT, SNAKE_PROMPT_EN)} label={t('copyPrompt', lang)} />
      </div>

      {/* Playable game */}
      <div>
        <h3 className="section-title">{t('tryGame', lang)}</h3>
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <iframe
            src={assetUrl('apps/index.html')}
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
          <PromptBlock text={promptForLang(lang, TITRATION_PROMPT, TITRATION_PROMPT_EN)} label={t('copyPrompt', lang)} />
          <h4 className="text-lg font-semibold text-slate-700">{t('tryTitration', lang)}</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <iframe
              src={assetUrl('apps/titration.html')}
              title="Acid-Base Titration Simulator"
              className="h-[1400px] w-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
