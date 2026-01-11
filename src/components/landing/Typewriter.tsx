'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TypewriterProps {
  text: string
  delay?: number
  onComplete?: () => void
  className?: string
  cursor?: boolean
  startDelay?: number
}

export function Typewriter({
  text,
  delay = 50,
  onComplete,
  className = '',
  cursor = true,
  startDelay = 0,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [started, setStarted] = useState(false)
  const [complete, setComplete] = useState(false)
  const onCompleteRef = useRef(onComplete)
  
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
    }, startDelay)

    return () => clearTimeout(startTimeout)
  }, [startDelay])

  useEffect(() => {
    if (!started || complete) return

    if (displayText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1))
      }, delay)
      return () => clearTimeout(timeout)
    } else if (!complete) {
      setComplete(true)
      onCompleteRef.current?.()
    }
  }, [displayText, text, delay, started, complete])

  if (!started) return null

  return (
    <span className={className}>
      {displayText}
      {cursor && (
        <span
          className={`inline-block w-2 h-5 ml-0.5 bg-[#00ff00] ${
            complete ? 'animate-blink' : 'animate-pulse'
          }`}
        />
      )}
    </span>
  )
}

interface TypewriterLinesProps {
  lines: string[]
  lineDelay?: number
  typeDelay?: number
  onComplete?: () => void
  className?: string
  lineClassName?: string
  startDelay?: number
}

export function TypewriterLines({
  lines,
  lineDelay = 300,
  typeDelay = 30,
  onComplete,
  className = '',
  lineClassName = '',
  startDelay = 0,
}: TypewriterLinesProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const hasStarted = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    
    const timeout = setTimeout(() => {
      setCurrentLineIndex(0)
      setIsTyping(true)
    }, startDelay)
    
    return () => clearTimeout(timeout)
  }, [startDelay])

  const handleLineComplete = useCallback(() => {
    const currentLine = lines[currentLineIndex]
    
    setCompletedLines(prev => [...prev, currentLine])
    setIsTyping(false)
    
    if (currentLineIndex < lines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
        setIsTyping(true)
      }, lineDelay)
    } else {
      onCompleteRef.current?.()
    }
  }, [currentLineIndex, lines, lineDelay])

  return (
    <div className={className}>
      {completedLines.map((line, i) => (
        <div key={`completed-${i}`} className={lineClassName}>
          {line}
        </div>
      ))}
      {isTyping && currentLineIndex >= 0 && currentLineIndex < lines.length && (
        <Typewriter
          key={`typing-${currentLineIndex}`}
          text={lines[currentLineIndex]}
          delay={typeDelay}
          onComplete={handleLineComplete}
          className={lineClassName}
          cursor={true}
        />
      )}
    </div>
  )
}
