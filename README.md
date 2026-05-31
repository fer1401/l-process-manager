# ⚙️ OS Process Scheduling Simulator - Entorno y Compilación

## 🛠️ 1. Requisitos Previos y Herramientas del Sistema

Dado que el proyecto utiliza React, TypeScript, Vite y **pnpm** como gestor de paquetes, es obligatorio instalar lo siguiente dependiendo de tu sistema operativo:

### Opción A: Instalación en Windows Subsystem for Linux (WSL) - Recomendado
Si utilizas WSL (como Ubuntu en Windows), sigue estos pasos desde tu terminal de Linux:

1. **Actualiza los paquetes de tu distribución:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instala NVM (Node Version Manager) y Node.js:**
   Para compilar Vite y React, necesitas Node.js.
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # Reinicia la terminal o carga nvm para que el comando funcione: 
   source ~/.bashrc
   # Instala la última versión estable (LTS) de Node:
   nvm install --lts 
   ```

3. **Instala pnpm (El gestor de dependencias del proyecto):**
   ```bash
   npm install -g pnpm
   ```

4. **Instala Git (Si no lo tienes previamente):**
   ```bash
   sudo apt install git
   ```

### Opción B: Instalación en Windows Nativo
1. **Node.js:** Descarga e instala la versión LTS desde [nodejs.org](https://nodejs.org/). Asegúrate de marcar la casilla para instalar herramientas adicionales (como Chocolatey) si el instalador lo pregunta.
2. **Git para Windows:** Descárgalo desde [git-scm.com](https://git-scm.com/).
3. **pnpm:** Abre tu terminal de Windows (PowerShell o Símbolo del Sistema como administrador) y ejecuta:
   ```cmd
   npm install -g pnpm
   ```

---

## 🚀 Clonación, Instalación y Compilación del Proyecto

Una vez tengas tu entorno (WSL o Windows) listo con Node.js y `pnpm`, sigue estos pasos secuenciales para ejecutar el simulador:

### Paso 1: Clonar el repositorio
Abre tu terminal en la carpeta donde deseas guardar el proyecto y descarga el código fuente:
```bash
git clone https://github.com/TU_USUARIO/l-process-manager.git
cd l-process-manager
```

### Paso 2: Instalar las dependencias
El proyecto utiliza librerías modernas como React, Tailwind y shadcn/ui. Ejecuta **estrictamente** el siguiente comando (evita usar `npm install` para respetar el archivo `pnpm-lock.yaml`):
```bash
pnpm install
```

### Paso 3: Iniciar el Servidor de Desarrollo Local
Para correr el simulador en vivo con Hot-Reload (los cambios guardados en el código se reflejan instantáneamente sin refrescar):
```bash
pnpm dev
```
> La terminal te devolverá una URL local, generalmente `http://localhost:5173`. Haz Ctrl+Click (o Cmd+Click) en dicha URL para abrir el simulador en tu navegador web.

### Paso 4: Compilación para Producción (Build)
Si deseas preparar el código fuente para subirlo a producción (hosting estático como Vercel, Netlify o GitHub Pages) y generar la versión final minificada, ejecuta:
```bash
pnpm build
```
Este comando ejecutará primero la verificación de tipado estricto de TypeScript (`tsc`) y, si no hay errores, utilizará Vite para empaquetar, comprimir y optimizar el código, depositándolo listo para despliegue en la carpeta `/dist`.

Para previsualizar localmente cómo quedó el código empaquetado para producción, puedes usar:
```bash
pnpm preview
```