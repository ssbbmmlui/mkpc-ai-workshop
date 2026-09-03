import { Lang, t } from '../i18n';

/** Dark purple sampled from the 伯裘 / PAK KAU wordmark in MKPC-Logo.png. */
export const SCHOOL_PURPLE = '#601986';

interface Props {
  lang: Lang;
}

export function SiteTitle({ lang }: Props) {
  const label = t('title', lang);
  const isEn = lang === 'en';
  const width = isEn ? 268 : 196;
  const fontSize = isEn ? 28 : 32;

  return (
    <h1 className="justify-self-center" aria-label={label}>
      <svg
        viewBox={`0 0 ${width} 48`}
        role="img"
        aria-hidden="true"
        className="h-8 w-auto sm:h-9 md:h-10"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill={SCHOOL_PURPLE}
          fontFamily="'Noto Sans TC', system-ui, sans-serif"
          fontSize={fontSize}
          fontWeight={600}
          letterSpacing={isEn ? 2.4 : 3.2}
        >
          {label}
        </text>
      </svg>
    </h1>
  );
}
