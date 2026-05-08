'use client'
// ============================================================
// MAI House Café — Semáforo de metas (components/Semaforo.tsx)
// ============================================================
import type { Meta, ResumenMes } from '@/types'
import { fmtCLP } from '@/lib/queries'

interface SemaforoProps {
  resumen: ResumenMes
  meta: Meta | null
}

function SemaforoFila({
  label, valor, objetivo, color, nota
}: {
  label: string
  valor: number
  objetivo: number
  color: string
  nota?: string
}) {
  const pct = objetivo > 0 ? Math.min(Math.round((valor / objetivo) * 100), 100) : 0
  const colores: Record<string, { dot: string; fill: string; text: string; bg: string }> = {
    verde:    { dot: '#52A882', fill: '#52A882', text: '#2D7A56', bg: '#E8F5EE' },
    amarillo: { dot: '#C9955A', fill: '#C9955A', text: '#9A6B35', bg: '#FEF3E8' },
    rojo:     { dot: '#C97070', fill: '#C97070', text: '#9A4040', bg: '#FEE8E8' },
    azul:     { dot: '#4A9BC0', fill: '#4A9BC0', text: '#2980AB', bg: '#EBF4FA' },
  }
  const c = colores[color] || colores.azul

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: 'var(--mai-text-700)', flex: 1 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mai-text-700)' }}>
          {fmtCLP(valor)}
          <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mai-text-300)', marginLeft: 4 }}>
            / {fmtCLP(objetivo)}
          </span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: c.fill }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 11, color: c.text, background: c.bg, borderRadius: 20, padding: '1px 8px' }}>
          {nota || `${pct}%`}
        </div>
        <div style={{ fontSize: 11, color: 'var(--mai-text-300)' }}>
          {valor < objetivo ? `Faltan ${fmtCLP(objetivo - valor)}` : `Excedente ${fmtCLP(valor - objetivo)}`}
        </div>
      </div>
    </div>
  )
}

export default function Semaforo({ resumen, meta }: SemaforoProps) {
  const objetivo  = meta?.venta_objetivo || 3_800_000
  const breakeven = meta?.breakeven      || 2_650_000

  const pctObj = objetivo  > 0 ? (resumen.ventasMes / objetivo)  * 100 : 0
  const pctBE  = breakeven > 0 ? (resumen.ventasMes / breakeven) * 100 : 0

  const colorObj = pctObj >= 100 ? 'verde' : pctObj >= 70 ? 'amarillo' : 'rojo'
  const colorBE  = pctBE  >= 100 ? 'verde' : pctBE  >= 80 ? 'amarillo' : 'rojo'
  const colorJun = resumen.pctJunaeb >= 20 ? 'verde' : resumen.pctJunaeb >= 10 ? 'amarillo' : 'azul'

  return (
    <div className="mai-card fade-in-up fade-in-up-2" style={{ height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
        paddingBottom: 12, borderBottom: '1px solid var(--mai-blue-50)',
      }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--mai-text-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Semáforo de metas
        </span>
      </div>

      <SemaforoFila
        label="Objetivo de ventas"
        valor={resumen.ventasMes}
        objetivo={objetivo}
        color={colorObj}
        nota={`${Math.round(pctObj)}% del objetivo`}
      />

      <SemaforoFila
        label="Breakeven"
        valor={resumen.ventasMes}
        objetivo={breakeven}
        color={colorBE}
        nota={pctBE >= 100 ? '✓ Punto de equilibrio superado' : `${Math.round(pctBE)}% del breakeven`}
      />

      <SemaforoFila
        label="Canal JUNAEB"
        valor={resumen.junaebMes}
        objetivo={resumen.ventasMes * 0.20}
        color={colorJun}
        nota={`${resumen.pctJunaeb}% del total`}
      />

      {meta?.notas && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: 'var(--mai-blue-50)', borderRadius: 10,
          fontSize: 12, color: 'var(--mai-text-500)',
          borderLeft: '3px solid var(--mai-blue-200)',
        }}>
          {meta.notas}
        </div>
      )}
    </div>
  )
}
