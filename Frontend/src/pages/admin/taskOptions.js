export const areas = [
    'research', 'university', 'career', 'jkkniu_research_society', 'programming',
    'learning', 'travel', 'personal', 'other',
];
export const priorities = ['low', 'medium', 'high', 'critical'];
export const statuses = ['planned', 'in_progress', 'blocked', 'completed', 'cancelled'];
export const labelFor = (value) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
export const pageResults = (data) => data?.results || data || [];
export const fieldClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500';
