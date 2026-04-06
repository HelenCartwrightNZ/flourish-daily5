'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2800)
    return () => clearTimeout(t)
  }, [message]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null

  return (
    <div className={`toast${visible ? ' show' : ''}`}>
      {message}
    </div>
  )
}
