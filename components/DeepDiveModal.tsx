'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (blocker: string) => void
  onClose: () => void
}

const blockers = [
  { emoji: '⏰', text: "I don't have enough time" },
  { emoji: '😔', text: "I've been feeling low" },
  { emoji: '🌀', text: "I don't know where to start" },
  { emoji: '💸', text: 'Financial pressure is blocking me' },
  { emoji: '🤷', text: 'Something else entirely' },
]

export default function DeepDiveModal({ onSubmit, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleSubmit() {
    if (!selected) return
    onSubmit(selected)
  }

  return (
    <div className="modal-overlay open" onClick={handleOverlayClick}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-title">
          What&apos;s getting in the <em>way?</em>
        </div>
        <div className="modal-body">
          You haven&apos;t ticked this pillar for a few weeks. That&apos;s useful information — not a failure. What&apos;s making it hard?
        </div>
        <div className="blocker-options">
          {blockers.map(b => (
            <button
              key={b.text}
              className={`blocker-opt${selected === b.text ? ' selected' : ''}`}
              onClick={() => setSelected(b.text)}
            >
              <span className="blocker-emoji">{b.emoji}</span>
              {b.text}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button
            className="btn-confirm"
            onClick={handleSubmit}
            disabled={!selected}
            style={{ opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'default' }}
          >
            Send to Helen
          </button>
          <button className="btn-skip" onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  )
}
