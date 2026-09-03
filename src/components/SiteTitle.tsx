import { useId } from 'react';
import { Lang, t } from '../i18n';

interface Props {
  lang: Lang;
}

export function SiteTitle({ lang }: Props) {
  const uid = useId().replace(/:/g, '');
  const label = t('title', lang);
  const isEn = lang === 'en';
  const width = isEn ? 412 : 318;
  const textGrad = `${uid}-text`;
  const chipGrad = `${uid}-chip`;
  const coreGrad = `${uid}-core`;
  const lineGrad = `${uid}-line`;
  const glow = `${uid}-glow`;
  const grid = `${uid}-grid`;

  return (
    <h1 className="min-w-0" aria-label={label}>
      <svg
        viewBox={`0 0 ${width} 56`}
        role="img"
        aria-hidden="true"
        className="site-title-svg h-10 w-auto max-w-[min(100%,22rem)] md:h-[3.25rem] md:max-w-none"
      >
        <defs>
          <linearGradient id={textGrad} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="38%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id={chipGrad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <radialGradient id={coreGrad} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="45%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4c1d95" />
          </radialGradient>
          <linearGradient id={lineGrad} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </linearGradient>
          <pattern id={grid} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0H0V6" fill="none" stroke="#c4b5fd" strokeOpacity="0.35" strokeWidth="0.4" />
          </pattern>
          <filter id={glow} x="-30%" y="-40%" width="160%" height="180%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(4 8)">
          {[8, 20, 32].map((y) => (
            <rect key={`l${y}`} x="-3" y={y - 1.2} width="3" height="2.4" rx="0.4" fill="#a78bfa" />
          ))}
          {[8, 20, 32].map((y) => (
            <rect key={`r${y}`} x="40" y={y - 1.2} width="3" height="2.4" rx="0.4" fill="#818cf8" />
          ))}
          {[8, 20, 32].map((x) => (
            <rect key={`t${x}`} x={x - 1.2} y="-3" width="2.4" height="3" rx="0.4" fill="#a78bfa" />
          ))}
          {[8, 20, 32].map((x) => (
            <rect key={`b${x}`} x={x - 1.2} y="40" width="2.4" height="3" rx="0.4" fill="#818cf8" />
          ))}

          <rect x="0" y="0" width="40" height="40" rx="8" fill={`url(#${chipGrad})`} />
          <rect x="1.2" y="1.2" width="37.6" height="37.6" rx="7" fill="none" stroke="#ede9fe" strokeOpacity="0.55" strokeWidth="0.8" />
          <rect x="5" y="5" width="30" height="30" rx="5" fill={`url(#${grid})`} fillOpacity="0.9" />
          <rect x="5" y="5" width="30" height="30" rx="5" fill="#1e1b4b" fillOpacity="0.28" />

          <g className="site-title-orbit">
            <circle cx="20" cy="20" r="11.5" fill="none" stroke="#c4b5fd" strokeOpacity="0.75" strokeWidth="0.7" strokeDasharray="3.2 5.4" />
          </g>

          <path
            d="M20 9.5 V14 M20 26 V30.5 M9.5 20 H14 M26 20 H30.5"
            stroke="#e9d5ff"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="5.6" fill={`url(#${coreGrad})`} filter={`url(#${glow})`} className="site-title-core" />
          <circle cx="20" cy="20" r="2.1" fill="#faf5ff" />
        </g>

        <path
          d="M48 28 H56"
          stroke="#a78bfa"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <g filter={`url(#${glow})`}>
          <text
            x="62"
            y="33"
            fill={`url(#${textGrad})`}
            fontFamily="Orbitron, Noto Sans TC, system-ui, sans-serif"
            fontSize="22"
            fontWeight="800"
            letterSpacing="1.8"
          >
            AI
          </text>
          <text
            x="112"
            y="33.5"
            fill={`url(#${textGrad})`}
            fontFamily={isEn ? 'Orbitron, Noto Sans TC, system-ui, sans-serif' : 'Noto Sans TC, system-ui, sans-serif'}
            fontSize={isEn ? 22 : 24}
            fontWeight="800"
            letterSpacing={isEn ? '0.6' : '1.4'}
          >
            {isEn ? 'Workshop' : '工作坊'}
          </text>
        </g>

        <g transform="translate(62 36)">
          <path
            d={isEn ? 'M0 4 H290' : 'M0 4 H210'}
            stroke={`url(#${lineGrad})`}
            strokeWidth="1.15"
            fill="none"
          />
          <path
            d={isEn ? 'M18 4 H70 M110 4 V10 H140' : 'M18 4 H58 M92 4 V10 H118'}
            stroke="#8b5cf6"
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="square"
          />
          {(isEn ? [0, 70, 140, 210, 290] : [0, 58, 118, 210]).map((x) => (
            <circle key={x} cx={x} cy="4" r="1.7" fill="#c4b5fd" />
          ))}
          <circle cx={isEn ? 140 : 118} cy="10" r="1.5" fill="#818cf8" />
        </g>
      </svg>
    </h1>
  );
}
