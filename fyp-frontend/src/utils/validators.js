// ── Email format validators per role ──────────────────────────────────────────
export function isStudentEmail(email) {
  return /^J\d+@student\.newinti\.edu\.my$/i.test(email.trim())
}

export function isLecturerEmail(email) {
  return /^[a-z0-9.]+@newinti\.edu\.my$/i.test(email.trim()) &&
    !email.toLowerCase().includes('student')
}

export function isEmployerEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !email.toLowerCase().includes('newinti.edu.my')
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ── Password strength ─────────────────────────────────────────────────────────
export function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#E5E5E5' }
  let score = 0
  if (pw.length >= 8)           score++
  if (/[A-Z]/.test(pw))         score++
  if (/[0-9]/.test(pw))         score++
  if (/[^A-Za-z0-9]/.test(pw))  score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#E5E5E5', '#DC2626', '#D97706', '#2563EB', '#16A34A']
  return { score, label: labels[score], color: colors[score] }
}

// ── Password rules ────────────────────────────────────────────────────────────
export function validatePassword(pw) {
  if (!pw) return 'Password is required'
  if (pw.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(pw)) return 'Include at least one uppercase letter'
  if (!/[0-9]/.test(pw)) return 'Include at least one number'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Include at least one symbol (e.g. @, #, !)'
  return null
}

// ── Registration form validation ──────────────────────────────────────────────
export function validateRegisterForm(data) {
  const errors = {}

  if (!data.first_name?.trim()) errors.first_name = 'First name is required'
  if (!data.last_name?.trim())  errors.last_name  = 'Last name is required'

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (data.role === 'student' && !isStudentEmail(data.email)) {
    errors.email = 'Student email must be in the format: J[StudentID]@student.newinti.edu.my'
  } else if (data.role === 'lecturer' && !isLecturerEmail(data.email)) {
    errors.email = 'Lecturer email must be in the format: firstname.lastname@newinti.edu.my'
  } else if (data.role === 'employer' && !isEmployerEmail(data.email)) {
    errors.email = 'Please use your official company email address (not an INTI email)'
  }

  const pwError = validatePassword(data.password)
  if (pwError) errors.password = pwError

  if (data.role === 'employer' && !data.company_name?.trim()) {
    errors.company_name = 'Company name is required'
  }

  if (!data.agreed) {
    errors.agreed = 'You must agree to the Terms of Use'
  }

  return errors
}
