'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard/flujo-caja')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">💰 MAI House Dashboard</h1>
        <p className="text-gray-600">Redirigiendo al dashboard de flujo de caja...</p>
      </div>
    </div>
  )
}
