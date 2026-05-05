import { CloseOutlined, MessageOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import { Badge, Button, Card, FloatButton, Input, Space, Spin, theme, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useAskAgentMutation } from '@/features/aiAgent/aiAgentApi.ts'

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

  // Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, isLoading])

  const handleSendMessage = async () => {
    const messageText = inputValue.trim()
    if (!messageText || isLoading) return

    // 2. Thêm tin nhắn của User vào UI ngay lập tức
    const userMsg: Message = {
      id: Date.now(),
      sender: username,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')

    try {
      // 3. Gọi API thật
      // Vì axiosBaseQuery của bạn đã lấy .data.data nên kết quả 'res' sẽ là chuỗi text AI trả về
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
                <Badge status='processing' color={isLoading ? 'blue' : 'green'} />
                <Text strong>Trợ lý AI Kho hàng</Text>
              </Space>
              <Button type='text' size='small' icon={<CloseOutlined />} onClick={() => setOpen(false)} />
            </div>
          }
          style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            width: 380, // Tăng chiều rộng một chút để đọc nội dung AI tốt hơn
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
                    whiteSpace: 'pre-wrap', // Quan trọng: Để hiển thị các dòng kẻ xuống (\n) từ AI
                    lineHeight: '1.5'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* 4. Hiệu ứng đang trả lời */}
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
            <Input
              placeholder={isLoading ? 'Đang đợi trả lời...' : 'Nhập câu hỏi về kho hàng, IMEI...'}
              value={inputValue}
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
              suffix={
                <SendOutlined
                  onClick={handleSendMessage}
                  style={{
                    color: inputValue.trim() && !isLoading ? token.colorPrimary : '#bfbfbf',
                    cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed'
                  }}
                />
              }
            />
          </div>
        </Card>
      )}
    </>
  )
}

export default ChatPopup
