import type { PillarKey } from './types'

export interface Pillar {
  key: PillarKey
  icon: string
  name: string
  cssVar: string
  quote: string
  ideas: string[]
}

export const pillars: Record<PillarKey, Pillar> = {
  soul: {
    key: 'soul',
    icon: '🌸',
    name: 'Feed Your Soul',
    cssVar: 'var(--soul)',
    quote: 'One act that makes your heart sing — non-negotiable self-investment.',
    ideas: [
      'Walk in the sunshine',
      'Listen to music you love',
      'Ten minutes in silence',
      'Read something beautiful',
      'Tend your garden',
      'Light a candle',
      'Dance in your kitchen',
    ],
  },
  roots: {
    key: 'roots',
    icon: '🌱',
    name: 'Tend Your Roots',
    cssVar: 'var(--roots)',
    quote: 'Isolation is the oxygen of shame. One connection changes everything.',
    ideas: [
      'Text someone you love',
      'A five-minute call',
      'Say thank you to someone',
      'Check in on a friend',
      'Share a meme',
      'Write a card',
      'A coffee with someone',
    ],
  },
  body: {
    key: 'body',
    icon: '💙',
    name: 'Nourish Your Body',
    cssVar: 'var(--body)',
    quote: 'Treat your body as the one-time gift that it is.',
    ideas: [
      'A 15-minute walk',
      'Eat something real',
      'Drink more water',
      'Rest intentionally',
      'Ten minutes of stretching',
      'Time outside',
      'Early to bed tonight',
    ],
  },
  bank: {
    key: 'bank',
    icon: '💰',
    name: 'Feed Your Bank',
    cssVar: 'var(--bank)',
    quote: 'Earn it, save it, or spend it with purpose — financial empowerment creates calm.',
    ideas: [
      'One income-generating action',
      'Review your spending',
      'Set one money intention',
      'Pay one bill',
      'Review a subscription',
      'Make a sale',
      'Save something small',
    ],
  },
  brain: {
    key: 'brain',
    icon: '🧠',
    name: 'Feed Your Brain',
    cssVar: 'var(--brain)',
    quote: 'Confidence follows information — add something to your knowledge today.',
    ideas: [
      'Read one article',
      'Listen to a podcast',
      'Learn one new thing',
      'Watch something educational',
      'Revisit a framework',
      'Ask a question',
      'Reflect in your journal',
    ],
  },
}

export const pillarOrder: PillarKey[] = ['soul', 'roots', 'body', 'bank', 'brain']
