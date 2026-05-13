import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { useEffect, useState } from 'react'

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

export const useSpeechRecognition = (
  onFinal: (text: string) => void,
  onInterim: (text: string) => void,
) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null)

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
          onFinal(transcript)
        } else {
          interim += transcript
          onInterim(interim)
        }
      }
    }

    recog.onend = () => setIsListening(false)
    recog.onerror = () => setIsListening(false)
    setRecognition(recog)
  }, [onFinal, onInterim])

  const toggleListening = () => {
    if (isListening) recognition?.stop()
    else {
      recognition?.start()
      setIsListening(true)
    }
  }

  return { isListening, toggleListening }
}
