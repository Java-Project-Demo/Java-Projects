import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

interface SpeechRecognitionResult {
  resultIndex: number
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionResult) => void
  onend: () => void
  onerror: () => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

export const useSpeechRecognition = (onFinal: (text: string) => void, onInterim: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const onFinalRef = useRef(onFinal)
  const onInterimRef = useRef(onInterim)

  useEffect(() => {
    onFinalRef.current = onFinal
  }, [onFinal])
  useEffect(() => {
    onInterimRef.current = onInterim
  }, [onInterim])

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recog = new SpeechRecognition()
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'vi-VN'

    recog.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          onFinalRef.current(transcript)
        } else {
          interim += transcript
          onInterim(interim)
        }
      }
    }

    recog.onend = () => setIsListening(false)
    recog.onerror = () => setIsListening(false)
    recognitionRef.current = recog

    return () => {
      recog.stop()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  return { isListening, toggleListening }
}
