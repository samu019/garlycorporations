# GarlyCorporations - Plataforma de Gestion de Suscriptores Premium

Plataforma web para la gestion de suscriptores premium de cinematografia con sistema de alertas y gestion de contratos.

## ?? Caracteristicas

- ? Gestion completa de suscriptores premium
- ? Multiples metodos de pago (PayPal, Binance, Bizum, etc.)
- ? Sistema de alertas de vencimiento
- ? Upload y gestion de contratos
- ? Panel administrativo para 10 usuarios
- ? Diseno responsive y animado
- ? Soporte tecnico integrado

## ??? Tecnologias

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- React Hook Form
- Vite

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (upload de archivos)

## ?? Instalacion

### Prerrequisitos
- Node.js 16+
- MongoDB
- Git

### Desarrollo
1. Clonar repositorio
\`\`\`bash
git clone <repository-url>
cd garlycorporations-web
\`\`\`

2. Configurar Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
\`\`\`

3. Configurar Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## ?? Despliegue en Render

1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Deploy automatico

## ?? Estructura del Proyecto

\`\`\`
garlycorporations-web/
+-- frontend/          # Aplicacion React
+-- backend/           # API Node.js
+-- database/          # Esquemas y migraciones
+-- deploy/           # Configuracion de despliegue
L-- docs/             # Documentacion
\`\`\`

## ?? Roles de Administrador

- **Superadmin**: Acceso completo
- **Admin**: Gestion de suscriptores
- **Viewer**: Solo lectura

## ?? Soporte

Para soporte tecnico, contactar al equipo de desarrollo.

---
**GarlyCorporations** © 2025 - Plataforma de Cinematografia Premium
