import { useState } from 'react'
import { App, Breadcrumb, Button, Card, Form, Input, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { HomeOutlined, PlusOutlined, EditOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from '@/features/category/categoryApi'
import type { Category } from '@/types/api'

const { Text } = Typography
const PRIMARY = '#E8603C'

interface FormValues { name: string; description?: string }

const DanhMucVatTuPage = () => {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [form] = Form.useForm<FormValues>()

  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()

  const openAdd = () => {
    setEditItem(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (r: Category) => {
    setEditItem(r)
    form.setFieldsValue({ name: r.name, description: r.description ?? '' })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editItem) {
          await updateCategory({ id: editItem.id, data: values }).unwrap()
          void message.success('Cập nhật danh mục thành công!')
        } else {
          await createCategory(values).unwrap()
          void message.success('Thêm danh mục thành công!')
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? 'Lỗi hệ thống')
      }
    })
  }

  const columns: ColumnsType<Category> = [
    {
      title: 'STT', key: 'stt', width: 60,
      render: (_, __, i) => <Text type='secondary'>{i + 1}</Text>,
    },
    {
      title: 'Tên danh mục', dataIndex: 'name', key: 'name',
      render: (v: string) => (
        <Space>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${PRIMARY}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AppstoreOutlined style={{ color: PRIMARY, fontSize: 14 }} />
          </div>
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true,
      render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text>,
    },
    {
      title: 'Số sản phẩm', key: 'count', width: 120, align: 'center' as const,
      render: (_, r: Category) => <Tag color='blue'>{r.items?.length ?? 0} SP</Tag>,
    },
    {
      title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', width: 150,
      render: (v: string) => <Text type='secondary' style={{ fontSize: 12 }}>{v ? new Date(v).toLocaleDateString('vi-VN') : '—'}</Text>,
    },
    {
      title: 'Hành động', key: 'action', width: 90,
      render: (_, record) => (
        <Tooltip title='Chỉnh sửa'>
          <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => openEdit(record)} />
        </Tooltip>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: 'Danh mục vật tư' }]} />

      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={<Space><AppstoreOutlined style={{ color: PRIMARY }} /><span>Danh mục vật tư</span></Space>}
        extra={<Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>Thêm danh mục</Button>}
      >
        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={categories}
          size='middle' bordered
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} danh mục` }}
        />
      </Card>

      <Modal
        title={editItem ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen} onCancel={() => setModalOpen(false)} width={480}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>Huỷ</Button>,
          <Button key='save' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? 'Cập nhật' : 'Thêm mới'}
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label='Tên danh mục' name='name' rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
            <Input placeholder='Nhập tên danh mục' />
          </Form.Item>
          <Form.Item label='Mô tả' name='description'>
            <Input.TextArea rows={3} placeholder='Mô tả ngắn về danh mục (không bắt buộc)' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DanhMucVatTuPage
