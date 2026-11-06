import React from 'react';

export function AnaliceIcon({ size = 27, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 27 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path id="analice-star-a" d="M13.7334 2.19357C13.9877 1.7485 14.2421 1.7485 14.4964 2.19357C15.2594 10.6817 16.4992 13.066 26.2272 13.9244C26.7359 14.1787 26.7359 14.4331 26.2272 14.6874C16.4992 15.5457 15.2594 17.93 14.4964 26.4182C14.2421 26.9269 13.9877 26.9269 13.7334 26.4182C12.9704 17.93 11.7306 15.5457 2.00258 14.6874C1.49393 14.4331 1.49393 14.1787 2.00258 13.9244C11.7306 13.066 12.9704 10.6817 13.7334 2.19357Z" fill="url(#paint0_linear_analice)" />
      <path id="analice-star-b" className="analice-star-small" d="M4.864 0.286118C5.05475 -0.0953726 5.24549 -0.0953726 5.43624 0.286118C5.81773 3.8149 6.38996 4.48251 10.0141 4.864C10.3956 5.05475 10.3956 5.24549 10.0141 5.43624C6.38996 5.81773 5.81773 6.48534 5.43624 10.0141C5.24549 10.3956 5.05475 10.3956 4.864 10.0141C4.48251 6.48534 3.91028 5.81773 0.286118 5.43624C-0.0953726 5.24549 -0.0953726 5.05475 0.286118 4.864C3.91028 4.48251 4.48251 3.8149 4.864 0.286118Z" fill="url(#paint1_linear_analice)" />
      <style>{`
        .analice-star-small {
          transform-box: view-box;
          transform-origin: 5px 5px;
          animation: analice-star-pulse 3.2s ease-in-out infinite;
        }
        @keyframes analice-star-pulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.35); }
          30% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .analice-star-small { animation: none; }
        }
      `}</style>
      <defs>
        <linearGradient id="paint0_linear_analice" x1="2.66241" y1="30.6153" x2="29.6708" y2="5.71077" gradientUnits="userSpaceOnUse">
          <stop offset="0.269318" stopColor="#3C096C" />
          <stop offset="0.573789" stopColor="#0191FF" />
          <stop offset="0.902987" stopColor="#99D3FF" />
        </linearGradient>
        <linearGradient id="paint1_linear_analice" x1="0.429246" y1="11.8761" x2="11.582" y2="1.61171" gradientUnits="userSpaceOnUse">
          <stop offset="0.269318" stopColor="#3C096C" />
          <stop offset="0.573789" stopColor="#0191FF" />
          <stop offset="0.902987" stopColor="#99D3FF" />
        </linearGradient>
        <clipPath id="analice-shine-clip">
          <use href="#analice-star-a" />
          <use href="#analice-star-b" />
        </clipPath>
      </defs>
      {/* Brillo: franja blanca que cruza el icono y luego descansa un momento */}
      <g clipPath="url(#analice-shine-clip)" pointerEvents="none">
        <rect x="0" y="-10" width="6" height="50" fill="white" opacity="0.75" transform="rotate(25 13.5 13.5)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-22 0;34 0;34 0"
            keyTimes="0;0.35;1"
            dur="3s"
            repeatCount="indefinite"
            additive="sum"
          />
        </rect>
      </g>
    </svg>
  );
}
