import { createContext, useContext } from 'react';
import type { SectionId } from '../components/sections.ts';

/** The section in focus. null means "not computed yet" (no JS, or no provider). */
export const ActiveSectionContext = createContext<SectionId | null>(null);

export function useActiveSectionId(): SectionId | null {
  return useContext(ActiveSectionContext);
}
