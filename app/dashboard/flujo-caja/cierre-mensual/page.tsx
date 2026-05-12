'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const supabase = createClient()

interface TransaccionFaltante {
  fecha: string
  concepto: string
  categoria?: string
  medio_pago?: string
  monto: number
  id_transaccion: string
  tipo: 'egreso' | 'ingreso'
}

interface ResultadoAnalisis {
  total_egresos: number
  total_ingresos: number
  egresos_capturados: number
  ingresos_capturados: number
  egresos_faltantes: TransaccionFaltante[]
  ingresos_faltantes: TransaccionFaltante[]
}

export default function CierreMensualPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importando, setImportando] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setArchivo(file)
        setError(null)
      } else {
        setError('Por favor sube un archivo .xls o .xlsx')
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        setArchivo(file)
        setError(null)
      } else {
        setError('Por favor sube un archivo .xls o .xlsx')
      }
    }
  }

  const procesarCartola = async () => {
    if (!archivo) return

    setProcesando(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('cartola', archivo)

      const response = await fetch('/api/procesar-cartola', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error procesando cartola')
      }

      const data = await response.json()
      setResultado(data)
    } catch (err) {
      setError('Error procesando la cartola. Verifica el formato del archivo.')
      console.error(err)
    } finally {
      setProcesando(false)
    }
  }

  const importarFaltantes = async () => {
    if (!resultado) return

    setImportando(true)
    setError(null)

    try {
      for (const egr of resultado.egresos_faltantes) {
        const { error } = await supabase.from('egresos').insert({
          fecha: egr.fecha,
          hora: '12:00',
          concepto: egr.concepto,
          categoria: egr.categoria || 'Otros',
          monto: egr.monto,
          id_transaccion: egr.id_transaccion,
          origen: 'cartola_cierre'
        })

        if (error && error.code !== '23505') {
          console.error('Error insertando egreso:', error)
        }
      }

      for (const ing of resultado.ingresos_faltantes) {
        const { error } = await supabase.from('ingresos').insert({
          fecha: ing.fecha,
          hora: '12:00',
          concepto: ing.concepto,
          medio_pago: ing.medio_pago || 'Otro',
          monto: ing.monto,
          id_transaccion: ing.id_transaccion,
          origen: 'cartola_cierre'
        })

        if (error && error.code !== '23505') {
          console.error('Error insertando ingreso:', error)
        }
      }

      alert(`✅ Importación completada:\n${resultado.egresos_faltantes.length} egresos\n${resultado.ingresos_faltantes.length} ingresos`)
      
      setArchivo(null)
      setResultado(null)
      
    } catch (err) {
      setError('Error importando transacciones')
      console.error(err)
    } finally {
      setImportando(false)
    }
  }

  const fmtCLP = (n: number) => `$${n.toLocaleString('es-CL')}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto p-8">
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🏦 Cierre Mensual
              </h1>
              <p className="text-gray-600">
                Completa el flujo de caja con los movimientos de la cartola bancaria
              </p>
            </div>
            <Link 
              href="/dashboard/flujo-caja"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              ← Volver
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            1️⃣ Sube la cartola bancaria
          </h2>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              archivo ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {archivo ? (
                <div>
                  <div className="text-5xl mb-4">✅</div>
                  <div className="text-xl font-semibold text-green-700 mb-2">
                    {archivo.name}
                  </div>
                  <div className="text-gray-600">
                    {(archivo.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-4">📁</div>
                  <div className="text-xl font-semibold text-gray-700 mb-2">
                    Arrastra aquí la cartola .xls
                  </div>
                  <div className="text-gray-500">
                    o haz click para seleccionar
                  </div>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {archivo && !resultado && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={procesarCartola}
                disabled={procesando}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  procesando
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {procesando ? '⚙️ Procesando...' : '🔍 Analizar Cartola'}
              </button>
            </div>
          )}
        </div>

        {resultado && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                2️⃣ Resumen del análisis
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Egresos cartola</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {resultado.total_egresos}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Ya capturados</div>
                  <div className="text-2xl font-bold text-green-600">
                    {resultado.egresos_capturados}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Faltantes</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {resultado.egresos_faltantes.length}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Monto faltante</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {fmtCLP(resultado.egresos_faltantes.reduce((sum, e) => sum + e.monto, 0))}
                  </div>
                </div>
              </div>

              {resultado.egresos_faltantes.length === 0 ? (
                <div className="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg">
                  <div className="text-green-700 font-semibold text-lg">
                    ✅ No hay transacciones faltantes
                  </div>
                  <div className="text-green-600 mt-2">
                    Todos los movimientos de la cartola ya están capturados en el sistema.
                  </div>
                </div>
              ) : (
                <>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {resultado.egresos_faltantes.map((egr, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {egr.fecha}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {egr.concepto}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {egr.categoria}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                              {fmtCLP(egr.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-center gap-4">
                    <button
                      onClick={importarFaltantes}
                      disabled={importando}
                      className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                        importando
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {importando ? '⏳ Importando...' : '✅ Importar Faltantes a Supabase'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
