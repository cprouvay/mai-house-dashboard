'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const supabase = createClient()

// Componente principal de Calculadora de Recetas
export default function Recetas() {
  const [activeTab, setActiveTab] = useState('insumos') // insumos, productos, analisis
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Botón Volver */}
              <button
                onClick={() => router.push('/dashboard/flujo-caja')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 font-medium text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🧪 Calculadora de Recetas
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Gestión de costos, márgenes y análisis de productos
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Productos</div>
              <div className="text-3xl font-bold text-purple-600">73</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('insumos')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === 'insumos'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 Insumos
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === 'productos'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🍳 Productos
            </button>
            <button
              onClick={() => setActiveTab('analisis')}
              className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                activeTab === 'analisis'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Análisis
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'insumos' && <TabInsumos />}
        {activeTab === 'productos' && <TabProductos />}
        {activeTab === 'analisis' && <TabAnalisis />}
      </div>
    </div>
  )
}

// ============================================================
// TAB 1: INSUMOS
// ============================================================
function TabInsumos() {
  const [insumos, setInsumos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [insumoEditar, setInsumoEditar] = useState<any>(null)

  useEffect(() => {
    cargarInsumos()
  }, [])

  const cargarInsumos = async () => {
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setInsumos(data || [])
    } catch (error) {
      console.error('Error cargando insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = ['Todos', ...new Set(insumos.map(i => i.categoria))]
  const insumosFiltrados = categoriaFiltro === 'Todos' 
    ? insumos 
    : insumos.filter(i => i.categoria === categoriaFiltro)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando insumos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-700 font-semibold">Filtrar por categoría:</span>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                categoriaFiltro === cat
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Insumos */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Código</th>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-right">Precio Unitario</th>
                <th className="px-6 py-4 text-left">Unidad</th>
                <th className="px-6 py-4 text-left">Notas</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {insumosFiltrados.map((insumo, idx) => (
                <tr key={insumo.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{insumo.codigo}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{insumo.nombre}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {insumo.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    ${insumo.precio_unitario.toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{insumo.unidad_medida}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {insumo.notas}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setInsumoEditar(insumo)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Total de insumos mostrados</div>
            <div className="text-3xl font-bold mt-1">{insumosFiltrados.length}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Total en sistema</div>
            <div className="text-3xl font-bold mt-1">{insumos.length}</div>
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {insumoEditar && (
        <ModalEditarInsumo
          insumo={insumoEditar}
          onClose={() => setInsumoEditar(null)}
          onSave={cargarInsumos}
        />
      )}
    </div>
  )
}

// ============================================================
// MODAL: Editar Insumo
// ============================================================
function ModalEditarInsumo({ insumo, onClose, onSave }: { insumo: any, onClose: () => void, onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: insumo.nombre,
    precio_unitario: insumo.precio_unitario,
    unidad_medida: insumo.unidad_medida,
    categoria: insumo.categoria,
    notas: insumo.notas || ''
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setGuardando(true)
    setError('')
    
    try {
      const { error: updateError } = await supabase
        .from('insumos')
        .update(form)
        .eq('id', insumo.id)
      
      if (updateError) throw updateError
      
      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
      console.error('Error actualizando insumo:', err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Editar Insumo</h2>
              <p className="text-blue-100 text-sm mt-1">Código: {insumo.codigo}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-600 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Insumo
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Ej: Café espresso"
            />
          </div>

          {/* Precio y Unidad con visualización */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio Unitario
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={form.precio_unitario}
                  onChange={(e) => setForm({...form, precio_unitario: parseFloat(e.target.value) || 0})}
                  className="w-full pl-8 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              {/* Precio formateado */}
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-semibold text-green-600">
                  ${form.precio_unitario.toLocaleString('es-CL')}
                </span>
                <span className="text-gray-500"> / {form.unidad_medida || 'unidad'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <input
                type="text"
                value={form.unidad_medida}
                onChange={(e) => setForm({...form, unidad_medida: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Ej: kg, ml, unidad"
              />
              <div className="mt-2 text-xs text-gray-500">
                💡 Ejemplos: kg, gr, ml, l, unidad
              </div>
            </div>
          </div>

          {/* Vista previa del precio por unidad - destacado */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-xs text-gray-600 font-semibold">Precio por Unidad</div>
                  <div className="text-xl font-bold text-green-700">
                    ${form.precio_unitario.toLocaleString('es-CL')} / {form.unidad_medida || 'unidad'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Este precio se usará en</div>
                <div className="text-sm font-semibold text-gray-700">todas las recetas</div>
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={form.categoria}
              onChange={(e) => setForm({...form, categoria: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="Café">Café</option>
              <option value="Lácteos">Lácteos</option>
              <option value="Té">Té</option>
              <option value="Jarabes">Jarabes</option>
              <option value="Endulzantes">Endulzantes</option>
              <option value="Repostería">Repostería</option>
              <option value="Boba">Boba</option>
              <option value="Packaging">Packaging</option>
              <option value="Proveedor repostería">Proveedor repostería</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({...form, notas: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              rows={3}
              placeholder="Información adicional sobre el insumo..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-4">
          <button
            onClick={handleSave}
            disabled={guardando}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              guardando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {guardando ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </button>
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TAB 2: PRODUCTOS
// ============================================================
function TabProductos() {
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [ordenPor, setOrdenPor] = useState('margen_desc')
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('activo', true)
        .order('margen_porcentaje', { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSemaforo = (margen: number) => {
    if (margen >= 60) return { emoji: '🟢', label: 'Saludable', color: 'green' }
    if (margen >= 40) return { emoji: '🟡', label: 'Aceptable', color: 'yellow' }
    return { emoji: '🔴', label: 'Riesgo', color: 'red' }
  }

  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria))]
  
  let productosFiltrados = categoriaFiltro === 'Todos' 
    ? productos 
    : productos.filter(p => p.categoria === categoriaFiltro)

  if (ordenPor === 'margen_desc') {
    productosFiltrados.sort((a, b) => b.margen_porcentaje - a.margen_porcentaje)
  } else if (ordenPor === 'margen_asc') {
    productosFiltrados.sort((a, b) => a.margen_porcentaje - b.margen_porcentaje)
  } else if (ordenPor === 'nombre') {
    productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (ordenPor === 'precio') {
    productosFiltrados.sort((a, b) => b.precio_venta - a.precio_venta)
  }

  const stats = {
    total: productos.length,
    saludables: productos.filter(p => p.margen_porcentaje >= 60).length,
    aceptables: productos.filter(p => p.margen_porcentaje >= 40 && p.margen_porcentaje < 60).length,
    riesgo: productos.filter(p => p.margen_porcentaje < 40).length,
    margenPromedio: productos.length > 0 
      ? (productos.reduce((sum, p) => sum + p.margen_porcentaje, 0) / productos.length).toFixed(1)
      : '0'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="text-sm text-gray-600">Total Productos</div>
          <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
          <div className="text-sm opacity-90">🟢 Saludables</div>
          <div className="text-3xl font-bold">{stats.saludables}</div>
          <div className="text-xs opacity-75">≥60% margen</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
          <div className="text-sm opacity-90">🟡 Aceptables</div>
          <div className="text-3xl font-bold">{stats.aceptables}</div>
          <div className="text-xs opacity-75">40-60% margen</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
          <div className="text-sm opacity-90">🔴 En Riesgo</div>
          <div className="text-3xl font-bold">{stats.riesgo}</div>
          <div className="text-xs opacity-75">&lt;40% margen</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
          <div className="text-sm opacity-90">Margen Promedio</div>
          <div className="text-3xl font-bold">{stats.margenPromedio}%</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <span className="text-gray-700 font-semibold block mb-3">Filtrar por categoría:</span>
          <div className="flex flex-wrap gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoriaFiltro === cat
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-semibold">Ordenar por:</span>
          <select
            value={ordenPor}
            onChange={(e) => setOrdenPor(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            <option value="margen_desc">Mayor margen primero</option>
            <option value="margen_asc">Menor margen primero</option>
            <option value="nombre">Nombre A-Z</option>
            <option value="precio">Mayor precio primero</option>
          </select>
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-left">Código</th>
                <th className="px-6 py-4 text-left">Nombre</th>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-right">Precio Venta</th>
                <th className="px-6 py-4 text-right">Costo</th>
                <th className="px-6 py-4 text-right">Margen $</th>
                <th className="px-6 py-4 text-right">Margen %</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productosFiltrados.map((producto, idx) => {
                const semaforo = getSemaforo(producto.margen_porcentaje)
                return (
                  <tr key={producto.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl">{semaforo.emoji}</span>
                        <span className={`text-xs font-semibold ${
                          semaforo.color === 'green' ? 'text-green-600' :
                          semaforo.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {semaforo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{producto.codigo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{producto.nombre}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      ${producto.precio_venta.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-orange-600">
                      ${producto.costo_por_porcion.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      ${producto.margen_pesos.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        producto.margen_porcentaje >= 60 ? 'bg-green-100 text-green-700' :
                        producto.margen_porcentaje >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {producto.margen_porcentaje.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setProductoSeleccionado(producto)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                      >
                        Ver Receta
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {productoSeleccionado && (
        <ModalProducto 
          producto={productoSeleccionado} 
          onClose={() => {
            setProductoSeleccionado(null)
            cargarProductos() // Recargar lista después de cerrar modal
          }} 
        />
      )}
    </div>
  )
}

// Modal de Producto
function ModalProducto({ producto, onClose }: { producto: any, onClose: () => void }) {
  const [ingredientes, setIngredientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [modoAgregarIngrediente, setModoAgregarIngrediente] = useState(false)
  const [productoActual, setProductoActual] = useState(producto)
  const [form, setForm] = useState({
    nombre: producto.nombre,
    precio_venta: Number(producto.precio_venta),
    categoria: producto.categoria,
    porciones: Number(producto.porciones)
  })

  useEffect(() => {
    cargarIngredientes()
  }, [])

  const cargarIngredientes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('receta_ingredientes')
        .select(`
          id,
          cantidad,
          costo_ingrediente,
          insumos (
            id,
            nombre,
            unidad_medida,
            precio_unitario,
            categoria
          )
        `)
        .eq('receta_id', producto.id)

      if (error) throw error
      setIngredientes(data || [])
    } catch (error) {
      console.error('Error cargando ingredientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const editarCantidadIngrediente = async (ingredienteId: number, nuevaCantidad: number) => {
    try {
      const { error } = await supabase
        .from('receta_ingredientes')
        .update({ cantidad: nuevaCantidad })
        .eq('id', ingredienteId)

      if (error) throw error

      await new Promise(resolve => setTimeout(resolve, 300))
      await cargarIngredientes()
      await recargarProducto()
    } catch (error) {
      console.error('Error editando cantidad:', error)
      alert('Error al actualizar la cantidad')
    }
  }

  const eliminarIngrediente = async (ingredienteId: number) => {
    if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return

    try {
      const { error } = await supabase
        .from('receta_ingredientes')
        .delete()
        .eq('id', ingredienteId)

      if (error) throw error

      await new Promise(resolve => setTimeout(resolve, 300))
      await cargarIngredientes()
      await recargarProducto()
    } catch (error) {
      console.error('Error eliminando ingrediente:', error)
      alert('Error al eliminar el ingrediente')
    }
  }

  const recargarProducto = async () => {
    try {
      const { data, error } = await supabase
        .from('recetas')
        .select('*')
        .eq('id', producto.id)
        .single()

      if (error) throw error
      
      if (data) {
        setProductoActual(data)
        setForm({
          nombre: data.nombre,
          precio_venta: Number(data.precio_venta),
          categoria: data.categoria,
          porciones: Number(data.porciones)
        })
      }
    } catch (error) {
      console.error('Error recargando producto:', error)
    }
  }

  const handleSave = async () => {
    setGuardando(true)
    try {
      // Primero actualizar los datos básicos
      const { error: updateError } = await supabase
        .from('recetas')
        .update({
          nombre: form.nombre,
          precio_venta: form.precio_venta,
          categoria: form.categoria,
          porciones: form.porciones
        })
        .eq('id', producto.id)

      if (updateError) throw updateError

      // Calcular márgenes manualmente
      const costo = productoActual.costo_por_porcion
      const margen_pesos = form.precio_venta - costo
      const margen_porcentaje = costo > 0 ? ((margen_pesos / form.precio_venta) * 100) : 0

      // Actualizar márgenes calculados
      const { error: margenError } = await supabase
        .from('recetas')
        .update({
          margen_pesos: margen_pesos,
          margen_porcentaje: margen_porcentaje
        })
        .eq('id', producto.id)

      if (margenError) throw margenError

      // Esperar un momento
      await new Promise(resolve => setTimeout(resolve, 300))

      // Recargar el producto completo
      await recargarProducto()

      setModoEdicion(false)
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert('Error al guardar los cambios')
    } finally {
      setGuardando(false)
    }
  }

  const semaforo = productoActual.margen_porcentaje >= 60 ? '🟢' :
                   productoActual.margen_porcentaje >= 40 ? '🟡' : '🔴'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {!modoEdicion ? (
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{semaforo}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{productoActual.nombre}</h2>
                    <p className="text-purple-100">{productoActual.categoria}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{semaforo}</span>
                    <div className="flex-1">
                      <label className="block text-xs text-purple-100 mb-1">Nombre del Producto</label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({...form, nombre: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg text-gray-900 font-bold text-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-purple-100 mb-1">Categoría</label>
                    <select
                      value={form.categoria}
                      onChange={(e) => setForm({...form, categoria: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg text-gray-900"
                    >
                      <option value="Lattes">Lattes</option>
                      <option value="Boba Tea">Boba Tea</option>
                      <option value="Pasteleria">Pasteleria</option>
                      <option value="Pasteleria Vegan">Pasteleria Vegan</option>
                      <option value="New york Cookie">New york Cookie</option>
                      <option value="Gatchas">Gatchas</option>
                      <option value="Mai Favorites 🩵">Mai Favorites 🩵</option>
                      <option value="Soda Pop">Soda Pop</option>
                      <option value="Iced Tea">Iced Tea</option>
                      <option value="Blended">Blended</option>
                      <option value="Extras">Extras</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="text-sm font-mono bg-purple-600 bg-opacity-50 px-3 py-1 rounded inline-block mt-2">
                {productoActual.codigo}
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              {!modoEdicion ? (
                <button
                  onClick={() => setModoEdicion(true)}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold transition-colors"
                >
                  ✏️ Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={guardando}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      guardando
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {guardando ? '💾 Guardando...' : '💾 Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setModoEdicion(false)
                      setForm({
                        nombre: productoActual.nombre,
                        precio_venta: Number(productoActual.precio_venta),
                        categoria: productoActual.categoria,
                        porciones: Number(productoActual.porciones)
                      })
                    }}
                    disabled={guardando}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                className="text-white hover:bg-purple-600 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Precio Venta</div>
            {!modoEdicion ? (
              <div className="text-2xl font-bold text-blue-600">
                ${productoActual.precio_venta.toLocaleString('es-CL')}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-full">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={form.precio_venta}
                    onChange={(e) => setForm({...form, precio_venta: Number(e.target.value) || 0})}
                    className="w-full pl-6 pr-2 py-1 text-center text-xl font-bold text-blue-600 border-2 border-blue-300 rounded"
                    min="0"
                    step="100"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ${form.precio_venta.toLocaleString('es-CL')}
                </div>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Costo Total</div>
            <div className="text-2xl font-bold text-orange-600">
              ${productoActual.costo_por_porcion.toLocaleString('es-CL')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Margen ($)</div>
            <div className="text-2xl font-bold text-green-600">
              ${productoActual.margen_pesos.toLocaleString('es-CL')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Margen (%)</div>
            <div className="text-2xl font-bold text-purple-600">
              {productoActual.margen_porcentaje.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">📋 Ingredientes de la Receta</h3>
            {!modoEdicion && ingredientes.length > 0 && (
              <button
                onClick={() => setModoEdicion(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold transition-colors"
              >
                ➕ Gestionar Ingredientes
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando ingredientes...</p>
            </div>
          ) : ingredientes.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-yellow-800 font-semibold">Este producto no tiene ingredientes registrados</p>
              <p className="text-yellow-600 text-sm mt-1">Por eso el costo es $0</p>
              
              {/* Siempre mostrar opción de agregar cuando no hay ingredientes */}
              {!modoAgregarIngrediente ? (
                <button
                  onClick={() => {
                    setModoEdicion(true)
                    setModoAgregarIngrediente(true)
                  }}
                  className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  ➕ Agregar Primer Ingrediente
                </button>
              ) : (
                <div className="mt-4">
                  <AgregarIngredienteForm
                    recetaId={producto.id}
                    onClose={() => {
                      setModoAgregarIngrediente(false)
                      setModoEdicion(false)
                    }}
                    onAdded={() => {
                      cargarIngredientes()
                      recargarProducto()
                      setModoAgregarIngrediente(false)
                      setModoEdicion(false)
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Formulario Agregar Ingrediente */}
              {modoEdicion && modoAgregarIngrediente && (
                <AgregarIngredienteForm
                  recetaId={producto.id}
                  onClose={() => setModoAgregarIngrediente(false)}
                  onAdded={() => {
                    cargarIngredientes()
                    recargarProducto()
                    setModoAgregarIngrediente(false)
                  }}
                />
              )}

              {/* Botón Agregar Ingrediente (cuando ya hay ingredientes) */}
              {modoEdicion && !modoAgregarIngrediente && (
                <div className="mb-4">
                  <button
                    onClick={() => setModoAgregarIngrediente(true)}
                    className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 text-green-700 rounded-lg hover:bg-green-100 font-semibold transition-colors"
                  >
                    ➕ Agregar Nuevo Ingrediente
                  </button>
                </div>
              )}

              {/* Tabla de Ingredientes */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ingrediente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Precio Unit.</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Costo</th>
                      {modoEdicion && (
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ingredientes.map((ing, idx) => (
                      <FilaIngrediente
                        key={ing.id || idx}
                        ingrediente={ing}
                        modoEdicion={modoEdicion}
                        onCantidadChange={async (nuevaCantidad) => {
                          await editarCantidadIngrediente(ing.id, nuevaCantidad)
                        }}
                        onEliminar={async () => {
                          await eliminarIngrediente(ing.id)
                        }}
                        isEven={idx % 2 === 0}
                      />
                    ))}
                    <tr className="bg-purple-50 font-bold">
                      <td colSpan={modoEdicion ? 5 : 4} className="px-4 py-3 text-right text-gray-900">
                        COSTO TOTAL:
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 text-lg">
                        ${productoActual.costo_total.toLocaleString('es-CL')}
                      </td>
                      {modoEdicion && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Botones de Control de Modo Edición */}
              {modoEdicion && (
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={async () => {
                      setModoEdicion(false)
                      setModoAgregarIngrediente(false)
                      await recargarProducto()
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    ✓ Finalizar Edición
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {productoActual.margen_porcentaje < 60 && (
          <div className="p-6 bg-yellow-50 border-t-2 border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2">💡 Recomendación de Precio</h4>
            <p className="text-yellow-700">
              Para alcanzar un margen del 60%, deberías vender este producto a: 
              <span className="font-bold text-yellow-900 ml-2">
                ${Math.ceil(productoActual.costo_por_porcion / 0.4).toLocaleString('es-CL')}
              </span>
            </p>
          </div>
        )}

        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTE: Fila de Ingrediente Editable
// ============================================================
function FilaIngrediente({ 
  ingrediente, 
  modoEdicion, 
  onCantidadChange, 
  onEliminar,
  isEven 
}: { 
  ingrediente: any, 
  modoEdicion: boolean, 
  onCantidadChange: (cantidad: number) => void,
  onEliminar: () => void,
  isEven: boolean
}) {
  const [editando, setEditando] = useState(false)
  const [cantidad, setCantidad] = useState(ingrediente.cantidad)

  const handleSave = async () => {
    if (cantidad !== ingrediente.cantidad) {
      await onCantidadChange(cantidad)
    }
    setEditando(false)
  }

  return (
    <tr className={isEven ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-4 py-3 font-medium text-gray-900">
        {ingrediente.insumos.nombre}
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {ingrediente.insumos.categoria}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-gray-700">
        {modoEdicion && editando ? (
          <div className="flex items-center justify-end gap-2">
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value) || 0)}
              className="w-20 px-2 py-1 border-2 border-blue-300 rounded text-right"
              step="0.01"
              min="0"
            />
            <span className="text-sm">{ingrediente.insumos.unidad_medida}</span>
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setCantidad(ingrediente.cantidad)
                setEditando(false)
              }}
              className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 text-xs"
            >
              ✗
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span>{ingrediente.cantidad} {ingrediente.insumos.unidad_medida}</span>
            {modoEdicion && (
              <button
                onClick={() => setEditando(true)}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
              >
                ✏️
              </button>
            )}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-right text-gray-600">
        ${ingrediente.insumos.precio_unitario.toLocaleString('es-CL')}
      </td>
      <td className="px-4 py-3 text-right font-bold text-green-600">
        ${ingrediente.costo_ingrediente.toLocaleString('es-CL')}
      </td>
      {modoEdicion && (
        <td className="px-4 py-3 text-center">
          <button
            onClick={onEliminar}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            🗑️
          </button>
        </td>
      )}
    </tr>
  )
}

// ============================================================
// COMPONENTE: Formulario Agregar Ingrediente
// ============================================================
function AgregarIngredienteForm({ 
  recetaId, 
  onClose, 
  onAdded 
}: { 
  recetaId: number, 
  onClose: () => void, 
  onAdded: () => void 
}) {
  const [insumos, setInsumos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState<number>(0)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')

  useEffect(() => {
    cargarInsumos()
  }, [])

  const cargarInsumos = async () => {
    try {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error
      setInsumos(data || [])
    } catch (error) {
      console.error('Error cargando insumos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAgregar = async () => {
    if (!insumoSeleccionado || cantidad <= 0) {
      alert('Selecciona un insumo y una cantidad válida')
      return
    }

    setGuardando(true)
    try {
      const { error } = await supabase
        .from('receta_ingredientes')
        .insert([{
          receta_id: recetaId,
          insumo_id: insumoSeleccionado,
          cantidad: cantidad
        }])

      if (error) throw error

      // Mostrar mensaje de éxito
      setExito(true)

      // Esperar que los triggers recalculen
      await new Promise(resolve => setTimeout(resolve, 800))

      // Limpiar formulario
      setInsumoSeleccionado(null)
      setCantidad(0)
      setCategoriaFiltro('Todos')
      
      // Notificar éxito y cerrar
      onAdded()
    } catch (error) {
      console.error('Error agregando ingrediente:', error)
      alert('Error al agregar el ingrediente')
    } finally {
      setGuardando(false)
      setExito(false)
    }
  }

  const categorias = ['Todos', ...new Set(insumos.map(i => i.categoria))]
  const insumosFiltrados = categoriaFiltro === 'Todos' 
    ? insumos 
    : insumos.filter(i => i.categoria === categoriaFiltro)

  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-800">➕ Agregar Ingrediente</h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtro por categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrar por categoría:
            </label>
            <div className="flex flex-wrap gap-2">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    categoriaFiltro === cat
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de insumo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Insumo
            </label>
            <select
              value={insumoSeleccionado || ''}
              onChange={(e) => setInsumoSeleccionado(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            >
              <option value="">Seleccionar insumo...</option>
              {insumosFiltrados.map(insumo => (
                <option key={insumo.id} value={insumo.id}>
                  {insumo.nombre} (${insumo.precio_unitario.toLocaleString('es-CL')} / {insumo.unidad_medida})
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              placeholder="0"
              step="0.01"
              min="0"
            />
            {insumoSeleccionado && (
              <p className="text-sm text-gray-600 mt-1">
                Unidad: {insumos.find(i => i.id === insumoSeleccionado)?.unidad_medida}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleAgregar}
              disabled={guardando || exito || !insumoSeleccionado || cantidad <= 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                exito
                  ? 'bg-green-600 text-white'
                  : guardando || !insumoSeleccionado || cantidad <= 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {exito ? '✅ ¡Ingrediente Agregado!' : guardando ? '⏳ Agregando...' : '✓ Agregar Ingrediente'}
            </button>
            <button
              onClick={onClose}
              disabled={guardando || exito}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// TAB 3: ANÁLISIS
// ============================================================
function TabAnalisis() {
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: productosData, error: productosError } = await supabase
        .from('recetas')
        .select('*')
        .eq('activo', true)

      if (productosError) throw productosError
      setProductos(productosData || [])

      const { data: categoriasData, error: categoriasError } = await supabase
        .from('vista_analisis_categorias')
        .select('*')

      if (categoriasError) throw categoriasError
      setCategorias(categoriasData || [])
    } catch (error) {
      console.error('Error cargando análisis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generando análisis...</p>
      </div>
    )
  }

  const top10Rentables = [...productos]
    .sort((a, b) => b.margen_porcentaje - a.margen_porcentaje)
    .slice(0, 10)

  const top10Riesgo = [...productos]
    .filter(p => p.margen_porcentaje < 40)
    .sort((a, b) => a.margen_porcentaje - b.margen_porcentaje)
    .slice(0, 10)

  const productosProblema = productos.filter(p => 
    p.margen_porcentaje < 40 || p.costo_por_porcion === 0 || p.margen_porcentaje < 0
  )

  const stats = {
    total: productos.length,
    margenPromedio: productos.length > 0 
      ? (productos.reduce((sum, p) => sum + p.margen_porcentaje, 0) / productos.length).toFixed(1)
      : '0',
    saludables: productos.filter(p => p.margen_porcentaje >= 60).length,
    riesgo: productos.filter(p => p.margen_porcentaje < 40).length,
    sinReceta: productos.filter(p => p.costo_por_porcion === 0).length,
    negativos: productos.filter(p => p.margen_porcentaje < 0).length
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90">Margen Promedio Global</div>
          <div className="text-4xl font-bold mt-2">{stats.margenPromedio}%</div>
          <div className="text-sm opacity-75 mt-1">{stats.total} productos analizados</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90">🟢 Productos Saludables</div>
          <div className="text-4xl font-bold mt-2">{stats.saludables}</div>
          <div className="text-sm opacity-75 mt-1">{((stats.saludables / stats.total) * 100).toFixed(0)}% del total</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="text-sm opacity-90">⚠️ Requieren Atención</div>
          <div className="text-4xl font-bold mt-2">{productosProblema.length}</div>
          <div className="text-sm opacity-75 mt-1">
            {stats.riesgo} bajo margen, {stats.sinReceta} sin receta, {stats.negativos} negativos
          </div>
        </div>
      </div>

      {/* Alertas */}
      {productosProblema.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🚨</span>
            <h3 className="text-xl font-bold text-red-800">Productos que Requieren Atención Inmediata</h3>
          </div>
          <div className="space-y-2">
            {productosProblema.slice(0, 5).map(p => (
              <div key={p.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{p.nombre}</div>
                  <div className="text-sm text-gray-600">{p.categoria}</div>
                </div>
                <div className="text-right">
                  {p.costo_por_porcion === 0 ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                      Sin receta registrada
                    </span>
                  ) : p.margen_porcentaje < 0 ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                      Margen negativo: {p.margen_porcentaje.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
                      Margen bajo: {p.margen_porcentaje.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {productosProblema.length > 5 && (
            <div className="mt-4 text-center text-red-600 text-sm">
              +{productosProblema.length - 5} productos más requieren revisión
            </div>
          )}
        </div>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🏆</span>
            <h3 className="text-xl font-bold text-gray-800">Top 10 Más Rentables</h3>
          </div>
          <div className="space-y-3">
            {top10Rentables.map((p, idx) => (
              <div 
                key={p.id} 
                className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${
                  idx < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className={`text-2xl font-bold ${
                  idx === 0 ? 'text-yellow-500' :
                  idx === 1 ? 'text-gray-400' :
                  idx === 2 ? 'text-orange-600' :
                  'text-gray-300'
                }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{p.nombre}</div>
                  <div className="text-sm text-gray-600">{p.categoria}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {p.margen_porcentaje.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    ${p.margen_pesos.toLocaleString('es-CL')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-bold text-gray-800">Top 10 Menor Margen</h3>
          </div>
          {top10Riesgo.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-600 font-medium">¡Todos los productos tienen márgenes saludables!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top10Riesgo.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-200 hover:shadow-md transition-all"
                >
                  <div className="text-2xl font-bold text-red-400">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{p.nombre}</div>
                    <div className="text-sm text-gray-600">{p.categoria}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      p.margen_porcentaje < 0 ? 'text-red-700' : 'text-orange-600'
                    }`}>
                      {p.margen_porcentaje.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      💡 Sugerido: ${Math.ceil(p.costo_por_porcion / 0.4).toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Análisis por Categoría */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <h3 className="text-xl font-bold text-gray-800">Análisis por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Categoría</th>
                <th className="px-6 py-4 text-center">Productos</th>
                <th className="px-6 py-4 text-right">Precio Promedio</th>
                <th className="px-6 py-4 text-right">Costo Promedio</th>
                <th className="px-6 py-4 text-right">Margen Promedio</th>
                <th className="px-6 py-4 text-center">🟢 Saludables</th>
                <th className="px-6 py-4 text-center">🔴 En Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categorias.map((cat, idx) => (
                <tr key={cat.categoria} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 font-semibold text-gray-900">{cat.categoria}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">
                      {cat.total_productos}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-blue-600 font-semibold">
                    ${cat.precio_promedio?.toLocaleString('es-CL') || '0'}
                  </td>
                  <td className="px-6 py-4 text-right text-orange-600 font-semibold">
                    ${cat.costo_promedio?.toLocaleString('es-CL') || '0'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      cat.margen_promedio >= 60 ? 'bg-green-100 text-green-700' :
                      cat.margen_promedio >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {cat.margen_promedio?.toFixed(1) || '0'}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-green-600 font-bold">
                    {cat.saludables || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-red-600 font-bold">
                    {cat.en_riesgo || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">💡</span>
          <h3 className="text-xl font-bold">Recomendaciones Estratégicas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="font-bold mb-2">✅ Promocionar productos rentables</div>
            <div className="text-sm opacity-90">
              Enfócate en promocionar los {stats.saludables} productos con margen ≥60% para maximizar ganancias
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="font-bold mb-2">📈 Ajustar precios</div>
            <div className="text-sm opacity-90">
              {stats.riesgo} productos necesitan ajuste de precio para alcanzar margen objetivo del 60%
            </div>
          </div>
          {stats.sinReceta > 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="font-bold mb-2">📝 Completar recetas</div>
              <div className="text-sm opacity-90">
                {stats.sinReceta} productos no tienen ingredientes registrados. Agrégalos para calcular costos reales
              </div>
            </div>
          )}
          {stats.negativos > 0 && (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="font-bold mb-2">🚨 Atención urgente</div>
              <div className="text-sm opacity-90">
                {stats.negativos} productos se venden por debajo del costo. Ajusta precios inmediatamente
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
