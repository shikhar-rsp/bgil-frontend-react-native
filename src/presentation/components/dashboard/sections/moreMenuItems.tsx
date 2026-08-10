import React from 'react';
import { Notepad } from 'phosphor-react-native';
import type { MoreMenuItem } from '@atlas-ds/react-native';

/**
 * Tiles for the BottomNav's "More" popup — shared by the agent, RM and trainee
 * dashboards so all three open the same grid.
 *
 * `onSelect` receives the tile key; a dashboard maps the keys it can route
 * (e.g. `tasks` → the Tasks nav tab, `notes` → the notes sheet) and simply
 * closes the menu for the rest, which are surfaces of a later porting phase.
 *
 * Notes is opt-in via `options.notes` — only the agent dashboard owns a
 * NotesSheet. It used to be a button in the Tasks header.
 */
export const buildMoreMenuItems = (
  onSelect: (key: string) => void,
  options?: { notes?: boolean },
): MoreMenuItem[] => {
  const items: Omit<MoreMenuItem, 'onPress'>[] = [
    { key: 'tasks', label: 'Tasks', color: '#0D9488', iconName: 'tasks' },
    { key: 'claims', label: 'Claims', color: '#2563EB', iconName: 'claims' },
    { key: 'endorsements', label: 'Endorsements', color: '#7C3AED', iconName: 'endorsements' },
    { key: 'campaign', label: 'Campaign', color: '#EA580C', iconName: 'campaign' },
    { key: 'learn', label: 'Learn', color: '#DB2777', iconName: 'learn' },
    { key: 'tools', label: 'Tools', color: '#059669', iconName: 'tools' },
  ];
  // No built-in glyph for notes — pass a white 28×28 Phosphor node instead.
  if (options?.notes) {
    items.push({ key: 'notes', label: 'Notes', color: '#475569', icon: <Notepad size={28} color="#FFFFFF" /> });
  }
  return items.map((item) => ({ ...item, onPress: () => onSelect(item.key) }));
};
