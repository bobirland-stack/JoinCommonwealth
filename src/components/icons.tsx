/* ============================================================================
   icons.tsx — the small inline SVG set the resident app uses.
   ----------------------------------------------------------------------------
   Each icon renders a bare <svg viewBox="0 0 24 24"> with its paths. Size,
   stroke color, and stroke width all come from the surrounding CSS (e.g.
   `.prov svg`, `.tabbar a svg`), exactly as in the reference, so these are
   presentation-only and take no props. Paths are ported verbatim from
   reference/commonwealth-resident-app.html.
   ========================================================================== */

import type { ReactElement } from "react";

const svg = (children: ReactElement | ReactElement[]) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

export const IconCheck = () => svg(<path d="M20 6 9 17l-5-5" />);
export const IconPlus = () => svg(<path d="M12 5v14M5 12h14" />);
export const IconChevronDown = () => svg(<path d="M6 9l6 6 6-6" />);
export const IconArrow = () => svg(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconHome = () => svg(<path d="M3 12l9-9 9 9M5 10v10h14V10" />);

export const IconSearch = () =>
  svg([
    <circle key="a" cx="11" cy="11" r="7" />,
    <path key="b" d="m21 21-4.3-4.3" />,
  ]);

export const IconMark = () => svg(<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />);

export const IconDoc = () =>
  svg([
    <path key="a" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />,
    <path key="b" d="M14 2v6h6" />,
  ]);

export const IconClock = () =>
  svg(<path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />);

export const IconPin = () =>
  svg([
    <path key="a" d="M12 22s8-4 8-10a8 8 0 1 0-16 0c0 6 8 10 8 10Z" />,
    <circle key="b" cx="12" cy="12" r="2.5" />,
  ]);

export const IconBell = () =>
  svg(<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />);

export const IconShieldCheck = () =>
  svg([
    <path key="a" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    <path key="b" d="m9 12 2 2 4-4" />,
  ]);

export const IconInfo = () =>
  svg([
    <circle key="a" cx="12" cy="12" r="10" />,
    <path key="b" d="M12 16v-4M12 8h.01" />,
  ]);

export const IconExternal = () =>
  svg(<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />);

export const IconRadar = () =>
  svg(<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />);

export const IconGavel = () =>
  svg(<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M10 21v-4h4v4" />);

export const IconPlay = () => svg(<path d="M6 4l14 8-14 8V4z" />);

/* --- tab-bar icons --------------------------------------------------------- */
export const IconTabHome = () => svg(<path d="M3 12l9-9 9 9M5 10v10h14V10" />);
export const IconTabCalendar = () =>
  svg([
    <rect key="a" x="3" y="4" width="18" height="18" rx="2" />,
    <path key="b" d="M16 2v4M8 2v4M3 10h18" />,
  ]);
export const IconTabGov = () =>
  svg(<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" />);
export const IconTabTake = () =>
  svg(<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />);
export const IconTabYou = () =>
  svg([
    <circle key="a" cx="12" cy="8" r="4" />,
    <path key="b" d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />,
  ]);
