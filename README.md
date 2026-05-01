# MAI House Café — Dashboard Next.js (Fase 3)

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Recharts (gráficos)
- Supabase JS Client
- PWA ready

## Estructura del proyecto

mai-house-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              ← Redirige a /dashboard
│   ├── globals.css
│   └── dashboard/
│       └── page.tsx          ← Dashboard principal
├── components/
│   ├── Header.tsx
│   ├── KPICard.tsx
│   ├── Semaforo.tsx
│   ├── TopProductos.tsx
│   ├── TurnosChart.tsx
│   ├── JunaebPanel.tsx
│   ├── CategoriaChart.tsx
│   └── TendenciaChart.tsx
├── lib/
│   ├── supabase.ts           ← Cliente Supabase
│   └── queries.ts            ← Todas las queries SQL
├── types/
│   └── index.ts              ← Tipos TypeScript
└── public/
    └── manifest.json         ← PWA manifest

## Instalación

npm create next-app@latest mai-house-dashboard
cd mai-house-dashboard
npm install @supabase/supabase-js recharts

## Variables de entorno (.env.local)

NEXT_PUBLIC_SUPABASE_URL=https://eykcynvhmtriehhqkuip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_e_9hOk5wrA3JXU7s1FiLxg__NM1WhVh

## Despliegue en Vercel (gratis)

1. Sube el proyecto a GitHub
2. Conecta el repo en vercel.com
3. Agrega las variables de entorno en Vercel
4. Deploy automático en cada push

