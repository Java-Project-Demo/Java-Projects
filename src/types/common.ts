export interface ApiRes<T> {
  code: string
  message: string
  data: T
}

export interface Pagination {
  pageNumber: number
  pageSize: number
  totalElements: number
}

export interface ResponsePage<T> {
  content: T
  pagination: Pagination
}
