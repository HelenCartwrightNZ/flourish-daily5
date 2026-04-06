'use client'

import type { ActiveScreen } from '@/lib/types'

interface Props {
  active: ActiveScreen
  onNavChange: (screen: ActiveScreen) => void
}

const items: { id: ActiveScreen; icon: string; label: string }[] = [
  { id: 'home', icon: '🌸', label: 'Today' },
  { id: 'weekly', icon: '📊', label: 'Weekly' },
  { id: 'profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav({ active, onNavChange }: Props) {
  return (
    <div className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`nav-item${active === item.id ? ' active' : ''}`}
          onClick={() => onNavChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
