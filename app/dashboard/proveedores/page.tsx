'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Proveedor {
  id: number
  nombre: string
  rut: string
  tipo_costo: 'Fijo' | 'Variable'
  categoria: string
  activo: boolean
  notas: string
  created_at: string
  updated_at: string
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos')
  const [filtroTipoCosto, setFiltroTipoCosto] = useState<string>('Todos')
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Proveedor | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('')

  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    tipo_costo: 'Variable' as 'Fijo' | 'Variable',
    categoria: 'Proveedor insumos',
    activo: true,
    notas: ''
  })

  const categorias = [
    'Arriendo',
    'Proveedor repostería',
    'Proveedor insumos',
    'Servicios básicos',
    'Remuneraciones',
    'Marketing',
    'Comisiones bancarias',
    'Retiro socio',
    'Otros'
  ]

  useEffect(() => {
    cargarProveedores()
  }, [])

  const cargarProveedores = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('categoria', { ascending: true })
      .order('nombre', { ascending: true })

    if (error) {
      console.error('Error cargando proveedores:', error)
    } else {
      setProveedores(data || [])
      
      // Actualizar timestamp
      const ahora = new Date()
      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      setUltimaActualizacion(ahora.toLocaleString('es-CL', opciones))
    }
    setLoading(false)
  }

  const guardarProveedor = async () => {
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    if (editando) {
      // Actualizar
      const { error } = await supabase
        .from('proveedores')
        .update(formData)
        .eq('id', editando.id)

      if (error) {
        alert('Error al actualizar: ' + error.message)
      } else {
        cerrarModal()
        cargarProveedores()
      }
    } else {
      // Crear nuevo
      const { error } = await supabase
        .from('proveedores')
        .insert([formData])

      if (error) {
        alert('Error al crear: ' + error.message)
      } else {
        cerrarModal()
        cargarProveedores()
      }
    }
  }

  const abrirModalNuevo = () => {
    setFormData({
      nombre: '',
      rut: '',
      tipo_costo: 'Variable',
      categoria: 'Proveedor insumos',
      activo: true,
      notas: ''
    })
    setEditando(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (proveedor: Proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      rut: proveedor.rut || '',
      tipo_costo: proveedor.tipo_costo,
      categoria: proveedor.categoria,
      activo: proveedor.activo,
      notas: proveedor.notas || ''
    })
    setEditando(proveedor)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setEditando(null)
  }

  const toggleActivo = async (proveedor: Proveedor) => {
    const { error } = await supabase
      .from('proveedores')
      .update({ activo: !proveedor.activo })
      .eq('id', proveedor.id)

    if (error) {
      alert('Error al cambiar estado: ' + error.message)
    } else {
      cargarProveedores()
    }
  }

  const proveedoresFiltrados = proveedores.filter(p => {
    const passCategoria = filtroCategoria === 'Todos' || p.categoria === filtroCategoria
    const passTipoCosto = filtroTipoCosto === 'Todos' || p.tipo_costo === filtroTipoCosto
    return passCategoria && passTipoCosto
  })

  const totalFijos = proveedores.filter(p => p.tipo_costo === 'Fijo' && p.activo).length
  const totalVariables = proveedores.filter(p => p.tipo_costo === 'Variable' && p.activo).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📋 Catálogo de Proveedores
              </h1>
              <p className="text-gray-600">
                Gestiona proveedores, categorías y costos fijos/variables
              </p>
              {/* ⭐ NUEVO: Timestamp de última actualización */}
              {ultimaActualizacion && (
                <p className="text-sm text-gray-500 mt-2">
                  🔄 Última actualización: {ultimaActualizacion}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {/* ⭐ NUEVO: Botón Volver */}
              <Link
                href="/dashboard/flujo-caja"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                ← Volver al Dashboard
              </Link>
              <button
                onClick={abrirModalNuevo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                ➕ Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-blue-600 text-sm font-semibold">Total Proveedores</div>
              <div className="text-3xl font-bold text-blue-900">{proveedores.filter(p => p.activo).length}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-red-600 text-sm font-semibold">Costos Fijos</div>
              <div className="text-3xl font-bold text-red-900">{totalFijos}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-green-600 text-sm font-semibold">Costos Variables</div>
              <div className="text-3xl font-bold text-green-900">{totalVariables}</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filtrar por Tipo de Costo
              </label>
              <select
                value={filtroTipoCosto}
                onChange={(e) => setFiltroTipoCosto(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos</option>
                <option value="Fijo">Costos Fijos</option>
                <option value="Variable">Costos Variables</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando proveedores...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Proveedor</th>
                  <th className="px-6 py-4 text-left font-semibold">RUT</th>
                  <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                  <th className="px-6 py-4 text-center font-semibold">Tipo Costo</th>
                  <th className="px-6 py-4 text-center font-semibold">Estado</th>
                  <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proveedoresFiltrados.map(proveedor => (
                  <tr key={proveedor.id} className={`hover:bg-gray-50 ${!proveedor.activo ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{proveedor.nombre}</div>
                      {proveedor.notas && (
                        <div className="text-sm text-gray-500 mt-1">{proveedor.notas}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{proveedor.rut || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {proveedor.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        proveedor.tipo_costo === 'Fijo' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {proveedor.tipo_costo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActivo(proveedor)}
                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          proveedor.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {proveedor.activo ? '✓ Activo' : '✗ Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => abrirModalEditar(proveedor)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editando ? '✏️ Editar Proveedor' : '➕ Nuevo Proveedor'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Anamaya Matcha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    RUT (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 76.314.488-7"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Costo *
                    </label>
                    <select
                      value={formData.tipo_costo}
                      onChange={(e) => setFormData({ ...formData, tipo_costo: e.target.value as 'Fijo' | 'Variable' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Fijo">Fijo</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Ej: Proveedor de matcha premium, entrega semanal"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-semibold text-gray-700">
                    Proveedor activo
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarProveedor}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg"
                >
                  {editando ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
