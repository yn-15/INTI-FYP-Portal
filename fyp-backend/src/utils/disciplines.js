// ── Discipline → Department mapping ───────────────────────────────────────────
// Single source of truth used by both the backend (auto-assign) and
// can be fetched by the frontend via GET /api/disciplines.
//
// Each entry: { label, department }
// department must match exactly the Department.name in the DB ('IT' or 'Business')

export const DISCIPLINES = [
  // ── IT ────────────────────────────────────────────────────────────────────
  { label: 'Software Engineering',              department: 'IT' },
  { label: 'Web Development',                   department: 'IT' },
  { label: 'Mobile Application Development',    department: 'IT' },
  { label: 'Data Science & Analytics',          department: 'IT' },
  { label: 'Artificial Intelligence',           department: 'IT' },
  { label: 'Machine Learning',                  department: 'IT' },
  { label: 'Cybersecurity',                     department: 'IT' },
  { label: 'Network & Infrastructure',          department: 'IT' },
  { label: 'Cloud Computing',                   department: 'IT' },
  { label: 'Internet of Things (IoT)',          department: 'IT' },
  { label: 'Database Systems',                  department: 'IT' },
  { label: 'UI/UX Design',                      department: 'IT' },
  { label: 'Game Development',                  department: 'IT' },
  { label: 'Embedded Systems',                  department: 'IT' },

  // ── Business ──────────────────────────────────────────────────────────────
  { label: 'Business Administration',           department: 'Business' },
  { label: 'Marketing & Digital Media',         department: 'Business' },
  { label: 'Finance & Accounting',              department: 'Business' },
  { label: 'Human Resource Management',         department: 'Business' },
  { label: 'Entrepreneurship & Innovation',     department: 'Business' },
  { label: 'Supply Chain & Logistics',          department: 'Business' },
  { label: 'E-Commerce',                        department: 'Business' },
  { label: 'Operations Management',             department: 'Business' },
  { label: 'Business Intelligence',             department: 'Business' },
  { label: 'Project Management',                department: 'Business' },
]

// Returns the department name for a given discipline label.
// Falls back to 'IT' if not found (safe default for this system).
export function getDepartmentForDiscipline(disciplineLabel) {
  const match = DISCIPLINES.find(d => d.label === disciplineLabel)
  return match?.department || 'IT'
}
