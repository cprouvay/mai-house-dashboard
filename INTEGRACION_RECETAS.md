# INTEGRACIÓN MÓDULO RECETAS - MAI HOUSE CAFÉ
# ============================================================

## PASO 2.4: Integrar con Dashboard Principal

### ARCHIVO: App.jsx (o tu archivo principal de rutas)

```jsx
import Dashboard from './Dashboard';
import Recetas from './Recetas';  // ← AGREGAR ESTA LÍNEA
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recetas" element={<Recetas />} />  {/* ← AGREGAR ESTA LÍNEA */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### ARCHIVO: Dashboard.jsx

**PASO 1: Actualizar el botón "Recetas"**

Busca el botón de Recetas (el 5º botón) y actualiza así:

```jsx
// ANTES:
<button className="..." disabled>
  <div className="...">
    <span className="text-4xl">🧪</span>
    <div>
      <div className="font-bold text-gray-900">Recetas</div>
      <div className="text-sm text-gray-500">Próximamente</div>  {/* ← ELIMINAR */}
    </div>
    <span className="ml-auto bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
      Próximamente  {/* ← ELIMINAR */}
    </span>
  </div>
</button>

// DESPUÉS:
<button 
  onClick={() => navigate('/recetas')}  // ← AGREGAR onClick
  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"  // ← QUITAR disabled
>
  <div className="flex items-center gap-4">
    <span className="text-4xl">🧪</span>
    <div>
      <div className="font-bold text-gray-900">Recetas</div>
      <div className="text-sm text-gray-500">Gestión de costos y márgenes</div>  {/* ← NUEVO */}
    </div>
    <span className="ml-auto bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
      ✅ Activo  {/* ← NUEVO */}
    </span>
  </div>
</button>
```

**PASO 2: Agregar import de useNavigate**

Al inicio del archivo Dashboard.jsx:

```jsx
import { useNavigate } from 'react-router-dom';  // ← AGREGAR

export default function Dashboard() {
  const navigate = useNavigate();  // ← AGREGAR
  
  // ... resto del código
}
```

---

### ARCHIVO: Recetas.jsx

**Ya está completo y listo para usar. Solo asegúrate de tener:**

1. ✅ Componente exportado correctamente
2. ✅ Import de supabase configurado
3. ✅ React y useState importados

---

## VERIFICACIÓN FINAL

### 1. Estructura de archivos:
```
/src
  ├── App.jsx              (rutas configuradas)
  ├── Dashboard.jsx        (botón Recetas activo)
  ├── Recetas.jsx          (módulo completo)
  └── supabaseClient.js    (configuración Supabase)
```

### 2. Dependencias necesarias:
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "@supabase/supabase-js": "^2.x"
}
```

### 3. Variables de entorno (.env):
```
VITE_SUPABASE_URL=https://eykcynvhmtriehhqkuip.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## PRUEBA DE INTEGRACIÓN

### Test 1: Navegación
1. Abre el dashboard principal
2. Click en botón "🧪 Recetas"
3. Deberías ver la página de Recetas

### Test 2: Pestaña Insumos
1. Verifica que se carguen los 57 insumos
2. Prueba filtros por categoría
3. Verifica que los precios se muestren correctamente

### Test 3: Pestaña Productos
1. Verifica que se carguen los 73 productos
2. Verifica semáforos 🟢🟡🔴
3. Click en "Ver Receta" de cualquier producto
4. Verifica que se muestre el modal con ingredientes

### Test 4: Pestaña Análisis
1. Verifica KPIs principales
2. Verifica Top 10 rankings
3. Verifica tabla de análisis por categoría
4. Verifica alertas de productos en riesgo

---

## SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot find module 'react-router-dom'"
```bash
npm install react-router-dom
```

### Error: "supabase is not defined"
Asegúrate de tener el archivo `supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Error: "No data showing"
1. Verifica que RLS esté desactivado en Supabase
2. Verifica que los datos se hayan cargado correctamente
3. Abre la consola del navegador y busca errores

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [ ] Archivo Recetas.jsx copiado a /src
- [ ] Import agregado en App.jsx
- [ ] Ruta /recetas configurada
- [ ] Botón Dashboard actualizado (sin "Próximamente")
- [ ] useNavigate importado en Dashboard
- [ ] onClick agregado al botón Recetas
- [ ] Badge cambiado a "✅ Activo"
- [ ] Prueba de navegación exitosa
- [ ] Prueba de carga de datos exitosa
- [ ] Prueba de filtros funcional
- [ ] Prueba de modal de receta funcional

---

## PRÓXIMO PASO: PASO 2.5 - Documentación Final

Después de confirmar que todo funciona, procederemos a:
1. Crear guía rápida de uso para usuarios
2. Documentar flujo de actualización de precios
3. Entregar sistema completo

---

¿CONFIRMACIÓN NECESARIA?

Por favor confirma:
1. ✅ Archivos copiados a tu proyecto
2. ✅ Cambios aplicados en Dashboard.jsx
3. ✅ Navegación funcionando
4. ✅ Datos cargando correctamente

Luego continúo con PASO 2.5 (Documentación Final)
