'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const supabase = createClient()

interface Stats {
  totalIngresos: number
  totalEgresos: number
  flujoNeto: number
  breakeven: number
  pctBreakeven: number
  margen: number
  nIngresos: number
  nEgresos: number
}

export default function FlujoCajaPage() {
  const [stats, setStats] = useState<Stats>({
    totalIngresos: 0,
    totalEgresos: 0,
    flujoNeto: 0,
    breakeven: 2385000,
    pctBreakeven: 0,
    margen: 0,
    nIngresos: 0,
    nEgresos: 0
  })
  const [loading, setLoading] = useState(true)
  const [mesActual, setMesActual] = useState('')
  const [anioActual, setAnioActual] = useState('')

  useEffect(() => {
    loadStats()
    
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'egresos' }, 
          () => loadStats())
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ingresos' }, 
          () => loadStats())
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadStats() {
    const now = new Date()
    const mes = now.getMonth() + 1
    const anio = now.getFullYear()
    
    // Guardar mes y año para mostrar en el header
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    setMesActual(meses[mes - 1])
    setAnioActual(anio.toString())
    
    // Calcular rango del mes actual
    const inicioMes = `${anio}-${mes.toString().padStart(2, '0')}-01`
    
    // Calcular el primer día del mes siguiente
    let mesSiguiente = mes + 1
    let anioSiguiente = anio
    if (mesSiguiente > 12) {
      mesSiguiente = 1
      anioSiguiente++
    }
    const inicioMesSiguiente = `${anioSiguiente}-${mesSiguiente.toString().padStart(2, '0')}-01`

    // FILTRAR EGRESOS DEL MES ACTUAL
    const { data: egresos } = await supabase
      .from('egresos')
      .select('monto')
      .gte('fecha', inicioMes)
      .lt('fecha', inicioMesSiguiente)

    const totalEgresos = egresos?.reduce((sum, e) => sum + Number(e.monto), 0) || 0
    const nEgresos = egresos?.length || 0

    // FILTRAR INGRESOS DEL MES ACTUAL
    const { data: ingresos } = await supabase
      .from('ingresos')
      .select('monto')
      .gte('fecha', inicioMes)
      .lt('fecha', inicioMesSiguiente)

    const totalIngresos = ingresos?.reduce((sum, i) => sum + Number(i.monto), 0) || 0
    const nIngresos = ingresos?.length || 0

    const flujoNeto = totalIngresos - totalEgresos
    const breakeven = 2385000
    const pctBreakeven = (totalEgresos / breakeven) * 100
    const margen = breakeven - totalEgresos

    setStats({
      totalIngresos,
      totalEgresos,
      flujoNeto,
      breakeven,
      pctBreakeven,
      margen,
      nIngresos,
      nEgresos
    })
    
    setLoading(false)
  }

  const fmtCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      
      <div className="max-w-7xl mx-auto p-8">
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                💰 Flujo de Caja
              </h1>
              <p className="text-gray-600">
                Dashboard consolidado · Fehu Inversiones SPA
              </p>
              <p className="text-sm text-blue-600 font-semibold mt-2">
                📅 {mesActual} {anioActual}
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Volver a Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Total Ingresos</div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {fmtCLP(stats.totalIngresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nIngresos} transacciones</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Total Egresos</div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {fmtCLP(stats.totalEgresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nEgresos} transferencias</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Flujo Neto</div>
            <div className={`text-3xl font-bold mb-1 ${
              stats.flujoNeto >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {fmtCLP(stats.flujoNeto)}
            </div>
            <div className="text-xs text-gray-500">
              {stats.
