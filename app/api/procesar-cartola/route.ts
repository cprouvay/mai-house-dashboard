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

    // Buscar inicio de movimientos (fila con "Fecha")
    let inicioMovimientos = 0
    for (let i = 0; i < Math.min(40, data.length); i++) {
      const row = data[i]
      if (row && row.some(cell => String(cell).trim() === 'Fecha')) {
        inicioMovimientos = i + 2 // Los datos empiezan 2 filas después
        break
      }
    }

    if (inicioMovimientos === 0) {
      return NextResponse.json({ error: 'No se encontró tabla de movimientos' }, { status: 400 })
    }

    // Extraer año del nombre del archivo o usar año actual
    const now = new Date()
    const anio = now.getFullYear()

    const egresos: Movimiento[] = []
    const ingresos: Movimiento[] = []

    for (let i = inicioMovimientos; i < data.length; i++) {
      const row = data[i]
      
      // Si la fila está vacía, continuar
      if (!row || !row[0]) continue

      // Si es fila de total o saldo final, detener
      const rowText = row.join('').toLowerCase()
      if (rowText.includes('total') || rowText.includes('saldo final')) {
        break
      }

      // Parsear fecha (formato DD/MM)
      const fechaStr = String(row[0]).trim()
      let fecha = ''
      
      if (fechaStr.includes('/')) {
        const [dia, mesNum] = fechaStr.split('/')
        // Validar que día y mes sean números válidos
        const diaNum = parseInt(dia)
        const mesNumInt = parseInt(mesNum)
        
        if (isNaN(diaNum) || isNaN(mesNumInt) || diaNum < 1 || diaNum > 31 || mesNumInt < 1 || mesNumInt > 12) {
          continue
        }
        
        fecha = `${anio}-${mesNum.padStart(2, '0')}-${dia.padStart(2, '0')}`
      } else {
        continue
      }

      const numeroDoc = row[1] ? String(row[1]).trim() : ''
      const descripcion = row[3] ? String(row[3]).trim() : 'Sin descripción'
      
      // Columnas: Fecha | Num Op | Sucursal | Descripción | Depósitos | Giros | Saldo
      const deposito = Number(row[4]) || 0
      const giro = Number(row[5]) || 0

      const idTransaccion = numeroDoc && numeroDoc !== '0' && numeroDoc !== '000000000'
        ? `ITAU-${fecha}-${numeroDoc}`
        : `ITAU-${fecha}-${Math.round(deposito || giro)}-${i}`

      // Egreso
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

      // Ingreso
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

    // Consultar Supabase para ver qué ya está capturado
    const fechas = [...egresos, ...ingresos].map(m => m.fecha)
    const fechaMin = fechas.length > 0 ? fechas.sort()[0] : ''
    const fechaMax = fechas.length > 0 ? fechas.sort()[fechas.length - 1] : ''
    
    if (!fechaMin || !fechaMax) {
      return NextResponse.json({ error: 'No se encontraron transacciones válidas' }, { status: 400 })
    }

    // Egresos existentes
    const { data: egresosExistentes } = await supabase
      .from('egresos')
      .select('id_transaccion')
      .gte('fecha', fechaMin)
      .lte('fecha', fechaMax)

    const idsEgresosExistentes = new Set(
      egresosExistentes?.map(e => e.id_transaccion) || []
    )

    // Ingresos existentes
    const { data: ingresosExistentes } = await supabase
      .from('ingresos')
      .select('id_transaccion')
      .gte('fecha', fechaMin)
      .lte('fecha', fechaMax)

    const idsIngresosExistentes = new Set(
      ingresosExistentes?.map(i => i.id_transaccion) || []
    )

    // Filtrar solo faltantes
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
      { error: 'Error procesando cartola: ' + String(error) },
      { status: 500 }
    )
  }
}
