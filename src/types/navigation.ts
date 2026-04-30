export type TabId =
  | 'dashboard'
  | 'shelter'
  | 'er'
  | 'weather'
  | 'calculator'
  | 'calendar'
  | 'emergency'
  | 'fire-analysis'
  | 'multiuse'
  | 'hazmat'
  | 'annual-fire'
  | 'fire-damage'
  | 'hazards'
  | 'manual'
  | 'field-timer'
  | 'news'
  | 'policy'
  | 'wildfire'
  | 'law'
  | 'checklist'
  | 'equipment-cert';

export type LegacyShelterTab = 'hydrants' | 'waterTowers' | 'building';

export type NavigateTarget = TabId | LegacyShelterTab;
