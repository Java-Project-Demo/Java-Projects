import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { useEffect, useState } from 'react'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const useSpeechRecognition = (
  onFinal: (text: string) => void,
  onInterim: (text: string) => void // Thêm callback này
) => {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recog = new SpeechRecognition()
    recog.continuous = true
    recog.interimResults = true // Bắt buộc
    recog.lang = 'vi-VN'

    recog.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          onFinal(transcript)
        } else {
          interim += transcript
          onInterim(interim) // Đẩy chữ đang nói ra ngay lập tức
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
