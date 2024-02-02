## Overview
- Framework - Next.js 13
- Language - TypeScript
- Auth - Supabase
- Database - PostgresQL
- Deployment - Vercel
- Styling - emotion
- Components - Material UI
- Analytics - Vercel Analytics
- Linting - ESLint
- Formatting - Prettier

## Getting Started

First, install dev dependencies:
```bash
npm install
# or
yarn
```
Then run the development server:
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


To connect the backend with supabase:

- Add `.env.local` file with both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Follow the steps outlined [here](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) to connect supabase with nextjs app
