# Gestión y Reserva de Fútbol 5

Sistema completo para la gestión y reserva de canchas de fútbol 5.

**Segundo Trabajo Práctico - Ingeniería de Software I**  
Facultad de Ingeniería - Universidad de Buenos Aires

## Miembros del equipo

- Andrea Figueroa - 110450
- Joaquin Chamo - 110748
- Leticia Figueroa - 110510
- Federico Honda - 110766
- Candela Piccin - 109760
- Santiago Varga - 110561
- Siyu Zheng - 111273
- Juan Wienberg - 110753

## Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Variables de entorno configuradas (archivo `.env`)

### 1. Construir Imágenes

```bash
docker compose build
```

**¿Cuándo usar?**
- Primera ejecución del proyecto
- Después de cambios en el código
- Para actualizar dependencias

### 2. Levantar Servicios

```bash
docker compose up
```

**Servicios que se levantan:**
- **Base de Datos PostgreSQL** (`db`) - Puerto: `30005:5432`
- **Backend Spring Boot** (`backend`) - Puerto: `30002:8080`
- **Frontend React** (`frontend`) - Puerto: `30003:80`
- **Adminer** (`adminer`) - Puerto: `30004:8080`

### 3. Acceso a Servicios

- **Frontend**: `http://localhost:30003`
- **Backend API**: `http://localhost:30002`
- **Documentación API**: `http://localhost:30002/swagger-ui.html`
- **Adminer**: `http://localhost:30004`

### 4. Comandos Útiles

```bash
# Levantar en segundo plano
docker compose up -d

# Ver logs
docker compose logs

# Detener servicios
docker compose down

# Reconstruir y levantar
docker compose up --build

# Solo base de datos
docker compose up db

# Backend y base de datos
docker compose up db backend
```

### 5. Variables de Entorno

El archivo `.env` en la raíz del proyecto contiene:

```bash
VOLUME_DIR=.

DB_NAME=tasks
DB_USERNAME=pguser
DB_PASSWORD=123456

BACKEND_EXTERNAL_PORT=30002
FRONTEND_EXTERNAL_PORT=30003
ADMINER_EXTERNAL_PORT=30004
DB_EXTERNAL_PORT=30005

BACKEND_EXTERNAL_URL=http://localhost:30002
```

### 6. Troubleshooting

**Servicios no se conectan**: Verifica variables de entorno en `.env`
**Base de datos no persiste**: Verifica configuración de `VOLUME_DIR`
**Frontend no conecta al backend**: Verifica `BACKEND_EXTERNAL_URL`
**Error de permisos**: Verifica permisos del directorio de volúmenes
