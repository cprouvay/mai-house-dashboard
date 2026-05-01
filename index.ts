// ============================================================
// MAI House Café — Tipos TypeScript
// ============================================================

export interface KPIDiario {
  fecha_solo: string
  n_transacciones: number
  ventas_brutas: number
  ticket_promedio: number
  costo_total: number
  margen_bruto: number
  margen_pct: number
  ventas_junaeb: number
  pct_junaeb: number
  venta_manana: number
  venta_tarde: number
  venta_cierre: number
  productos_distintos: number
}

export interface Producto {
  producto: string
  categoria: string
  unidades_vendidas: number
  venta_total: number
  margen_total: number
  margen_pct_promedio: number
  costo_real: number | null
  precio_venta: number | null
  margen_pct_receta: number | null
}

export interface Meta {
  id: number
  anio: number
  mes: number
  venta_objetivo: number
  breakeven: number
  notas: string | null
}

export interface CostoReceta {
  producto: string
  categoria: string
  costo_real: number
  precio_venta: number
  margen_real: number
  margen_pct: number
  proveedor: string | null
}

export interface ResumenMes {
  ventasMes: number
  txMes: number
  costoMes: number
  margenMes: number
  margenPct: number
  ticketProm: number
  junaebMes: number
  pctJunaeb: number
  manonaMes: number
  tardeMes: number
  cierreMes: number
  diasOperados: number
  ventasAyer: number
}

export interface SemaforoStatus {
  color: 'verde' | 'amarillo' | 'rojo'
  pct: number
  falta: number
}
