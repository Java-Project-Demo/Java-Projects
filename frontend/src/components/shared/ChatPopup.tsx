import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Badge, Button, Card, FloatButton, Input, Space, Spin, Tag, theme, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAskAgentMutation } from '@/features/aiAgent/aiAgentApi.ts'
import { useSpeechRecognition } from '@/app/hooks.ts'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const { Text } = Typography
interface Message {
  id: number
  sender: string
  text: string
  time: string
  isMe: boolean
  suggestions?: string[]
}

interface ChatPopupProps {
  username?: string
}
const ChatPopup = ({ username }: ChatPopupProps) => {
  const { token } = theme.useToken()
  const { t } = useTranslation('chat')
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const baseTextRef = useRef('')
  const displayUsername = username ?? 'User'

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: t('systemSender'),
      text: t('welcome'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: false
    }
  ])

  const [askAgent, { isLoading }] = useAskAgentMutation()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Hàm xử lý gửi tin nhắn (Dùng chung cho cả Input và Suggestions)
  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || inputValue.trim()
    if (!messageText || isLoading) return

    const userMsg: Message = {
      id: Date.now(),
      sender: displayUsername,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    baseTextRef.current = ''

    try {
      // Backend trả về { answer: string, suggestions: string[] }
      const response = await askAgent({ message: messageText }).unwrap()

      const botReply: Message = {
        id: Date.now() + 1,
        sender: t('aiSender'),
        text: response.answer,
        suggestions: response.suggestions,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }
      setMessages((prev) => [...prev, botReply])
    } catch (err) {
      const errorMsg: Message = {
        id: Date.now() + 2,
        sender: t('systemSender'),
        text: t('error'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  // Voice Recognition Logic
  const handleInterim = useCallback((interim: string) => {
    const base = baseTextRef.current.trim()
    setInputValue(base ? `${base} ${interim}` : interim)
  }, [])
  const handleFinal = useCallback((final: string) => {
    const base = baseTextRef.current.trim()
    const updated = base ? `${base} ${final}` : final
    setInputValue(updated)
    baseTextRef.current = updated
  }, [])
  const { isListening, toggleListening } = useSpeechRecognition(handleFinal, handleInterim)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, isLoading])

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type='primary'
        badge={{ dot: true }}
        onClick={() => setOpen(!open)}
        style={{ right: 24, bottom: 24 }}
      />

      {open && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Badge status='processing' color={isListening ? 'red' : isLoading ? 'blue' : 'green'} />
                <Text strong>{t('title')}</Text>
              </Space>
              <Button type='text' size='small' icon={<CloseOutlined />} onClick={() => setOpen(false)} />
            </div>
          }
          style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            width: 450,
            zIndex: 1000,
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.15)',
            borderRadius: 12
          }}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: 500 } }}
        >
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f4f7f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ alignSelf: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '95%' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#8c8c8c',
                    marginBottom: 4,
                    textAlign: msg.isMe ? 'right' : 'left',
                    display: 'flex',
                    gap: 4,
                    justifyContent: msg.isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {!msg.isMe && <RobotOutlined />}
                  {msg.sender} • {msg.time}
                  {msg.isMe && <UserOutlined />}
                </div>

                {/* Bubble Chat */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.isMe ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                    background: msg.isMe ? token.colorPrimary : '#fff',
                    color: msg.isMe ? '#fff' : '#000',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}
                >
                  {msg.isMe ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                  ) : (
                    <div
                      className='  text-[13px]
  [&_table]:w-full [&_table]:my-2 [&_table]:border-collapse
  [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:text-left
  [&_td]:border [&_td]:border-gray-300 [&_td]:p-2
  [&_p]:mb-2 [&_p]:last:mb-0
  [&_ul]:list-disc [&_ul]:ml-4
  [&_strong]:font-bold'
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Suggestions Chips */}
                {!msg.isMe && msg.suggestions && msg.suggestions.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {msg.suggestions.map((sug, index) => (
                      <Tag
                        key={index}
                        color='blue'
                        style={{ cursor: 'pointer', borderRadius: 12, padding: '2px 10px', margin: 0 }}
                        onClick={() => handleSendMessage(sug)}
                      >
                        {sug}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px' }}>
                <Space>
                  <Spin size='small' />
                  <Text type='secondary' italic style={{ fontSize: '12px' }}>
                    {t('thinking')}
                  </Text>
                </Space>
              </div>
            )}
          </div>

          <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <Input
              placeholder={isListening ? t('listeningPlaceholder') : t('inputPlaceholder')}
              value={inputValue}
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={() => handleSendMessage()}
              suffix={
                <Space size={4}>
                  <Button
                    type='text'
                    size='small'
                    shape='circle'
                    icon={isListening ? <AudioMutedOutlined style={{ color: '#ff4d4f' }} /> : <AudioOutlined />}
                    onClick={toggleListening}
                  />
                  <Button
                    type='text'
                    size='small'
                    shape='circle'
                    icon={<SendOutlined />}
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    style={{ color: inputValue.trim() && !isLoading ? token.colorPrimary : '#bfbfbf' }}
                  />
                </Space>
              }
            />
          </div>
        </Card>
      )}
    </>
  )
}

export default ChatPopup
