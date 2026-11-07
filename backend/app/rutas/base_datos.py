
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.conexion import obtener_db

router = APIRouter(
    prefix="/api/bd",
    tags=["Base de datos"]
)


@router.get("/estado")
def comprobar_conexion(db: Session = Depends(obtener_db)):
    """
    Comprueba que FastAPI pueda conectarse
    correctamente con MySQL/MariaDB.
    """
    try:
        resultado = db.execute(
            text("SELECT DATABASE() AS base, VERSION() AS version")
        ).mappings().first()

        return {
            "estado": "conectado",
            "mensaje": "Conexión con la base de datos exitosa.",
            "base_datos": resultado["base"],
            "version_servidor": resultado["version"]
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="No fue posible conectar con la base de datos."
        )
