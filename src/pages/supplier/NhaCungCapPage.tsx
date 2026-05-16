import { useState, useMemo } from 'react'
import {
  App, Button, Card, Col, Form, Input, Modal, Row,
  Space, Statistic, Table, Tag, Tooltip, Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, EditOutlined, ShopOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '@/features/supplier/supplierApi'
import { useLocaleFormat } from '@/utils/useLocaleFormat'
import type { Supplier, SupplierRequest } from '@/types/api'
import { useCan } from '@/utils/permissions'

const { Text } = Typography
const PRIMARY = '#E8603C'

const NhaCungCapPage = () => {
  const { message, modal } = App.useApp()
  const { t } = useTranslation(['supplier', 'common'])
  const { date } = useLocaleFormat()
  const canManage = useCan('SUPPLIER_CRUD')

  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [editItem, setEditItem] = useState<Supplier | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<SupplierRequest>()

  const { data: suppliers = [], isLoading } = useGetSuppliersQuery()
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation()
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation()

  const filtered = useMemo(
    () => suppliers.filter((s) => {
      if (!showDeleted && s.isDeleted) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        (s.phoneNumber ?? '').toLowerCase().includes(q) ||
        (s.taxCode ?? '').toLowerCase().includes(q)
      )
    }),
    [suppliers, search, showDeleted],
  )

  const handleSoftDelete = (record: Supplier) => {
    modal.confirm({
      title: record.isDeleted ? t('softDelete.titleRestore') : t('softDelete.titleHide'),
      content: record.isDeleted
        ? t('softDelete.contentRestore', { name: record.name })
        : t('softDelete.contentHide', { name: record.name }),
      okText: record.isDeleted ? t('common:button.restore') : t('common:button.hide'),
      okButtonProps: { danger: !record.isDeleted },
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await updateSupplier({
            id: record.id,
            data: { isDeleted: !record.isDeleted },
          }).unwrap()
          void message.success(record.isDeleted ? t('softDelete.successRestore') : t('softDelete.successHide'))
        } catch (err: unknown) {
          const e = err as { data?: { message?: string } }
          void message.error(e?.data?.message ?? t('common:error.system'))
        }
      },
    })
  }

  const openAdd = () => { setEditItem(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r: Supplier) => {
    setEditItem(r)
    form.setFieldsValue({
      name: r.name, contactPerson: r.contactPerson ?? '',
      phoneNumber: r.phoneNumber ?? '', email: r.email ?? '',
      address: r.address ?? '', taxCode: r.taxCode ?? '',
    })
    setModalOpen(true)
  }

  const handleSave = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editItem) {
          await updateSupplier({ id: editItem.id, data: values }).unwrap()
          void message.success(t('modal.successEdit'))
        } else {
          await createSupplier(values).unwrap()
          void message.success(t('modal.successAdd'))
        }
        setModalOpen(false)
      } catch (err: unknown) {
        const e = err as { data?: { message?: string } }
        void message.error(e?.data?.message ?? t('common:error.system'))
      }
    })
  }

  const columns: ColumnsType<Supplier> = [
    { title: t('col.no'), key: 'stt', width: 55, render: (_, __, i) => <Text type='secondary'>{i + 1}</Text> },
    {
      title: t('col.name'), dataIndex: 'name', key: 'name',
      render: (v: string) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${PRIMARY}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShopOutlined style={{ color: PRIMARY }} />
          </div>
          <Text strong>{v}</Text>
        </Space>
      ),
    },
    { title: t('col.contact'), dataIndex: 'contactPerson', key: 'contact', width: 150, render: (v: string | null) => v ?? '—' },
    { title: t('col.phone'), dataIndex: 'phoneNumber', key: 'phone', width: 130, render: (v: string | null) => v ?? '—' },
    { title: t('col.email'), dataIndex: 'email', key: 'email', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    { title: t('col.address'), dataIndex: 'address', key: 'address', ellipsis: true, render: (v: string | null) => <Text type='secondary'>{v ?? '—'}</Text> },
    {
      title: t('col.taxCode'), dataIndex: 'taxCode', key: 'tax', width: 130,
      render: (v: string | null) => v ? <Tag>{v}</Tag> : <Text type='secondary'>—</Text>,
    },
    {
      title: t('col.createdAt'), dataIndex: 'createdAt', key: 'created', width: 120,
      render: (v: string) => <Text style={{ fontSize: 12 }}>{date(v)}</Text>,
    },
    {
      title: t('col.actions'), key: 'action', width: 110,
      render: (_, record) => canManage ? (
        <Space size={2}>
          <Tooltip title={t('tooltip.edit')}>
            <Button type='text' size='small' icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => openEdit(record)} disabled={record.isDeleted} />
          </Tooltip>
          <Tooltip title={record.isDeleted ? t('tooltip.restore') : t('tooltip.hide')}>
            <Button
              type='text' size='small'
              icon={record.isDeleted
                ? <UndoOutlined style={{ color: '#52c41a' }} />
                : <DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={() => handleSoftDelete(record)} />
          </Tooltip>
        </Space>
      ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        extra={canManage ? (
          <Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>{t('addButton')}</Button>
        ) : undefined}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <Statistic title={t('stats.total')} value={suppliers.length}
              suffix={t('stats.totalSuffix')} valueStyle={{ color: PRIMARY, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input.Search placeholder={t('filter.search')} style={{ width: 300 }}
            value={search} onChange={(e) => setSearch(e.target.value)} allowClear />
          {canManage && (
            <Button
              type={showDeleted ? 'primary' : 'default'}
              ghost={showDeleted}
              icon={<DeleteOutlined />}
              onClick={() => setShowDeleted((v) => !v)}
            >
              {showDeleted ? t('common:button.viewingHidden') : t('common:button.showHidden')}
            </Button>
          )}
        </div>
        <Table
          rowKey='id' loading={isLoading} columns={columns} dataSource={filtered}
          size='middle' bordered scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showTotal: (total) => t('totalSuffix', { count: total }) }}
          locale={{ emptyText: <EmptyState title={t('empty')} action={canManage ? { label: t('addButton'), onClick: openAdd } : undefined} /> }}
        />
      </Card>

      <Modal
        title={editItem ? t('modal.titleEdit') : t('modal.titleAdd')}
        open={modalOpen} onCancel={() => setModalOpen(false)} width={600}
        footer={[
          <Button key='c' onClick={() => setModalOpen(false)}>{t('common:button.cancel')}</Button>,
          <Button key='s' type='primary' loading={creating || updating} onClick={handleSave}>
            {editItem ? t('common:button.update') : t('common:button.add')}
          </Button>,
        ]}
      >
        <Form form={form} layout='vertical' style={{ marginTop: 16 }}>
          <Form.Item label={t('modal.name')} name='name' rules={[{ required: true, message: t('modal.nameRequired') }]}>
            <Input autoFocus placeholder={t('modal.namePlaceholder')} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('modal.contactPerson')} name='contactPerson'>
                <Input placeholder={t('modal.contactPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('modal.phone')} name='phoneNumber'>
                <Input placeholder={t('modal.phonePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('modal.email')} name='email'>
                <Input placeholder={t('modal.emailPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('modal.taxCode')} name='taxCode'>
                <Input placeholder={t('modal.taxCodePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t('modal.address')} name='address'>
            <Input.TextArea rows={2} placeholder={t('modal.addressPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NhaCungCapPage
