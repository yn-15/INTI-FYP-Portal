import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Input.module.css'

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  disabled,
  rows,
  options, // for select type
  autoComplete,
}) {
  const [showPw, setShowPw] = useState(false)

  const isTextarea = type === 'textarea'
  const isSelect   = type === 'select'
  const isPassword = type === 'password'

  const inputClass = [styles.input, error ? styles.inputError : ''].join(' ')

  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span className={styles.req}>*</span>}
        </label>
      )}

      <div className={styles.inputWrap}>
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            className={`${inputClass} ${styles.textarea}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows || 4}
          />
        ) : isSelect ? (
          <select
            id={name}
            name={name}
            className={`${inputClass} ${styles.select}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select...</option>
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={isPassword ? (showPw ? 'text' : 'password') : type}
            className={`${inputClass} ${isPassword ? styles.withEye : ''}`}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
          />
        )}

        {isPassword && (
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPw(p => !p)}
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
