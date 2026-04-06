'use client'

import type { PillarKey } from '@/lib/types'
import { pillars } from '@/lib/pillars'

interface Props {
  pillarKey: PillarKey
  isDone: boolean
  onComplete: (key: PillarKey) => void
  onClose: () => void
}

export default function PillarModal({ pillarKey, isDone, onComplete, onClose }: Props) {
  const p = pillars[pillarKey]

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay open" onClick={handleOverlayClick}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="pillar-modal-header">
          <div
            className="pillar-modal-icon"
            style={{ background: `color-mix(in srgb, ${p.cssVar} 15%, transparent)` }}
          >
            {p.icon}
          </div>
          <div className="pillar-modal-name">{p.name}</div>
        </div>

        <div
          className="pillar-modal-quote"
          style={{ '--pillar-color': p.cssVar } as React.CSSProperties}
        >
          {p.quote}
        </div>

        <div className="pillar-ideas-title">Quick ideas</div>
        <div className="pillar-ideas">
          {p.ideas.map(idea => (
            <div key={idea} className="idea-pill">{idea}</div>
          ))}
        </div>

        <button
          className="btn-done"
          style={{ '--pillar-color': p.cssVar } as React.CSSProperties}
          disabled={isDone}
          onClick={() => !isDone && onComplete(pillarKey)}
        >
          ✓&nbsp;&nbsp;{isDone ? 'Done today' : 'Mark as done today'}
        </button>
      </div>
    </div>
  )
}
