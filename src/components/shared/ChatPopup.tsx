import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Badge, Button, Card, FloatButton, Input, Space, Spin, theme, Tooltip, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAskAgentMutation } from '@/features/aiAgent/aiAgentApi.ts'
import { useSpeechRecognition } from '@/app/hooks.ts'

const { Text } = Typography
interface Message {
  id: number
  sender: string
  text: string
  time: string
  isMe: boolean
}

interface ChatPopupProps {
  username?: string
}
const ChatPopup = ({ username = 'User' }: ChatPopupProps) => {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const baseTextRef = useRef('') // Lưu trữ đoạn text gốc trước khi nói cụm mới

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'Hệ thống',
      text: 'Xin chào! Tôi là trợ lý UTC. Bạn cần hỗ trợ gì về kho hàng không?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: false
    }
  ])

  const [askAgent, { isLoading }] = useAskAgentMutation()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Khi gõ tay: Cập nhật state và Ref đồng bộ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    baseTextRef.current = val
  }

  // 2. Khi đang nói (Chữ nhảy liên tục - Interim)
  const handleInterim = useCallback((interim: string) => {
    const base = baseTextRef.current.trim()
    // Hiển thị text cũ + text đang nghe dở
    setInputValue(base ? `${base} ${interim}` : interim)
  }, [])

  // 3. Khi nói xong cụm (Chốt hạ - Final)
  const handleFinal = useCallback((final: string) => {
    const base = baseTextRef.current.trim()
    const updated = base ? `${base} ${final}` : final
    setInputValue(updated)
    baseTextRef.current = updated // Lưu lại mốc mới vào Ref
  }, [])

  const { isListening, toggleListening } = useSpeechRecognition(handleFinal, handleInterim)

  // Tự động cuộn xuống cuối
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, isLoading, inputValue]) // Cuộn khi inputValue thay đổi (đang nói)

  const handleSendMessage = async () => {
    const messageText = inputValue.trim()
    if (!messageText || isLoading) return

    const userMsg: Message = {
      id: Date.now(),
      sender: username,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    baseTextRef.current = '' // Reset Ref sau khi gửi

    try {
      const aiResponseText = await askAgent({ message: messageText }).unwrap()
      const botReply: Message = {
        id: Date.now() + 1,
        sender: 'AI Assistant',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }
      setMessages((prev) => [...prev, botReply])
    } catch (err) {
      console.error('Chi tiết lỗi:', err)
      // Xử lý lỗi khi API fail
      const errorMsg: Message = {
        id: Date.now() + 2,
        sender: 'Hệ thống',
        text: 'Xin lỗi, tôi gặp sự cố kết nối. Vui lòng thử lại sau.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        type='primary'
        badge={{ dot: true }}
        onClick={() => setOpen(!open)}
        style={{ right: 24, bottom: 24 }}
        tooltip={<div>Chat với AI hỗ trợ</div>}
      />

      {open && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Badge status='processing' color={isListening ? 'red' : isLoading ? 'blue' : 'green'} />
                <Text strong>Trợ lý AI Kho hàng</Text>
              </Space>
              <Button type='text' size='small' icon={<CloseOutlined />} onClick={() => setOpen(false)} />
            </div>
          }
          style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            width: 380,
            zIndex: 1000,
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.15)',
            borderRadius: 12,
            border: 'none'
          }}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: 450 } }}
        >
          {/* Khu vực tin nhắn */}
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
              <div key={msg.id} style={{ alignSelf: msg.isMe ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
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
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: msg.isMe ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                    background: msg.isMe ? token.colorPrimary : '#fff',
                    color: msg.isMe ? '#fff' : '#000',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.5'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 12px' }}>
                <Space>
                  <Spin size='small' />
                  <Text type='secondary' italic style={{ fontSize: '12px' }}>
                    AI đang suy nghĩ...
                  </Text>
                </Space>
              </div>
            )}
          </div>

          {/* Ô nhập liệu */}
          <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            {isListening && (
              <div className='text-[10px] text-red-500 mb-1 animate-pulse flex items-center gap-1'>
                <span className='w-1.5 h-1.5 bg-red-500 rounded-full'></span>
                Hệ thống đang nghe...
              </div>
            )}
            <Input
              placeholder={isListening ? 'Đang nghe...' : 'Nhập nội dung...'}
              value={inputValue}
              disabled={isLoading}
              onChange={handleInputChange}
              onPressEnter={handleSendMessage}
              suffix={
                <Space size={4}>
                  <Tooltip title={isListening ? 'Dừng nghe' : 'Nói để nhập liệu'}>
                    <Button
                      type='text'
                      size='small'
                      shape='circle'
                      disabled={isLoading}
                      icon={isListening ? <AudioMutedOutlined style={{ color: '#ff4d4f' }} /> : <AudioOutlined />}
                      onClick={toggleListening}
                      className={isListening ? 'animate-pulse bg-red-50' : ''}
                    />
                  </Tooltip>

                  <Button
                    type='text'
                    size='small'
                    shape='circle'
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    style={{
                      color: inputValue.trim() && !isLoading ? token.colorPrimary : '#bfbfbf'
                    }}
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
