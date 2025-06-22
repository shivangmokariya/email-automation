import { defaultTemplates } from '../components/Templates';

// Get all unique positions from templates and user-added positions
export function getAllPositions(userPositions = []) {
  const templatePositions = defaultTemplates.map(t => t.position);
  const all = [...templatePositions, ...userPositions];
  return [...new Set(all)].sort();
}
