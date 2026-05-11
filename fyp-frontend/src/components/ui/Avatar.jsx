import { getInitials } from '../../utils/helpers'
import styles from './Avatar.module.css'

const COLORS = [
  '#CC0000','#A30000','#1A1A1A','#2563EB',
  '#16A34A','#D97706','#7C3AED','#0891B2',
]

function getColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function Avatar({ firstName = '', lastName = '', size = 'md', src }) {
  const initials = getInitials(firstName, lastName)
  const color    = getColor(`${firstName}${lastName}`)

  const sizeMap = { xs: 24, sm: 32, md: 40, lg: 52, xl: 64 }
  const fontMap  = { xs: 9,  sm: 11, md: 14, lg: 18, xl: 22 }

  const px = sizeMap[size] || 40
  const fs = fontMap[size] || 14

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={styles.img}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className={styles.avatar}
      style={{ width: px, height: px, background: color, fontSize: fs }}
      title={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  )
}
