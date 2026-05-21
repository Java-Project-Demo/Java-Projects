# UTC Frontend

Ứng dụng SPA được xây dựng với **React 19**, **TypeScript**, **Redux Toolkit** và **Ant Design 5**.

## Tech Stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| State management | Redux Toolkit (RTK Query) |
| UI Library | Ant Design 5 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Styling | Ant Design + Tailwind CSS (utilities) |

## Yêu cầu

- Node.js >= 20.19
- npm >= 10

## Cài đặt

```bash
# Clone repo
git clone <repository-url>
cd project-utc/frontend

# Cấu hình env
cp .example.env .env

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

App chạy tại: **http://localhost:5173**

## Scripts

```bash
npm run dev          # Dev server (HMR)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run prettier     # Prettier check
npm run prettier:fix # Prettier auto-fix
```

## Biến môi trường

Tạo file `.env` từ `.example.env`:

| Biến | Mô tả | Mặc định |
|---|---|---|
| `VITE_BASE_API_URL` | Base URL của backend API | `http://localhost:8888/api/v1` |

## Cấu trúc thư mục

```
src/
├── app/
│   ├── store.ts              # Redux store
│   └── hooks.ts              # useAppDispatch, useAppSelector (typed)
│
├── config/
│   ├── axios.ts              # Axios instance + interceptors (auto refresh token)
│   ├── axiosBaseQuery.ts     # RTK Query base query
│   └── theme.ts              # Ant Design theme tokens
│
├── features/                 # Feature-based modules
│   └── auth/
│       ├── types.ts          # UserProfile, LoginRequest, LoginResponse
│       ├── authSlice.ts      # Redux state: user, isAuthenticated
│       └── authApi.ts        # RTK Query: login, logout, getMe
│
├── layouts/
│   ├── MainLayout.tsx        # Layout chính: Header + Content + Footer
│   └── AuthLayout.tsx        # Layout trang xác thực
│
├── pages/
│   ├── Home.tsx              # Dashboard
│   └── auth/
│       └── LoginPage.tsx     # Trang đăng nhập
│
├── routes/
│   ├── index.tsx             # Route tree
│   ├── PrivateRoute.tsx      # Guard: chưa đăng nhập → /login
│   └── PublicRoute.tsx       # Guard: đã đăng nhập → /
│
├── types/
│   └── common.ts             # ApiRes, Pagination, ResponsePage
│
└── utils/
    └── formatCurrency.ts     # Format tiền tệ VND
```

## Luồng Authentication

```
[Login Form]
    │
    ▼
POST /auth/login  (RTK Query mutation)
    │
    ├── Thành công → dispatch setCredentials(user)
    │               → navigate('/')
    │
    └── Thất bại  → hiển thị message lỗi (Ant Design)

[Mọi request sau đó]
    │
    └── 401 → Axios interceptor tự động gọi POST /auth/refresh
                  ├── Thành công → retry request gốc
                  └── Thất bại  → redirect /login
```

## Quy ước

### Thêm feature mới

Tạo theo cấu trúc `src/features/<feature-name>/`:

```
features/
└── user/
    ├── types.ts       # TypeScript interfaces
    ├── userSlice.ts   # Redux slice (nếu cần local state)
    └── userApi.ts     # RTK Query endpoints
```

### Thêm trang mới

1. Tạo component tại `src/pages/`
2. Đăng ký route trong `src/routes/index.tsx`
3. Wrap trong `PrivateRoute` nếu cần đăng nhập

### Import alias

Dùng `@/` thay cho đường dẫn tương đối:

```ts
// Thay vì:
import { useAppSelector } from '../../../app/hooks'

// Dùng:
import { useAppSelector } from '@/app/hooks'
```

