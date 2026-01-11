'use client'

import { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

type AnimationType = 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'terminal-glitch'

interface AnimatedSectionProps {
  children: ReactNode
  animation?: AnimationType
  delay?: number
  className?: string
  threshold?: number
}

const animationClasses: Record<AnimationType, { hidden: string; visible: string }> = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-in': {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  'slide-left': {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'slide-right': {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'terminal-glitch': {
    hidden: 'opacity-0 blur-sm',
    visible: 'opacity-100 blur-0',
  },
}

export function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  threshold = 0.1,
}: AnimatedSectionProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold })
  const { hidden, visible } = animationClasses[animation]

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? visible : hidden
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

interface AnimatedTextProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimatedText({ children, delay = 0, className = '' }: AnimatedTextProps) {
  const [ref, isVisible] = useScrollReveal<HTMLSpanElement>()

  return (
    <span
      ref={ref}
      className={`inline-block transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </span>
  )
}
