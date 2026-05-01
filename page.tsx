'use client'
// ============================================================
// MAI House Café — Dashboard principal (app/dashboard/page.tsx)
// ============================================================
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import Header    from '@/components/Header'
import Semaforo  from '@/components/Semaforo'
import {
  getKPIsMes, calcularResumenMes,
  getRankingProductos, getRankingCategorias,
  getMetaMes, getComparativaMensual,
  fmtCLP, fmtCLPCompact
} from '@/lib/queries'
import type { ResumenMes, Producto, Meta } from '@/types'

// ── Colores paleta MAI House ─────────────────────────────
const C = {
  blue:   '#7EB8D4',
  lav:    '#B8A0D0',
  pink:   '#D4879E',
  cream:  '#FDF8F4',
  green:  '#52A882',
  amber:  '#C9955A',
  red:    '#C97070',
}

// ── KPI Card ─────────────────────────────────────────────
function KPICard({ label, value, sub, subColor, delay }: {
  label: string; value: string; sub?: string; subColor?: string; delay: number
}) {
  return (
    <div className={`mai-kpi fade-in-up fade-in-up-${delay}`}>
      <div style={{ fontSize: 11, color: 'var(--mai-text-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--mai-text-900)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, marginTop: 5, color: subColor || 'var(--mai-text-300)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Tooltip personalizado ────────────────────────────────
function MaiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid var(--mai-blue-100)',
      borderRadius: 10, padding: '8px 12px', fontSize: 12,
      boxShadow: 'var(--mai-shadow)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--mai-text-700)' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {fmtCLP(p.value)}
        </div>
      ))}
    </div>
  )
}

// ── Pill de margen ───────────────────────────────────────
function MargenPill({ pct }: { pct: number }) {
  const rounded = Math.round(pct)
  const [cls, color] = rounded >= 50
    ? ['pill-verde', C.green]
    : rounded >= 30
    ? ['pill-amarillo', C.amber]
    : ['pill-rojo', C.red]
  return (
    <span className={`pill-${rounded >= 50 ? 'verde' : rounded >= 30 ? 'amarillo' : 'rojo'}`}
      style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600 }}>
      {rounded}%
    </span>
  )
}

// ════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ════════════════════════════════════════════════════════
export default function DashboardPage() {
  const hoy    = new Date()
  const [mes,  setMes]  = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())

  const [loading,      setLoading]      = useState(true)
  const [resumen,      setResumen]      = useState<ResumenMes | null>(null)
  const [meta,         setMeta]         = useState<Meta | null>(null)
  const [productos,    setProductos]    = useState<Producto[]>([])
  const [categorias,   setCategorias]   = useState<any[]>([])
  const [tendencia,    setTendencia]    = useState<any[]>([])
  const [kpisDiarios,  setKpisDiarios]  = useState<any[]>([])
  const [tabProducto,  setTabProducto]  = useState<'margen' | 'volumen'>('margen')

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const [kpis, prods, cats, metaData, tend] = await Promise.all([
        getKPIsMes(anio, mes),
        getRankingProductos(10),
        getRankingCategorias(),
        getMetaMes(anio, mes),
        getComparativaMensual(),
      ])

      setResumen(calcularResumenMes(kpis))
      setProductos(prods)
      setCategorias(cats)
      setMeta(metaData)
      setTendencia(tend)
      setKpisDiarios(kpis.map(k => ({
        dia  : k.fecha_solo?.substring(8, 10),
        ventas: Math.round(Number(k.ventas_brutas)),
        margen: Math.round(Number(k.margen_bruto)),
      })))
    } catch (e) {
      console.error('Error cargando datos:', e)
    } finally {
      setLoading(false)
    }
  }, [mes, anio])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const productosMostrar = tabProducto === 'margen'
    ? [...productos].sort((a, b) => (b.margen_pct_promedio || 0) - (a.margen_pct_promedio || 0))
    : [...productos].sort((a, b) => (b.venta_total || 0) - (a.venta_total || 0))

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16,
    }}>
      <div style={{ fontSize: 40 }}>🍵</div>
      <div style={{ fontSize: 15, color: 'var(--mai-text-500)' }}>Cargando datos de MAI House...</div>
    </div>
  )

  if (!resumen) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--mai-text-300)' }}>
      No hay datos disponibles para este período.
    </div>
  )

  const totalTurnos = (resumen.manonaMes + resumen.tardeMes + resumen.cierreMes) || 1

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem' }}>

      <Header
        mesActual={mes}
        anioActual={anio}
        onCambiarMes={(m, a) => { setMes(m); setAnio(a) }}
        ultimaActualizacion={kpisDiarios.length > 0 ? 'hoy' : undefined}
      />

      {/* ── KPIs principales ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.25rem' }}>
        <KPICard
          label="Ventas del mes"
          value={fmtCLPCompact(resumen.ventasMes)}
          sub={`${resumen.diasOperados} días operados`}
          delay={1}
        />
        <KPICard
          label="Ticket promedio"
          value={fmtCLP(resumen.ticketProm)}
          sub={`${resumen.txMes} transacciones`}
          delay={2}
        />
        <KPICard
          label="Margen bruto"
          value={`${resumen.margenPct}%`}
          sub={fmtCLP(resumen.margenMes)}
          subColor={resumen.margenPct >= 45 ? C.green : resumen.margenPct >= 30 ? C.amber : C.red}
          delay={3}
        />
        <KPICard
          label="Venta JUNAEB"
          value={fmtCLPCompact(resumen.junaebMes)}
          sub={`${resumen.pctJunaeb}% del total`}
          delay={4}
        />
      </div>

      {/* ── Semáforo + Top Productos ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12, marginBottom: '1.25rem' }}>

        <Semaforo resumen={resumen} meta={meta} />

        <div className="mai-card fade-in-up fade-in-up-2">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Productos
              </span>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              <button className={`mai-tab ${tabProducto === 'margen' ? 'active' : ''}`}
                onClick={() => setTabProducto('margen')}>Margen</button>
              <button className={`mai-tab ${tabProducto === 'volumen' ? 'active' : ''}`}
                onClick={() => setTabProducto('volumen')}>Volumen</button>
            </div>
          </div>

          {productosMostrar.slice(0, 8).map((p, i) => (
            <div key={p.producto} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 9, fontSize: 13,
            }}>
              <span style={{ color: 'var(--mai-text-300)', width: 16, textAlign: 'right' }}>{i + 1}</span>
              <span style={{
                flex: 1, color: 'var(--mai-text-700)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }} title={p.producto}>{p.producto}</span>
              {tabProducto === 'margen'
                ? <MargenPill pct={p.margen_pct_promedio || 0} />
                : <span style={{ fontSize: 12, color: 'var(--mai-text-500)', fontWeight: 600 }}>
                    {fmtCLPCompact(p.venta_total)}
                  </span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── Tendencia + Turnos + JUNAEB ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>

        {/* Tendencia diaria */}
        <div className="mai-card fade-in-up fade-in-up-3">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <span style={{ fontSize: 16 }}>📈</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ventas diarias del mes
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpisDiarios} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mai-blue-50)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'var(--mai-text-300)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtCLPCompact(v)} tick={{ fontSize: 10, fill: 'var(--mai-text-300)' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<MaiTooltip />} />
              <Bar dataKey="ventas" name="Ventas" radius={[4, 4, 0, 0]}>
                {kpisDiarios.map((entry, i) => (
                  <Cell key={i} fill={entry.ventas > (resumen.ventasMes / kpisDiarios.length) ? C.blue : '#D2E9F5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnos */}
        <div className="mai-card fade-in-up fade-in-up-3">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <span style={{ fontSize: 16 }}>🕐</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Por turno
            </span>
          </div>
          {[
            { label: 'Mañana', valor: resumen.manonaMes, color: C.blue },
            { label: 'Tarde',  valor: resumen.tardeMes,  color: C.lav },
            { label: 'Cierre', valor: resumen.cierreMes, color: C.pink },
          ].map(t => {
            const pct = Math.round((t.valor / totalTurnos) * 100)
            return (
              <div key={t.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--mai-text-700)' }}>{t.label}</span>
                  <span style={{ color: 'var(--mai-text-500)' }}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: t.color }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--mai-text-300)', marginTop: 3, textAlign: 'right' }}>
                  {fmtCLP(t.valor)}
                </div>
              </div>
            )
          })}
        </div>

        {/* JUNAEB */}
        <div className="mai-card fade-in-up fade-in-up-4">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <span style={{ fontSize: 16 }}>🎓</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Canal JUNAEB
            </span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--mai-text-900)', marginBottom: 4 }}>
            {fmtCLP(resumen.junaebMes)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mai-text-300)', marginBottom: 14 }}>
            {resumen.pctJunaeb}% de ventas totales
          </div>
          {[
            { label: 'Otros medios',      valor: resumen.ventasMes - resumen.junaebMes, color: 'var(--mai-text-700)' },
            { label: 'Comisión PLUXEE 9%', valor: -(resumen.junaebMes * 0.09),          color: C.red },
            { label: 'Neto JUNAEB',        valor: resumen.junaebMes * 0.91,             color: C.green },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 8, fontSize: 12,
            }}>
              <span style={{ color: 'var(--mai-text-500)' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: row.color }}>{fmtCLP(Math.abs(row.valor))}</span>
            </div>
          ))}
          <div style={{
            marginTop: 10, padding: '8px 10px',
            background: 'var(--mai-blue-50)', borderRadius: 8,
            fontSize: 11, color: 'var(--mai-text-500)',
          }}>
            Alta estacionalidad mar–dic (año escolar)
          </div>
        </div>
      </div>

      {/* ── Tendencia mensual + Categorías ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>

        {/* Comparativa 6 meses */}
        <div className="mai-card fade-in-up fade-in-up-4">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tendencia mensual
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--mai-blue-50)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--mai-text-300)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtCLPCompact(v)} tick={{ fontSize: 10, fill: 'var(--mai-text-300)' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<MaiTooltip />} />
              <Line type="monotone" dataKey="ventas" name="Ventas" stroke={C.blue} strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} />
              <Line type="monotone" dataKey="margen" name="Margen" stroke={C.lav}  strokeWidth={2}   dot={{ fill: C.lav,  r: 3 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11, color: 'var(--mai-text-300)' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 3, background: C.blue, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Ventas</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 3, background: C.lav,  borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />Margen</span>
          </div>
        </div>

        {/* Categorías */}
        <div className="mai-card fade-in-up fade-in-up-4">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
          }}>
            <span style={{ fontSize: 16 }}>🗂</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Por categoría
            </span>
          </div>
          {categorias.slice(0, 6).map((cat, i) => (
            <div key={cat.categoria} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: 'var(--mai-text-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  {cat.categoria}
                </span>
                <span style={{ color: 'var(--mai-text-500)', flexShrink: 0 }}>{cat.pct_ventas}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: `${cat.pct_ventas}%`,
                  background: [C.blue, C.lav, C.pink, C.amber, C.green, '#888'][i] || C.blue,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </main>
  )
}
