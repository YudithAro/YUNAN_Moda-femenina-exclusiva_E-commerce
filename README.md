# YUNAN - Moda Femenina Exclusiva

Este es el repositorio principal del e-commerce para YUNAN, una tienda dedicada a la moda femenina exclusiva. El proyecto está dividido en dos partes principales: un backend que maneja toda la lógica del negocio y conexión a base de datos, y un frontend enfocado en una experiencia de usuario premium, fluida y moderna.

## Arquitectura y Tecnologías

He estructurado el proyecto separando el cliente del servidor para que escale mejor y sea más fácil de mantener. Aquí está el stack que decidí usar:

### Frontend
- **Next.js (App Router)**: Framework principal para React. Lo uso por el SSR (Server-Side Rendering) y para tener un routing ordenado.
- **Tailwind CSS**: Para los estilos. Toda la interfaz (que tiene un diseño oscuro con toques dorados y rosados) está construida usando clases utilitarias para mantener el CSS bajo control.
- **Framer Motion**: Lo implementé para las micro-interacciones y animaciones suaves (como los fade-ins de los productos y la barra de navegación).
- **Shadcn/ui & Lucide React**: Base para algunos componentes UI reutilizables y la iconografía.

### Backend
- **NestJS**: Framework de Node.js con TypeScript. Me ayuda a mantener la arquitectura limpia (controladores, servicios, módulos).
- **PostgreSQL (Supabase)**: La base de datos relacional está hosteada en Supabase.
- **Node-postgres (`pg`)**: Para las consultas a la base de datos utilizo directamente el driver nativo `pg`, lo que me da control total sobre las queries en SQL puro (dejamos de lado ORMs pesados para ganar rendimiento y control en producción).

## Estructura del Repositorio

- `/frontend`: Contiene toda la aplicación web. Corre en el puerto `4000`.
- `/backend`: Contiene el servidor de la API REST. Corre en el puerto `3000`.

## Cómo levantar el proyecto en local

Si necesitas correr el proyecto en tu máquina para hacer pruebas o desarrollar, sigue estos pasos:

### 1. Variables de entorno
Tanto en la carpeta `backend` como en `frontend`, necesitas configurar tu archivo `.env`.
Asegúrate de tener el `DATABASE_URL` apuntando a la base de datos correcta en el `.env` del backend.

### 2. Iniciar el Backend
Abre una terminal, entra a la carpeta del backend y corre:
```bash
cd backend
npm install
npm run start:dev
```
Esto levantará el servidor en `http://localhost:3000`.

### 3. Iniciar el Frontend
Abre otra terminal, entra a la carpeta del frontend y corre:
```bash
cd frontend
npm install
npm run dev -- -p 4000
```
La tienda estará disponible en `http://localhost:4000`.

---
*Nota: Si estás haciendo cambios en la base de datos de producción (Supabase), ten cuidado con los scripts de migración que están en la raíz del backend.*
