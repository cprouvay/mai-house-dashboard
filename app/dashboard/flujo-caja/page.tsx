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
  const [mesSeleccionado, setMesSeleccionado] = useState(0)
  const [nombreMes, setNombreMes] = useState('')
  const [anioMes, setAnioMes] = useState('')
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('')
  const [sincronizando, setSincronizando] = useState(false)

  useEffect(() => {
    loadStats()
    
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'egresos' }, 
          () => {
            setSincronizando(true)
            setTimeout(() => {
              loadStats()
              setSincronizando(false)
            }, 500)
          })
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ingresos' }, 
          () => {
            setSincronizando(true)
            setTimeout(() => {
              loadStats()
              setSincronizando(false)
            }, 500)
          })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mesSeleccionado])

  async function loadStats() {
    try {
      const now = new Date()
      const mesActual = now.getMonth() + 1
      const anioActual = now.getFullYear()
      
      let mes = mesActual - mesSeleccionado
      let anio = anioActual
      
      while (mes < 1) {
        mes += 12
        anio--
      }
      
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      setNombreMes(meses[mes - 1])
      setAnioMes(anio.toString())
      
      const inicioMes = `${anio}-${mes.toString().padStart(2, '0')}-01`
      
      let mesSiguiente = mes + 1
      let anioSiguiente = anio
      if (mesSiguiente > 12) {
        mesSiguiente = 1
        anioSiguiente++
      }
      const inicioMesSiguiente = `${anioSiguiente}-${mesSiguiente.toString().padStart(2, '0')}-01`

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

      // Cargar egresos del mes con timestamp
      const { data: egresos } = await supabase
        .from('egresos')
        .select('monto, created_at')
        .gte('fecha', inicioMes)
        .lt('fecha', inicioMesSiguiente)
        .order('created_at', { ascending: false })

      const totalEgresos = egresos?.reduce((sum, e) => sum + Number(e.monto), 0) || 0
      const nEgresos = egresos?.length || 0

      // Cargar ingresos del mes con timestamp
      const { data: ingresos } = await supabase
        .from('ingresos')
        .select('monto, created_at')
        .gte('fecha', inicioMes)
        .lt('fecha', inicioMesSiguiente)
        .order('created_at', { ascending: false })

      const totalIngresos = ingresos?.reduce((sum, i) => sum + Number(i.monto), 0) || 0
      const nIngresos = ingresos?.length || 0

      // Calcular timestamp de última sincronización
      const ultimoEgreso = egresos && egresos.length > 0 ? new Date(egresos[0].created_at) : null
      const ultimoIngreso = ingresos && ingresos.length > 0 ? new Date(ingresos[0].created_at) : null
      
      let ultimaTransaccion = null
      if (ultimoEgreso && ultimoIngreso) {
        ultimaTransaccion = ultimoEgreso > ultimoIngreso ? ultimoEgreso : ultimoIngreso
      } else if (ultimoEgreso) {
        ultimaTransaccion = ultimoEgreso
      } else if (ultimoIngreso) {
        ultimaTransaccion = ultimoIngreso
      }

      if (ultimaTransaccion) {
        const opciones: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
        setUltimaActualizacion(ultimaTransaccion.toLocaleString('es-CL', opciones))
      } else {
        setUltimaActualizacion('Sin transacciones este mes')
      }

      const saldoFinal = saldoInicial + totalIngresos - totalEgresos
      const breakeven = 2385000
      const pctBreakeven = totalEgresos > 0 ? (totalEgresos / breakeven) * 100 : 0
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
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      setLoading(false)
    }
  }

  const fmtCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando flujo de caja...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                💰 Flujo de Caja
              </h1>
              <p className="text-gray-600">
                Dashboard consolidado · Fehu Inversiones SPA
              </p>
              
              {/* Timestamp de última sincronización */}
              {ultimaActualizacion && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-gray-500">
                    🔄 Última sincronización: {ultimaActualizacion}
                  </p>
                  {sincronizando && (
                    <span className="animate-pulse text-green-600 text-xs font-semibold">
                      • Sincronizando...
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-center"
            >
              ← Volver
            </Link>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center gap-2 md:gap-4 bg-gray-50 p-4 rounded-xl">
            <button
              onClick={() => setMesSeleccionado(mesSeleccionado + 1)}
              className="px-3 md:px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors font-semibold text-gray-700 text-sm md:text-base"
            >
              ← Anterior
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                📅 {nombreMes} {anioMes}
              </div>
              {mesSeleccionado === 0 && (
                <div className="text-xs md:text-sm text-green-600 font-semibold">
                  Mes actual
                </div>
              )}
            </div>
            
            <button
              onClick={() => setMesSeleccionado(Math.max(0, mesSeleccionado - 1))}
              disabled={mesSeleccionado === 0}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                mesSeleccionado === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-2">Saldo Inicial</div>
            <div className={`text-2xl md:text-3xl font-bold mb-1 ${
              stats.saldoInicial >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {fmtCLP(stats.saldoInicial)}
            </div>
            <div className="text-xs text-gray-500">Cierre mes anterior</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-2">+ Ingresos</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
              {fmtCLP(stats.totalIngresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nIngresos} transacciones</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="text-xs md:text-sm text-gray-600 mb-2">- Egresos</div>
            <div className="text-2xl md:text-3xl font-bold text-red-600 mb-1">
              {fmtCLP(stats.totalEgresos)}
            </div>
            <div className="text-xs text-gray-500">{stats.nEgresos} transferencias</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-blue-200 col-span-2 md:col-span-1">
            <div className="text-xs md:text-sm text-gray-600 mb-2">= Saldo Final</div>
            <div className={`text-2xl md:text-3xl font-bold mb-1 ${
              stats.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {fmtCLP(stats.saldoFinal)}
            </div>
            <div className="text-xs text-gray-500">
              {stats.saldoFinal >= 0 ? 'Superávit acumulado' : 'Déficit acumulado'}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 col-span-2 md:col-span-3 lg:col-span-1">
            <div className="text-xs md:text-sm text-gray-600 mb-2">% Breakeven</div>
            <div className={`text-2xl md:text-3xl font-bold mb-1 ${
              stats.pctBreakeven >= 100 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {stats.pctBreakeven.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              Meta: {fmtCLP(stats.breakeven)}
            </div>
          </div>

        </div>

        {/* Alerta de Breakeven */}
        {stats.pctBreakeven >= 100 ? (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 md:p-6 mb-8 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-700 font-semibold text-sm md:text-lg">
                ⚠️ Egresos superan breakeven · Exceso: {fmtCLP(Math.abs(stats.margen))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 md:p-6 mb-8 rounded-lg">
            <div className="flex items-center">
              <div className="text-green-700 font-semibold text-sm md:text-lg">
                ✅ Flujo controlado · Margen disponible: {fmtCLP(stats.margen)}
              </div>
            </div>
          </div>
        )}

        {/* Grid de Botones - 5 botones responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          
          {/* Botón Egresos */}
          <Link 
            href="/dashboard/flujo-caja/egresos"
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-4xl md:text-5xl mb-4">📤</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Egresos</h2>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Transferencias y gastos de {nombreMes}
            </p>
            <div className="text-xs md:text-sm text-gray-500">
              {stats.nEgresos} · {fmtCLP(stats.totalEgresos)}
            </div>
          </Link>

          {/* Botón Ingresos */}
          <Link 
            href="/dashboard/flujo-caja/ingresos"
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="text-4xl md:text-5xl mb-4">📥</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Ingresos</h2>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Ingresos por medio de pago
            </p>
            <div className="text-xs md:text-sm text-gray-500">
              {stats.nIngresos} · {fmtCLP(stats.totalIngresos)}
            </div>
          </Link>

          {/* Botón Cierre Mensual */}
          <Link 
            href="/dashboard/flujo-caja/cierre-mensual"
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer text-white"
          >
            <div className="text-4xl md:text-5xl mb-4">🏦</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Cierre Mensual</h2>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Procesar cartola bancaria
            </p>
            <div className="text-xs md:text-sm text-white/80">
              Comisiones y cargos automáticos
            </div>
          </Link>

          {/* Botón Proveedores */}
          <Link 
            href="/dashboard/proveedores"
            className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer text-white"
          >
            <div className="text-4xl md:text-5xl mb-4">📋</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Proveedores</h2>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Catálogo y costos fijos/variables
            </p>
            <div className="text-xs md:text-sm text-white/80">
              Categorización automática
            </div>
          </Link>

          {/* Botón Recetas - ACTIVO */}
          <div 
            onClick={() => window.location.href = '/recetas'}
            className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all hover:scale-105 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded">
              ✅ Activo
            </div>
            <div className="text-4xl md:text-5xl mb-4">🧪</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">Recetas</h2>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Gestión de costos y márgenes
            </p>
            <div className="text-xs md:text-sm text-white/80">
              Calculadora interactiva
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
