
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.rutas.productos import router as productos_router
from app.rutas.base_datos import router as base_datos_router
from app.rutas.autenticacion import router as autenticacion_router
from app.rutas.movimientos import router as movimientos_router
from app.rutas import usuarios

app = FastAPI(
    title="API del Sistema de Gestión de Inventario",
    description="API para gestionar el inventario, productos y movimientos.",
    version="1.0.0"
)

# Direcciones permitidas para el frontend
allow_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

# Dirección del frontend desplegado (se configurará en Render)
frontend_url = os.getenv("FRONTEND_URL", "").strip()

if frontend_url:
    allow_origins.extend(
        origin.strip()
        for origin in frontend_url.split(",")
        if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Rutas de la API
app.include_router(productos_router)
app.include_router(base_datos_router)
app.include_router(autenticacion_router)
app.include_router(movimientos_router)
app.include_router(usuarios.router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API del Sistema de Gestión de Inventario funcionando."
    }


@app.get("/api/estado")
def estado():
    return {
        "estado": "activo",
        "mensaje": "El backend está funcionando correctamente."
    }
