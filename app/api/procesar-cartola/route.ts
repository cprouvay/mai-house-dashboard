import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import * as XLSX from 'xlsx'

const supabase = createClient()

interface Movimiento {
  fecha: string
  concepto: string
  categoria?: string
  medio_pago?: string
  monto: number
  id_transaccion: string
  tipo: 'egreso' | 'ingreso'
}


function categorizarEgreso(descripcion: string): string {
  const d = descripcion.toLowerCase()
  
  if (d.includes('brown') || d.includes('cookies') || d.includes('focaccia') || d.includes('carrot') || d.includes('cake')) {
    return 'Proveedor repostería'
  }
  if (d.includes('anamaya') || d.includes('matcha') || d.includes('mendocina') || d.includes('singular') || d.includes('coffee')) {
    return 'Proveedor insumos'
  }
  if (d.includes('arriendo') || d.includes('ggcc') || d.includes('galeria')) {
    return 'Arriendo'
  }
  if (d.includes('enel') || d.includes('agua') || d.includes('luz') || d.includes('cdigitales') || d.includes('aguas')) {
    return 'Servicios básicos'
  }
  if (d.includes('honorarios') || d.includes('sofy') || d.includes('sofia')) {
    return 'Remuneraciones'
  }
  if (d.includes('marketing')) {
    return 'Marketing'
  }
  if (d.includes('propina')) {
    return 'Propinas'
  }
  if (d.includes('comision') || d.includes('cargo') || d.includes('mantencion')) {
    return 'Comisiones bancarias'
  }
  
  return 'Otros'
}

function identificarMedioPago(descripcion: string): string {
  const d = descripcion.toLowerCase()
  
  if (d.includes('haulmer') || d.includes('abonos hau')) {
    return 'Haulmer TUU'
  }
  if (d.includes('sumup') || d.includes('sum up')) {
    return 'SumUp'
  }
  if (d.includes('pluxee') || d.includes('transferencia d')) {
    return 'BCI PLUXEE'
  }
  
  return 'Transferencia'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cartola') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    let inicioMovimientos = 0
    for (let i = 0; i < Math.min(30, data.length); i++) {
      const row = data[i]
      if (row && row.some(cell => String(cell).includes('Fecha'))) {
        inicioMovimientos = i + 2
        break
      }
    }

    if (inicioMovimientos === 0) {
      return NextResponse.json({ error: 'No se encontró tabla de movimientos' }, { status: 400 })
    }

    const now = new Date()
    const anio = now.getFullYear()
    const mes = now.getMonth() + 1

    const egresos: Movimiento[] = []
    const ingresos: Movimiento[] = []

    for (let i = inicioMovimientos; i < data.length; i++) {
      const row = data[i]
      if (!row || !row[0]) continue

      const rowText = row.join('').toLowerCase()
      if (rowText.includes('total') || rowText.includes('saldo final')) continue

      const fechaStr = String(row[0]).trim()
      let fecha = ''
      
      if (fechaStr.includes('/')) {
        const [dia, mesNum] = fechaStr.split('/')
        fecha = `${anio}-${mesNum.padStart(2, '0')}-${dia.padStart(2, '0')}`
      } else {
        continue
      }

      const numeroDoc = row[1] ? String(row[1]).trim() : ''
      const descripcion = row[3] ? String(row[3]).trim() : 'Sin descripción'
      const deposito = Number(row[4]) || 0
      const giro = Number(row[5]) || 0

      const idTransaccion = numeroDoc 
        ? `ITAU-${fecha}-${numeroDoc}`
        : `ITAU-${fecha}-${Math.round(deposito || giro)}`

      if (giro > 0) {
        egresos.push({
          fecha,
          concepto: descripcion.substring(0, 200),
          categoria: categorizarEgreso(descripcion),
          monto: Math.round(giro),
          id_transaccion: idTransaccion,
          tipo: 'egreso'
        })
      }

      if (deposito > 0) {
        ingresos.push({
          fecha,
          concepto: descripcion.substring(0, 200),
          medio_pago: identificarMedioPago(descripcion),
          monto: Math.round(deposito),
          id_transaccion: idTransaccion,
          tipo: 'ingreso'
        })
      }
    }

    const mesInicio = `${anio}-${mes.toString().padStart(2, '0')}-01`
    const mesSiguiente = mes === 12 ? 1 : mes + 1
    const anioSiguiente = mes === 12 ? anio + 1 : anio
    const mesFin = `${anioSiguiente}-${mesSiguiente.toString().padStart(2, '0')}-01`

    const { data: egresosExistentes } = await supabase
      .from('egresos')
      .select('id_transaccion')
      .gte('fecha', mesInicio)
      .lt('fecha', mesFin)

    const idsEgresosExistentes = new Set(
      egresosExistentes?.map(e => e.id_transaccion) || []
    )

    const { data: ingresosExistentes } = await supabase
      .from('ingresos')
      .select('id_transaccion')
      .gte('fecha', mesInicio)
      .lt('fecha', mesFin)

    const idsIngresosExistentes = new Set(
      ingresosExistentes?.map(i => i.id_transaccion) || []
    )

    const egresosFaltantes = egresos.filter(e => !idsEgresosExistentes.has(e.id_transaccion))
    const ingresosFaltantes = ingresos.filter(i => !idsIngresosExistentes.has(i.id_transaccion))

    return NextResponse.json({
      total_egresos: egresos.length,
      total_ingresos: ingresos.length,
      egresos_capturados: idsEgresosExistentes.size,
      ingresos_capturados: idsIngresosExistentes.size,
      egresos_faltantes: egresosFaltantes,
      ingresos_faltantes: ingresosFaltantes
    })

  } catch (error) {
    console.error('Error procesando cartola:', error)
    return NextResponse.json(
      { error: 'Error procesando cartola' },
      { status: 500 }
    )
  }
}
