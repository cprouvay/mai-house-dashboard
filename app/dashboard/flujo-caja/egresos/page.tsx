'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import Link from 'next/link'

const supabase = createClient()

interface Egreso {
  id: string
  fecha: string
  hora: string
  concepto: string
  categoria: string
  monto: number
  id_transaccion: string
  origen: string
}

export default function EgresosPage() {
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    loadEgresos()
  }, [])

  async function loadEgresos() {
    const now = new Date()
    const mesActual = now.getMonth() + 1
    const anioActual = now.getFullYear()
    
    const inicioMes = `${anioActual}-${mesActual.toString().padStart(2, '0')}-01`
    const inicioMesSiguiente = `${anioActual}-${(mesActual + 1).toString().padStart(2, '0')}-01`

    const { data, error } = await supabase
      .from('egresos')
      .select('*')
      .gte('fecha', inicioMes)
      .lt('fecha', inicioMesSiguiente)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (data) {
      setEgresos(data)
      const sum = data.reduce((acc, e) => acc + Number(e.monto), 0)
      setTotal(sum)
    }
    
    setLoading(false)
  }

  const fmtCLP = (n: number) => `$${n.toLocaleString('es-CL')}`
  const fmtFecha = (f: string) => {
    const d = new Date(f + 'T00:00:00')
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📤 Egresos del Mes
              </h1>
              <p className="text-gray-600">
                {egresos.length} transferencias · Total: {fmtCLP(total)}
              </p>
            </div>
            <Link 
              href="/dashboard/flujo-caja"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Volver
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Concepto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Origen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {egresos.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {fmtFecha(e.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {e.hora}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-md">
                      {e.concepto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {e.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">
                      {fmtCLP(e.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-600">
                        {e.origen}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-bold text-gray-700">
                    TOTAL:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-xl text-red-600">
                    {fmtCLP(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}