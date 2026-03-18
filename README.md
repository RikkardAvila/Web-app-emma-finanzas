# 🚀 Emma Finanzas - Hoja de Ruta (Supabase + Vercel)

Emma Finanzas es una aplicación web centrada en la gestión financiera personal y de negocios con un diseño premium y moderno. Esta aplicación utiliza **Supabase** para el backend y se despliega en **Vercel**.

---

## 📅 Estructura de Finalización

He ajustado el trabajo restante para integrar **Supabase** como núcleo de datos y **Vercel** como plataforma de despliegue:

### 🛠️ Fase 1: Integración con Supabase (Prioridad Máxima)
Sustituiremos la lógica estática por una base de datos en tiempo real.
- [ ] **Configuración de Proyecto:** Crear el proyecto en Supabase, definir tablas (`transacciones`, `inventario`, `ventas`) y políticas de seguridad (RLS).
- [ ] **Autenticación:** Implementar el login de Supabase para proteger los datos financieros.
- [ ] **Conexión de Datos:** Configurar la SDK de Supabase en `app.js` para leer/escribir datos directamente en la nube.
- [ ] **Dashboard en Tiempo Real:** Vincular los contadores de saldo e ingresos a consultas de Supabase.

### 📊 Fase 2: Visualización y Reportes
- [ ] **Gráficas Interactivas:** Integrar `Chart.js` alimentado por los datos de Supabase para ver la evolución mensual.
- [ ] **Buscador Global:** Implementar búsqueda mediante filtros de base de datos directamente desde la barra superior.
- [ ] **Exportación de Datos:** Botón para descargar reportes basados en los registros de la base de datos.

### 💼 Fase 3: Módulos de Negocio Avanzados
- [ ] **Facturación Automática:** Generar PDFs dinámicos usando los datos de clientes y ventas de Supabase.
- [ ] **Alertas de Inventario:** Lógica para detectar stock bajo y mostrarlo en la sección de "Alertas".
- [ ] **Impuestos:** Configuración en la base de datos para aplicar tasas automáticamente.

### ⚙️ Fase 4: Personalización y Perfil
- [ ] **User Profile:** Sincronizar el perfil (`KG`) con los metadatos del usuario en Supabase Auth.
- [ ] **Ajustes de Cuenta:** Guardar preferencias de moneda y formato en una tabla de `configuracion`.

### 📱 Fase 5: PWA y Mobile
- [ ] **Offline Support:** Usar Service Workers para que la app cargue instantáneamente.
- [ ] **Instalación:** Configurar el `manifest.json` para que sea instalable como App nativa.

### 🚀 Fase 6: Despliegue en Vercel
- [ ] **Configuración de CI/CD:** Conectar el repositorio de GitHub a Vercel para despliegues automáticos.
- [ ] **Variables de Entorno:** Configurar las llaves de Supabase de forma segura en el panel de Vercel.

---

## 🛠️ Stack Tecnológico
- **Frontend:** HTML5, CSS3 Moderno, JavaScript ES6+.
- **Backend/DB:** Supabase (PostgreSQL + Auth).
- **Hosting:** Vercel.
- **Diseño:** Glassmorphism & Outfit Font.

---

## ✅ Estado Actual
- [x] Diseño visual premium terminado.
- [x] Estructura de navegación funcional.
- [x] Hoja de ruta definida (Supabase + Vercel).

---
*Finanzas impecables, tecnología robusta.*
