'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const supabase = createClient()

interface Stats {
  saldoInicial: number
  totalIngresos: number
  totalEgresos: number
  saldoFinal: number
  breakeven: number
  pctBreakeven: number
  margen: number
  nIngresos: number
  nEgresos: number
}

export default function FlujoCajaPage() {
  const [stats, setStats] = useState<Stats>({
    saldoInicial: 0,
    totalIngresos: 0,
    totalEgresos: 0,
    saldoFinal: 0,
    breakeven: 2385000,
    pctBreakeven: 0,
    margen: 0,
    nIngresos: 0,
    nEgresos: 0
  })
  const [loading, setLoading] = useState(true)
  const [mesSeleccionado, setMesSeleccionado] = useState(0) // 0 = mes actual
  const [nombreMes, setNombreMes] = useState('')
  const [anioMes, setAnioMes] = useState('')

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
  }, [mesSeleccionado])

  async function loadStats() {
    const now = new Date()
    const mesActual = now.getMonth() + 1
    const anioActual = now.getFullYear()
    
    // Calcular mes a consultar (actual - mesSeleccionado)
    let mes = mesActual - mesSeleccionado
    let anio = anioActual
    
    while (mes < 1) {
      mes += 12
      anio--
    }
    
    // Nombres de meses
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    setNombreMes(meses[mes - 1])
    setAnioMes(anio.toString())
    
    // Rango del mes seleccionado
    const inicioMes = `${anio}-${mes.toString().padStart(2, '0')}-01`
    
    let mesSiguiente = mes + 1
    let anioSiguiente = anio
    if (mesSiguiente > 12) {
      mesSiguiente = 1
      anioSiguiente++
    }
    const inicioMesSiguiente = `${anioSiguiente}-${mesSiguiente.toString().padStart(2, '0')}-01`

    // CALCULAR SALDO INICIAL (último día del mes anterior)
    const finMesAnterior = inicioMes
    const { data: egresosAnteriores } = await supabase
      .from('egresos')
      .select('monto')
      .lt('fecha', finMesAnterior)
    
    const { data: ingresosAnteriores } = await supabase
      .from('ingresos')
      .select('monto')
      .lt('fecha', finMesAnterior)
    
    const totalEgresosAnteriores = egresosAnteriores?.reduce((sum, e) => sum + Number(e.monto), 0) || 0
    const totalIngresosAnteriores = ingresosAnteriores?.reduce((sum, i) => sum + Number(i.monto), 0) || 0
    const saldoInicial = totalIngresosAnteriores - totalEgresosAnteriores

    // EGRESOS DEL MES
    const { data: egresos } = await supabase
      .from('egresos')
      .select('monto')
      .gte('fecha', inicioMes)
      .lt('fecha', inicioMesSiguiente)

    const totalEgresos = egresos?.reduce((sum, e) => sum + Number(e.monto), 0) || 0
    const nEgresos = egresos?.length || 0

    // INGRESOS DEL MES
    const { data: ingresos } = await supabase
      .from('ingresos')
      .select('monto')
      .gte('fecha', inicioMes)
      .lt('fecha', inicioMesSiguiente)

    const totalIngresos = ingresos?.reduce((sum, i) => sum + Number(i.monto), 0) || 0
    const nIngresos = ingresos?.length || 0

    const saldoFinal = saldoInicial + totalIngresos - totalEgresos
    const breakeven = 2385000
    const pctBreakeven = (totalEgresos / breakeven) * 100
    const margen = breakeven - totalEgresos

    setStats({
      saldoInicial,
      totalIngresos,
      totalEgresos,
      saldoFinal,
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
        
        {/* HEADER CON SELECTOR DE MES */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                💰 Flujo de Caja
              </h1>
              <p className="text-gray-600">
                Dashboard consolidado · Fehu Inversiones SPA
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Volver a Dashboard
            </Link>
          </div>

          {/* SELECTOR DE MES */}
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
            <button
              onClick={() => setMesSeleccionado(mesSeleccionado + 1)}
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700"
            >
              ← Anterior
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-blue-600">
                📅 {nombreMes} {anioMes}
              </div>
              {mesSeleccionado === 0 && (
                <div className="text-sm text-green-600 font-semibold">Mes actual</div>
              )}
            </div>
            
            <button
              onClick={() => setMesSeleccionado(Math.max(0, mesSeleccionado - 1))}
              disabled={mesSeleccionado === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                mesSeleccionado === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* KPIs PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          
          {/* SALDO INICIAL */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">Saldo Inicial</div>
            <div className={`text-3xl font-bold mb-1 ${
              stats.saldoInicial >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {fmtCLP(stats.saldoInicial)}
            </div>
            <div className="text-xs text-gray-500">Cierre mes anterior</div>
          </div>

          {/* INGRESOS */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">+ Ingresos</div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {fmtCLP(stats.totalIngresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nIngresos} transacciones</div>
          </div>

          {/* EGRESOS */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">- Egresos</div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {fmtCLP(stats.totalEgresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nEgresos} transferencias</div>
          </div>

          {/* SALDO FINAL */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-2">= Saldo Final</div>
            <div className={`text-3xl font-bold mb-1 ${
              stats.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {fmtCLP(stats.saldoFinal)}
            </div>
            <div className="text-xs text-gray-500">
              {stats.saldoFinal >= 0 ? 'Superávit acumulado' : 'Déficit acumulado'}
            </div>
          </div>

          {/* % BREAKEVEN */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-2">% Breakeven</div>
            <div className={`text-3xl font-bold mb-1 ${
              stats.pctBreakeven >= 100 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {stats.pctBreakeven.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              Meta: {fmtCLP(stats.breakeven)}
            </div>
          </div>

        </div>

        {/* ALERTA BREAKEVEN */}
        {stats.pctBreakeven >= 100 ? (
          <div className="bg-red-100 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-700 font-semibold text-lg">
                ⚠️ Egresos superan breakeven · Exceso: {fmtCLP(Math.abs(stats.margen))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 border-l-4 border-green-500 p-6 mb-8 rounded-lg">
            <div className="flex items-center">
              <div className="text-green-700 font-semibold text-lg">
                ✅ Flujo controlado · Margen disponible: {fmtCLP(stats.margen)}
              </div>
            </div>
          </div>
        )}

        {/* NAVEGACIÓN A DETALLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Link 
            href="/dashboard/flujo-caja/egresos"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-5xl mb-4">📤</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Egresos</h2>
            <p className="text-gray-600 mb-4">
              Ver detalle de transferencias y gastos de {nombreMes} {anioMes}
            </p>
            <div className="text-sm text-gray-500">
              {stats.nEgresos} transferencias · {fmtCLP(stats.totalEgresos)}
            </div>
          </Link>

          <Link 
            href="/dashboard/flujo-caja/ingresos"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-5xl mb-4">📥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ingresos</h2>
            <p className="text-gray-600 mb-4">
              Ver ingresos por medio de pago de {nombreMes} {anioMes}
            </p>
            <div className="text-sm text-gray-500">
              {stats.nIngresos} transacciones · {fmtCLP(stats.totalIngresos)}
            </div>
          </Link>

        </div>

      </div>
    </div>
  )
}
