// Campus themes from the Figma "University themes" board. Each campus gets the
// same screens in its own colours, badge and uniform.

export type Theme = {
  /** Header colour: the big coloured area at the top of screens and splash. */
  brand: string;
  /** Dark companion colour: "Contact" buttons, splash floor. */
  brandDeep: string;
  /** Figma "Primary": buttons, active tab. */
  accent: string;
  /** Figma "Accent": glow, stars, eyebrow text on the header. */
  highlight: string;
  /** Figma "Third": background blobs, secondary fills. */
  third: string;
  /** Figma "Soft": highlights, active tab pill, selected chips. */
  soft: string;
  /** Figma "Tint": cards, tags. */
  tint: string;
  /** Colour of the longyi/skirt on this campus's stickman uniform. */
  uniform: string;
  /** Text on top of `accent`. */
  onAccent: string;
};

export type University = {
  id: string;
  /** Badge text, e.g. "TUKSE". */
  short: string;
  /** Market chip label, e.g. "TU (Kyaukse)". */
  label: string;
  name: string;
  city: string;
  theme: Theme;
};

/**
 * CampusLoop's own look before a campus is chosen: the black-plum of the Figma
 * header frame (#18020C to #670E3C), flattened, with the Dusk pink buttons.
 */
export const DEFAULT_THEME: Theme = {
  brand: '#1E0413',
  brandDeep: '#12010A',
  accent: '#D12A7C',
  highlight: '#FFC94A',
  third: '#670E3C',
  soft: '#FBE3EE',
  tint: '#F7F1FA',
  uniform: '#2F4FA8',
  onAccent: '#FFFFFF',
};

export const DEFAULT_THEME_ID = 'campusloop';

// Colours are read off the Figma theme cards. Check them against the file's
// variables once the Figma API is reachable again.
export const UNIVERSITIES: University[] = [
  {
    id: 'tukse',
    short: 'TUKSE',
    label: 'TU (Kyaukse)',
    name: 'Technological University (Kyaukse)',
    city: 'Kyaukse',
    theme: { brand: '#F2A71B', brandDeep: '#13245E', accent: '#1C3FA8', highlight: '#F5B400', third: '#C8102E', soft: '#FFE8A3', tint: '#EEF2FF', uniform: '#1C3FA8', onAccent: '#FFFFFF' },
  },
  {
    id: 'wytu',
    short: 'WYTU',
    label: 'WYTU',
    name: 'West Yangon Technological University',
    city: 'Yangon',
    theme: { brand: '#F39A2E', brandDeep: '#5A2E0E', accent: '#E8811A', highlight: '#FBC58A', third: '#4CAF50', soft: '#FFF1D6', tint: '#FFF7EC', uniform: '#5A2E0E', onAccent: '#FFFFFF' },
  },
  {
    id: 'utycc',
    short: 'UTYCC',
    label: 'UTYCC',
    name: 'University of Technology (Yatanarpon Cyber City)',
    city: 'Pyin Oo Lwin',
    theme: { brand: '#1F2C9E', brandDeep: '#141D6E', accent: '#2233A8', highlight: '#6FE0C4', third: '#3D6BE0', soft: '#E6F0FF', tint: '#EEF0FF', uniform: '#1F2C9E', onAccent: '#FFFFFF' },
  },
  {
    id: 'miit',
    short: 'MIIT',
    label: 'MIIT',
    name: 'Myanmar Institute of Information Technology',
    city: 'Mandalay',
    theme: { brand: '#1A3496', brandDeep: '#10226A', accent: '#2247D0', highlight: '#F7C400', third: '#5B3CC4', soft: '#FFF6BF', tint: '#EEF1FF', uniform: '#142C8C', onAccent: '#FFFFFF' },
  },
  {
    id: 'sfu',
    short: 'SFU',
    label: 'Strategy First',
    name: 'Strategy First University',
    city: 'Yangon',
    theme: { brand: '#D62718', brandDeep: '#1E1E1E', accent: '#111111', highlight: '#FFE7D6', third: '#D62718', soft: '#FBE3E1', tint: '#FFF1F0', uniform: '#111111', onAccent: '#FFFFFF' },
  },
];

export function findUniversity(id: string | null | undefined) {
  return UNIVERSITIES.find((university) => university.id === id) ?? null;
}
