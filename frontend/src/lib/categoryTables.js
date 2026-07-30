// Maps each category to its own Supabase table.
// Table name == category id from CategoryCards.jsx. Add/edit entries here if a
// table name ever needs to differ from its category id.
export const CATEGORY_TABLE = {
  Funnel: 'Funnel',
  Loop: 'Loop',
  Matrix: 'Matrix',
  'Mind Map': 'Mind Map',
  'n point infographic': 'n point infographic',
  'Organizational Tree': 'Organizational Tree',
  'Process & Flow': 'Process & Flow',
  'Steps': 'Steps',
  Timeline: 'Timeline',
  'Venn Diagram': 'Venn Diagram',
};

export function getTableForCategory(category) {
  return CATEGORY_TABLE[category] || null;
}