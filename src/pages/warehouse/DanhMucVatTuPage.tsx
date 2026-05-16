import { useMemo, useState } from 'react'
import { App, Breadcrumb, Button, Card, Form, Input, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd'
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  UndoOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useSetCategoryDeletedMutation
} from '@/features/category/categoryApi'
import type { Category } from '@/types/api'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import { useCan } from '@/utils/permissions'

const { Text } = Typography
const PRIMARY = '#E8603C'

interface FormValues {
  name: string
  description?: string
}

const DanhMucVatTuPage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['product', 'menu', 'common'])
  const { date } = useLocaleFormat()
  const [modalOpen, setModalOpen] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [editItem, setEditItem] = useState<Category | null>(null)
  const [form] = Form.useForm<FormValues>()
  const canManage = useCan('CATEGORY_CRUD')

  const { data: categories = [], isLoading } = useGetCategoriesQuery()
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation()
  const [setCategoryDeleted] = useSetCategoryDeletedMutation()

  const visibleCategories = useMemo(
    () => categories.filter((c) => showDeleted || !c.isDeleted),
    [categories, showDeleted]
  )

  const handleSoftDelete = (record: Category) => {
    modal.confirm({
      title: record.isDeleted ? t('category.softDelete.titleRestore') : t('category.softDelete.titleHide'),
      content: record.isDeleted
        ? t('category.softDelete.contentRestore', { name: record.name })
        : t('category.softDelete.contentHide', { name: record.name }),
      okText: record.isDeleted ? t('common:button.restore') : t('common:button.hide'),
      okButtonProps: { danger: !record.isDeleted },
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await setCategoryDeleted({ id: record.id, isDeleted: !record.isDeleted }).unwrap()
          void message.success(record.isDeleted ? t('category.softDelete.successRestore') : t('category.softDelete.successHide'))
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('common:error.system'))
        }
      }
    })
  }

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
          void message.success(t('category.modal.successEdit'))
        } else {
          await createCategory(values).unwrap()
          void message.success(t('category.modal.successAdd'))
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const baseColumns: ColumnsType<Category> = [
    {
      title: t('category.colNo'),
      key: 'stt',
      width: 60,
      render: (_, __, i) => <Text type='secondary'>{i + 1}</Text>
    },
    {
      title: t('category.colName'),
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => (
        <Space>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: `${PRIMARY}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AppstoreOutlined style={{ color: PRIMARY, fontSize: 14 }} />
          </div>
          <Text strong>{v}</Text>
        </Space>
      )
    },
    {
      title: t('category.colDescription'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text>
    },
    {
      title: t('category.colCount'),
      key: 'count',
      width: 120,
      align: 'center' as const,
      render: (_, r: Category) => <Tag color='blue'>{t('category.countSuffix', { count: r.items?.length ?? 0 })}</Tag>
    },
    {
      title: t('common:table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (v: string) => (
        <Text type='secondary' style={{ fontSize: 12 }}>{date(v)}</Text>
      )
    },
  ]

  const columns: ColumnsType<Category> = canManage
    ? [
        ...baseColumns,
        {
          title: t('common:table.actions'),
          key: 'action',
          width: 110,
          render: (_, record) => (
            <Space size={2}>
              <Tooltip title={t('category.tooltip.edit')}>
                <Button
                  type='text'
                  size='small'
                  icon={<EditOutlined style={{ color: '#1677ff' }} />}
                  onClick={() => openEdit(record)}
                  disabled={record.isDeleted}
                />
              </Tooltip>
              <Tooltip title={record.isDeleted ? t('category.tooltip.restore') : t('category.tooltip.hide')}>
                <Button
                  type='text'
                  size='small'
                  icon={
                    record.isDeleted ? (
                      <UndoOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    )
                  }
                  onClick={() => handleSoftDelete(record)}
                />
              </Tooltip>
            </Space>
          )
        }
      ]
    : baseColumns

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[{ href: '/', title: <HomeOutlined /> }, { title: t('menu:item.categories') }]}
      />

      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        title={
          <Space>
            <AppstoreOutlined style={{ color: PRIMARY }} />
            <span>{t('category.title')}</span>
          </Space>
        }
        extra={
          canManage ? (
            <Space>
              <Button
                type={showDeleted ? 'primary' : 'default'}
                ghost={showDeleted}
                icon={<DeleteOutlined />}
                onClick={() => setShowDeleted((v) => !v)}
              >
                {showDeleted ? t('common:button.viewingHidden') : t('common:button.showHidden')}
              </Button>
              <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>
                {t('category.addButton')}
              </Button>
            </Space>
          ) : undefined
        }
      >
        <Table
          rowKey='id'
          loading={isLoading}
          columns={columns}
          dataSource={visibleCategories}
          size='middle'
          bordered
          pagination={{ pageSize: 10, showTotal: (total) => t('category.totalSuffix', { count: total }) }}
        />
      </Card>

      <Modal
        title={editItem ? t('category.modal.titleEdit') : t('category.modal.titleAdd')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={480}
        footer={[
          <Button key='cancel' onClick={() => setModalOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='save' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? t('common:button.update') : t('common:button.create')}
          </Button>
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item
            label={t('category.modal.name')}
            name='name'
            rules={[{ required: true, message: t('category.modal.nameRequired') }]}
          >
            <Input placeholder={t('category.modal.namePlaceholder')} />
          </Form.Item>
          <Form.Item label={t('category.modal.description')} name='description'>
            <Input.TextArea rows={3} placeholder={t('category.modal.descriptionPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default DanhMucVatTuPage
