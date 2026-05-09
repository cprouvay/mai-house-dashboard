import { createClient } from './supabase'
import type { KPIDiario, Producto, Meta, ResumenMes } from '@/types'

const supabase = createClient()

export async function getKPIsMes(anio: number, mes: number): Promise<KPIDiario[]> {
  const mesStr = String(mes).padStart(2, '0')
  const inicio = `${anio}-${mesStr}-01`
  const fin    = `${anio}-${mesStr}-31`
  const { data, error } = await supabase
    .from('kpis_diarios')
    .select('*')
    .gte('fecha_solo', inicio)
    .lte('fecha_solo', fin)
    .order('fecha_solo', { ascending: true })
  if (error) { console.error('getKPIsMes:', error); return [] }
  return (data || []) as KPIDiario[]
}

export function calcularResumenMes(kpis: KPIDiario[]): ResumenMes {
  const ventasMes  = kpis.reduce((s, k) => s + (Number(k.ventas_brutas) || 0), 0)
  const txMes      = kpis.reduce((s, k) => s + (Number(k.n_transacciones) || 0), 0)
  const costoMes   = kpis.reduce((s, k) => s + (Number(k.costo_total) || 0), 0)
  const margenMes  = ventasMes - costoMes
  const margenPct  = ventasMes > 0 ? Math.round((margenMes / ventasMes) * 100) : 0
  const ticketProm = txMes > 0 ? Math.round(ventasMes / txMes) : 0
  const junaebMes  = kpis.reduce((s, k) => s + (Number(k.ventas_junaeb) || 0), 0)
  const pctJunaeb  = ventasMes > 0 ? Math.round((junaebMes / ventasMes) * 100) : 0
  const manonaMes  = kpis.reduce((s, k) => s + (Number(k.venta_manana) || 0), 0)
  const tardeMes   = kpis.reduce((s, k) => s + (Number(k.venta_tarde) || 0), 0)
  const cierreMes  = kpis.reduce((s, k) => s + (Number(k.venta_cierre) || 0), 0)
  return {
    ventasMes, txMes, costoMes, margenMes, margenPct,
    ticketProm, junaebMes, pctJunaeb,
    manonaMes, tardeMes, cierreMes,
    diasOperados: kpis.length,
    ventasAyer: kpis.length > 0 ? Number(kpis[kpis.length-1]?.ventas_brutas) || 0 : 0
  }
}

export async function getRankingProductos(limit: number = 10): Promise<Producto[]> {
  const { data, error } = await supabase
    .from('ranking_productos')
    .select('*')
    .order('margen_total', { ascending: false })
    .limit(limit)
  if (error) { console.error('getRankingProductos:', error); return [] }
  return (data || []) as Producto[]
}

export async function getRankingCategorias() {
  const { data, error } = await supabase
    .from('ranking_productos')
    .select('categoria, venta_total, margen_total')
  if (error) return []
  const agrupado: Record<string, { venta_total: number; margen_total: number }> = {}
  ;(data || []).forEach((row: any) => {
    const cat = row.categoria || 'Sin categoria'
    if (!agrupado[cat]) agrupado[cat] = { venta_total: 0, margen_total: 0 }
    agrupado[cat].venta_total  += Number(row.venta_total)  || 0
    agrupado[cat].margen_total += Number(row.margen_total) || 0
  })
  const total = Object.values(agrupado).reduce((s, v) => s + v.venta_total, 0)
  return Object.entries(agrupado)
    .map(([categoria, vals]) => ({
      categoria,
      venta_total : vals.venta_total,
      margen_total: vals.margen_total,
      pct_ventas  : total > 0 ? Math.round((vals.venta_total / total) * 100) : 0
    }))
    .sort((a, b) => b.venta_total - a.venta_total)
}

export async function getMetaMes(anio: number, mes: number): Promise<Meta | null> {
  const { data, error } = await supabase
    .from('metas')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
    .single()
  if (error) return null
  return data as Meta
}

export async function getComparativaMensual() {
  const { data, error } = await supabase
    .from('kpis_diarios')
    .select('fecha_solo, ventas_brutas, margen_bruto')
    .order('fecha_solo', { ascending: true })
  if (error) return []
  const porMes: Record<string, { ventas: number; margen: number }> = {}
  ;(data || []).forEach((row: any) => {
    const key = row.fecha_solo?.substring(0, 7)
    if (!key) return
    if (!porMes[key]) porMes[key] = { ventas: 0, margen: 0 }
    porMes[key].ventas += Number(row.ventas_brutas) || 0
    porMes[key].margen += Number(row.margen_bruto)  || 0
  })
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, vals]) => {
      const [, m] = key.split('-')
      return { mes: meses[parseInt(m)-1], ventas: Math.round(vals.ventas), margen: Math.round(vals.margen) }
    })
}

export async function getMediosPagoMes(anio: number, mes: number) {
  const { data, error } = await supabase
    .from('medios_pago_mes')
    .select('medio_normalizado, monto')
    .eq('anio', anio)
    .eq('mes', mes)
    .order('monto', { ascending: false })
  if (error) { console.error('getMediosPagoMes:', error); return [] }
  const total = (data || []).reduce((s: number, r: any) => s + (Number(r.monto) || 0), 0)
  return (data || []).map((r: any) => ({
    medio: r.medio_normalizado,
    monto: Math.round(Number(r.monto)),
    pct:   total > 0 ? Math.round((Number(r.monto) / total) * 100) : 0
  }))
}

export async function getUltimaActualizacion(): Promise<string> {
  const { data, error } = await supabase
    .from('receipts')
    .select('fecha_cl')
    .not('fecha_cl', 'is', null)
    .order('fecha_cl', { ascending: false })
    .limit(1)
  if (error || !data || data.length === 0) return ''
  try {
    const fecha = new Date(data[0].fecha_cl)
    const hoy   = new Date()
    const esHoy =
      fecha.getDate()     === hoy.getDate()     &&
      fecha.getMonth()    === hoy.getMonth()     &&
      fecha.getFullYear() === hoy.getFullYear()
    if (esHoy) {
      return 'hoy ' + fecha.toLocaleTimeString('es-CL', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Santiago'
      })
    }
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit',
      timeZone: 'America/Santiago'
    }) + ' ' + fecha.toLocaleTimeString('es-CL', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Santiago'
    })
  } catch {
    return ''
  }
}

export function fmtCLP(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CL')
}

export function fmtCLPCompact(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + Math.round(n)
}
