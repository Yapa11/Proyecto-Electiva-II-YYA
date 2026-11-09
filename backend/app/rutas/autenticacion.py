
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
import bcrypt

from app.conexion import obtener_db
from app.modelos import Usuario, Negocio

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

password_hash = PasswordHash.recommended()


class DatosLogin(BaseModel):
    correo: str
    contrasena: str


def verificar_contrasena(contrasena: str, hash_guardado: str) -> bool:
    try:
        return password_hash.verify(contrasena, hash_guardado)
    except UnknownHashError:
        # Compatibilidad con usuarios registrados anteriormente con bcrypt.
        try:
            return bcrypt.checkpw(
                contrasena.encode("utf-8"),
                hash_guardado.encode("utf-8")
            )
        except (ValueError, TypeError):
            return False


@router.post("/login")
def iniciar_sesion(
    datos: DatosLogin,
    db: Session = Depends(obtener_db)
):
    correo = datos.correo.strip().lower()

    usuario = db.scalar(
        select(Usuario).where(Usuario.correo == correo)
    )

    if usuario is None or usuario.estado != "activo":
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos."
        )

    if not verificar_contrasena(
        datos.contrasena,
        usuario.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos."
        )

    negocio = None

    if usuario.id_negocio is not None:
        negocio = db.scalar(
            select(Negocio).where(
                Negocio.id_negocio == usuario.id_negocio
            )
        )

    return {
        "mensaje": "Inicio de sesión exitoso.",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "id_negocio": usuario.id_negocio,
            "codigo_negocio": negocio.codigo if negocio else None,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": usuario.rol,
            "es_administrador": bool(usuario.es_administrador),
            "negocio": negocio.nombre if negocio else None
        }
    }
