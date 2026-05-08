'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import Header from '@/components/Header'
import Semaforo from '@/components/Semaforo'
import {
  getKPIsMes, calcularResumenMes,
  getRankingProductos, getRankingCategorias,
  getMetaMes, getComparativaMensual,
  getMediosPagoMes, getUltimaActualizacion,
  fmtCLP, fmtCLPCompact
} from '@/lib/queries'
import type { ResumenMes, Producto, Meta } from '@/types'

const C = {
  blue: '#7EB8D4', lav: '#B8A0D0',
  pink: '#D4879E', green: '#52A882',
  amber: '#C9955A', red: '#C97070',
}

// Colores por medio de pago
const COLORES_MEDIO: Record<string, string> = {
  'SumUp':       '#7EB8D4',
  'MercadoPago': '#52A882',
  'TUU':         '#B8A0D0',
  'Efectivo':    '#C9955A',
  'Débito':      '#D4879E',
  'Crédito':     '#6BAED6',
}
function colorMedio(medio: string): string {
  for (const [key, color] of Object.entries(COLORES_MEDIO)) {
    if (medio.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#A0AEC0'
}

function KPICard({ label, value, sub, subColor }: {
  label: string; value: string; sub?: string; subColor?: string
}) {
  return (
    <div style={{
      background: '#EBF4FA', borderRadius: 14,
      border: '1px solid #D2E9F5', padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1A2332' }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, marginTop: 5, color: subColor || '#A0AEC0' }}>{sub}</div>
      )}
    </div>
  )
}

function MaiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #D2E9F5',
      borderRadius: 10, padding: '8px 12px', fontSize: 12,
      boxShadow: '0 2px 12px rgba(126,184,212,0.15)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#2D3748' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {fmtCLP(p.value)}</div>
      ))}
    </div>
  )
}

function MargenPill({ pct }: { pct: number }) {
  const r = Math.round(pct)
  const bgColor  = r >= 50 ? '#E8F5EE' : r >= 30 ? '#FEF3E8' : '#FEE8E8'
  const txtColor = r >= 50 ? '#2D7A56' : r >= 30 ? '#9A6B35' : '#9A4040'
  return (
    <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600, background: bgColor, color: txtColor }}>
      {r}%
    </span>
  )
}

export default function DashboardPage() {
  const hoy = new Date()
  const [mes,  setMes]  = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())

  const [loading,       setLoading]       = useState(true)
  const [resumen,       setResumen]       = useState<ResumenMes | null>(null)
  const [meta,          setMeta]          = useState<Meta | null>(null)
  const [productos,     setProductos]     = useState<Producto[]>([])
  const [categorias,    setCategorias]    = useState<any[]>([])
  const [tendencia,     setTendencia]     = useState<any[]>([])
  const [kpisDia,       setKpisDia]       = useState<any[]>([])
  const [mediosPago,    setMediosPago]    = useState<any[]>([])
  const [ultimaActual,  setUltimaActual]  = useState<string>('')
  const [tabProd,       setTabProd]       = useState<'margen' | 'volumen'>('margen')

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const [kpis, prods, cats, metaData, tend, medios, ultima] = await Promise.all([
        getKPIsMes(anio, mes),
        getRankingProductos(10),
        getRankingCategorias(),
        getMetaMes(anio, mes),
        getComparativaMensual(),
        getMediosPagoMes(anio, mes),
        getUltimaActualizacion(),
      ])
      setResumen(calcularResumenMes(kpis))
      setProductos(prods)
      setCategorias(cats)
      setMeta(metaData)
      setTendencia(tend)
      setMediosPago(medios)
      setUltimaActual(ultima)
      setKpisDia(kpis.map(k => ({
        dia:    k.fecha_solo?.substring(8, 10),
        ventas: Math.round(Number(k.ventas_brutas)),
        margen: Math.round(Number(k.margen_bruto)),
      })))
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }, [mes, anio])

  useEffect(() => { cargar() }, [cargar])

  // Auto-refresh cada 60 minutos
  useEffect(() => {
    const interval = setInterval(() => { cargar() }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [cargar])

  const prodsMostrar = tabProd === 'margen'
    ? [...productos].sort((a, b) => (b.margen_pct_promedio || 0) - (a.margen_pct_promedio || 0))
    : [...productos].sort((a, b) => (b.venta_total || 0) - (a.venta_total || 0))

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ fontSize: 40 }}>🍵</div>
        <div style={{ fontSize: 15, color: '#718096' }}>Cargando datos de MAI House...</div>
      </div>
    )
  }

  if (!resumen) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#A0AEC0' }}>
        No hay datos para este período.
      </div>
    )
  }

  const totalTurnos = (resumen.manonaMes + resumen.tardeMes + resumen.cierreMes) || 1
  const promedioVentaDia = kpisDia.length > 0 ? resumen.ventasMes / kpisDia.length : 0

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>

      <Header
        mesActual={mes}
        anioActual={anio}
        onCambiarMes={(m, a) => { setMes(m); setAnio(a) }}
        ultimaActualizacion={ultimaActual}
      />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
        <KPICard label="Ventas del mes"  value={fmtCLPCompact(resumen.ventasMes)} sub={`${resumen.diasOperados} días operados`} />
        <KPICard label="Ticket promedio" value={fmtCLP(resumen.ticketProm)} sub={`${resumen.txMes} transacciones`} />
        <KPICard label="Margen bruto"    value={`${resumen.margenPct}%`} sub={fmtCLP(resumen.margenMes)}
          subColor={resumen.margenPct >= 45 ? C.green : resumen.margenPct >= 30 ? C.amber : C.red} />
        <KPICard label="Canal JUNAEB"    value={fmtCLPCompact(resumen.junaebMes)} sub={`${resumen.pctJunaeb}% del total`} />
      </div>

      {/* Semáforo + Productos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
        <Semaforo resumen={resumen} meta={meta} />

        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productos</span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <button className={`mai-tab ${tabProd === 'margen' ? 'active' : ''}`} onClick={() => setTabProd('margen')}>Margen</button>
              <button className={`mai-tab ${tabProd === 'volumen' ? 'active' : ''}`} onClick={() => setTabProd('volumen')}>Volumen</button>
            </div>
          </div>
          {prodsMostrar.slice(0, 8).map((p, i) => (
            <div key={p.producto} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
              <span style={{ color: '#A0AEC0', width: 16, textAlign: 'right', fontSize: 12 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#2D3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.producto}>{p.producto}</span>
              {tabProd === 'margen'
                ? <MargenPill pct={p.margen_pct_promedio || 0} />
                : <span style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>{fmtCLPCompact(p.venta_total)}</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Ventas diarias + Turnos + MEDIOS DE PAGO */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>

        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <span style={{ fontSize: 16 }}>📈</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ventas diarias</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpisDia} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF4FA" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtCLPCompact(v)} tick={{ fontSize: 10, fill: '#A0AEC0' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<MaiTooltip />} />
              <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
                {kpisDia.map((entry, i) => (
                  <Cell key={i} fill={entry.ventas > promedioVentaDia ? C.blue : '#D2E9F5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnos */}
        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <span style={{ fontSize: 16 }}>🕐</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por turno</span>
          </div>
          {[
            { label: 'Mañana', valor: resumen.manonaMes, colorBar: C.blue },
            { label: 'Tarde',  valor: resumen.tardeMes,  colorBar: C.lav  },
            { label: 'Cierre', valor: resumen.cierreMes, colorBar: C.pink },
          ].map(t => {
            const pct = Math.round((t.valor / totalTurnos) * 100)
            return (
              <div key={t.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#2D3748' }}>{t.label}</span>
                  <span style={{ color: '#718096' }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: t.colorBar }} />
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3, textAlign: 'right' }}>{fmtCLP(t.valor)}</div>
              </div>
            )
          })}
        </div>

        {/* MEDIOS DE PAGO — reemplaza JUNAEB */}
        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <span style={{ fontSize: 16 }}>💳</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medios de pago</span>
          </div>

          {mediosPago.length === 0 ? (
            <div style={{ color: '#A0AEC0', fontSize: 13, textAlign: 'center', marginTop: 20 }}>Sin datos</div>
          ) : (
            mediosPago.slice(0, 6).map((m, i) => (
              <div key={m.medio} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#2D3748', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                    {m.medio}
                  </span>
                  <span style={{ color: '#718096', flexShrink: 0 }}>{m.pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${m.pct}%`, background: colorMedio(m.medio) }} />
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3, textAlign: 'right' }}>
                  {fmtCLP(m.monto)}
                </div>
              </div>
            ))
          )}

          <div style={{ marginTop: 10, padding: '8px 10px', background: '#EBF4FA', borderRadius: 8, fontSize: 11, color: '#718096' }}>
            JUNAEB: {resumen.pctJunaeb}% del total · {fmtCLP(resumen.junaebMes)}
          </div>
        </div>
      </div>

      {/* Tendencia + Categorías */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>

        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tendencia mensual</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBF4FA" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#A0AEC0' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtCLPCompact(v)} tick={{ fontSize: 10, fill: '#A0AEC0' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<MaiTooltip />} />
              <Line type="monotone" dataKey="ventas" name="Ventas" stroke={C.blue} strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} />
              <Line type="monotone" dataKey="margen" name="Margen" stroke={C.lav}  strokeWidth={2}   dot={{ fill: C.lav,  r: 3 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11, color: '#A0AEC0' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 3, background: C.blue, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Ventas</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 3, background: C.lav,  borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Margen</span>
          </div>
        </div>

        <div className="mai-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #EBF4FA' }}>
            <span style={{ fontSize: 16 }}>🗂</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por categoría</span>
          </div>
          {categorias.slice(0, 6).map((cat, i) => (
            <div key={cat.categoria} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: '#2D3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{cat.categoria}</span>
                <span style={{ color: '#718096' }}>{cat.pct_ventas}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${cat.pct_ventas}%`, background: [C.blue, C.lav, C.pink, C.amber, C.green, '#888'][i] || C.blue }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
