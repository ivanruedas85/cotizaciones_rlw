# 📊 Rueda Leather Wallet's - Sistema de Gestión de Ventas y Cotizaciones

Una aplicación web completa para la gestión de cotizaciones, inventario de insumos y análisis de ventas, especialmente diseñada para negocios de talabartería y trabajos en cuero.

## 🚀 Características Principales

### 💼 Gestión de Cotizaciones
- **Creación de Cotizaciones**: Formulario completo con cálculos automáticos
- **Estados Dinámicos**: Pendiente, Aprobada, Rechazada, En proceso, Completada, Cancelada
- **Generación de PDF**: Cotizaciones profesionales con información de empresa
- **Vista Previa**: Generar PDF sin guardar la cotización

### 👥 Gestión de Clientes
- **Base de Datos de Clientes**: Información completa (nombre, teléfono, email, dirección)
- **Búsqueda Avanzada**: Filtros por nombre, teléfono o email
- **Historial**: Seguimiento de cotizaciones por cliente
- **CRUD Completo**: Crear, leer, actualizar y eliminar clientes

### 📦 Inventario de Insumos
- **Catálogo Completo**: Insumos específicos para talabartería
- **Control de Stock**: Seguimiento de cantidades disponibles
- **Precios Dinámicos**: Precios por volumen y unitarios
- **Integración**: Los insumos se incluyen automáticamente en las cotizaciones

### 📈 Dashboard y Reportes
- **Métricas en Tiempo Real**: Total de ventas, tasa de conversión, clientes activos
- **Análisis por Período**: Filtros por fechas y períodos predefinidos
- **Visualizaciones**: Gráficos de distribución por estado
- **Top Clientes**: Ranking de mejores clientes
- **Exportación**: Reportes en formato JSON

### 🎨 Interfaz de Usuario
- **Diseño Moderno**: Interfaz limpia y profesional con Tailwind CSS
- **Responsive**: Adaptable a móvil, tablet y escritorio
- **Tema Oscuro/Claro**: Alternancia entre temas
- **Componentes Reutilizables**: Basado en shadcn/ui

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **PDF Generation**: jsPDF, jspdf-autotable
- **Icons**: Lucide React
- **Themes**: next-themes
- **Storage**: JSON files (fácilmente migrable a base de datos)

## 📁 Estructura del Proyecto

```bash
sales-quotation-manager/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── clientes/            # Endpoints de clientes
│   │   │   ├── route.ts         # GET, POST clientes
│   │   │   └── [id]/route.ts    # GET, PUT, DELETE cliente específico
│   │   └── cotizaciones/        # Endpoints de cotizaciones
│   │       ├── route.ts         # GET, POST cotizaciones
│   │       └── [id]/route.ts    # GET, PUT, DELETE cotización específica
│   ├── clientes/                # Páginas de clientes
│   │   ├── page.tsx            # Lista de clientes
│   │   ├── nuevo/page.tsx      # Formulario nuevo cliente
│   │   └── [id]/page.tsx       # Detalle de cliente
│   ├── cotizaciones/           # Páginas de cotizaciones
│   │   ├── page.tsx           # Lista de cotizaciones
│   │   └── [id]/page.tsx      # Detalle de cotización
│   ├── dashboard/             # Dashboard de reportes
│   │   └── page.tsx          # Página principal del dashboard
│   ├── insumos/              # Páginas de inventario
│   │   └── page.tsx         # Lista de insumos
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx          # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── ui/               # Componentes base de shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── client-form.tsx        # Formulario de selección de cliente
│   ├── client-list.tsx        # Lista de clientes
│   ├── dashboard.tsx          # Componente principal del dashboard
│   ├── footer.tsx             # Pie de página
│   ├── insumos-selector.tsx   # Selector de insumos
│   ├── navbar.tsx             # Barra de navegación
│   ├── quotation-detail.tsx   # Detalle de cotización
│   ├── quotation-list.tsx     # Lista de cotizaciones
│   ├── sales-quotation-form.tsx # Formulario principal de cotizaciones
│   ├── theme-provider.tsx     # Proveedor de temas
│   └── theme-toggle.tsx       # Botón de cambio de tema
├── data/                 # Archivos de datos JSON
│   ├── clientes.json    # Base de datos de clientes
│   ├── cotizaciones.json # Base de datos de cotizaciones
│   └── insumos.json     # Catálogo de insumos
├── utils/               # Utilidades
│   └── pdf-generator.ts # Generador de PDFs
├── hooks/              # Custom hooks
│   └── use-mobile.tsx  # Hook para detección móvil
├── lib/               # Librerías y configuraciones
│   └── utils.ts      # Utilidades generales
├── package.json      # Dependencias del proyecto
├── tailwind.config.ts # Configuración de Tailwind
├── tsconfig.json     # Configuración de TypeScript
└── README.md         # Este archivo
```

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <url-del-repositorio>
cd sales-quotation-manager
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
# o
yarn install
\`\`\`

3. **Configurar el entorno**
\`\`\`bash
# Los archivos JSON ya están incluidos en /data
# No se requiere configuración adicional
\`\`\`

4. **Ejecutar en modo desarrollo**
\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

5. **Abrir en el navegador**
\`\`\`
http://localhost:3000
\`\`\`

## 📖 Uso de la Aplicación

### 1. Gestión de Clientes

#### Agregar Nuevo Cliente
1. Navegar a **Clientes** → **Nuevo Cliente**
2. Completar el formulario con:
   - Nombre (obligatorio)
   - Teléfono (obligatorio)
   - Email (opcional)
   - Dirección (opcional)
3. Hacer clic en **Guardar Cliente**

#### Gestionar Clientes Existentes
- **Ver Lista**: Ir a la sección **Clientes**
- **Buscar**: Usar la barra de búsqueda por nombre, teléfono o email
- **Editar**: Hacer clic en el ícono de edición
- **Eliminar**: Hacer clic en el ícono de papelera (con confirmación)

### 2. Crear Cotizaciones

#### Proceso Paso a Paso
1. **Ir a Inicio** para crear nueva cotización
2. **Seleccionar Cliente**:
   - Buscar cliente existente
   - O crear nuevo cliente si es necesario
3. **Agregar Descripción** del trabajo a realizar
4. **Seleccionar Estado** inicial (generalmente "Pendiente")
5. **Calcular Precio**:
   - Ingresar precio de la piel
   - Especificar dimensiones (alto x largo)
   - Seleccionar porcentaje adicional
6. **Agregar Insumos** (pestaña Insumos):
   - Buscar insumos necesarios
   - Agregar cantidades requeridas
   - El sistema calcula automáticamente el total
7. **Guardar Cotización**

#### Fórmulas de Cálculo
- **Precio Unitario** = precio\_piel × 1 ÷ 100
- **Precio Residuo** = alto × largo ÷ 100  
- **Total Residuo** = precio\_residuo + (precio\_residuo × porcentaje\_adicional ÷ 100)
- **Total Final** = (precio\_unitario × total\_residuo) + valor\_insumos

### 3. Gestión de Cotizaciones

#### Ver y Administrar Cotizaciones
1. **Ir a Cotizaciones** para ver la lista completa
2. **Filtrar** por estado o buscar por cliente/descripción
3. **Cambiar Estado**: Usar el dropdown en cada cotización
4. **Generar PDF**: Hacer clic en el ícono de documento
5. **Descargar**: Usar el ícono de descarga
6. **Eliminar**: Ícono de papelera (con confirmación)

#### Estados de Cotización
- **Pendiente**: Cotización creada, esperando respuesta
- **Aprobada**: Cliente aprobó la cotización
- **En proceso**: Trabajo en desarrollo
- **Completada**: Trabajo terminado y entregado
- **Rechazada**: Cliente rechazó la cotización
- **Cancelada**: Cotización cancelada por cualquier motivo

### 4. Dashboard y Reportes

#### Acceder al Dashboard
1. **Ir a Cotizaciones** → **Dashboard**
2. El dashboard muestra métricas en tiempo real

#### Métricas Disponibles
- **Total de Ventas**: Suma de cotizaciones completadas/aprobadas
- **Total de Cotizaciones**: Cantidad total de cotizaciones
- **Tasa de Conversión**: Porcentaje de cotizaciones exitosas
- **Clientes Activos**: Número de clientes únicos

#### Filtros y Reportes
- **Filtrar por Período**: Últimos 7, 30, 90 días o año completo
- **Rango de Fechas**: Seleccionar fechas específicas
- **Exportar Reporte**: Descargar datos en formato JSON
- **Top Clientes**: Ver los 5 mejores clientes del período

### 5. Inventario de Insumos

#### Ver Inventario
1. **Ir a Insumos** para ver el catálogo completo
2. **Información Disponible**:
   - Nombre del insumo
   - Precio por volumen
   - Cantidad disponible
   - Precio unitario
   - Descripción

#### Insumos Incluidos
- Cuero vacuno
- Hilo encerado  
- Remaches metálicos
- Tinte para cuero
- Hebillas de metal
- Pegamento especial
- Cera de acabado
- Agujas para cuero

## 🎨 Personalización

### Cambiar Tema
- Usar el botón de sol/luna en la barra de navegación
- El tema se guarda automáticamente

### Modificar Insumos
- Editar el archivo \`data/insumos.json\`
- Agregar nuevos insumos con la estructura:
\`\`\`json
{
  "id": "9",
  "nombre": "Nuevo Insumo",
  "precio_volumen": 1000,
  "cantidad_volumen": 100,
  "precio_unidad": 10,
  "descripcion": "Descripción del insumo"
}
\`\`\`

### Información de la Empresa
- Modificar \`utils/pdf-generator.ts\`
- Cambiar los datos en \`companyInfo\`:
\`\`\`typescript
const companyInfo = {
  name: "Tu Empresa S.A.",
  address: "Tu Dirección",
  phone: "Tu Teléfono",
  email: "tu@email.com",
  website: "www.tuempresa.com",
  taxId: "Tu RFC/NIT"
}
\`\`\`

## 🔧 Scripts Disponibles

\`\`\`bash
npm run dev      # Ejecutar en modo desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar versión de producción
npm run lint     # Verificar código con ESLint
\`\`\`

## 📦 Dependencias Principales

\`\`\`json
{
  "next": "14.0.0",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0",
  "lucide-react": "^0.292.0",
  "next-themes": "^0.2.1"
}
\`\`\`

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno si es necesario
3. Desplegar automáticamente

### Otros Proveedores
- **Netlify**: Compatible con Next.js
- **Railway**: Soporte completo para Next.js
- **Heroku**: Requiere configuración adicional

## 🔄 Migración a Base de Datos

Para migrar de archivos JSON a una base de datos real:

1. **Elegir Base de Datos**: PostgreSQL, MySQL, MongoDB
2. **ORM**: Prisma, Drizzle, o Mongoose
3. **Modificar API Routes**: Cambiar lectura/escritura de archivos por consultas DB
4. **Variables de Entorno**: Configurar conexión a BD

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para nueva funcionalidad (\`git checkout -b feature/nueva-funcionalidad\`)
3. Commit de cambios (\`git commit -m 'Agregar nueva funcionalidad'\`)
4. Push a la rama (\`git push origin feature/nueva-funcionalidad\`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo \`LICENSE\` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Autenticación de usuarios
- [ ] Notificaciones por email
- [ ] Integración con sistemas de pago
- [ ] App móvil
- [ ] Reportes avanzados con gráficos
- [ ] Integración con contabilidad
- [ ] Sistema de inventario avanzado
- [ ] Múltiples empresas/sucursales

---

**Rueda Leather Wallet's** - Desarrollado con ❤️ para optimizar la gestión de ventas y cotizaciones.

