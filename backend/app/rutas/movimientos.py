
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.conexion import obtener_db
from app.modelos import Movimiento, Producto, Usuario, Negocio


router = APIRouter(prefix="/api/movimientos", tags=["Movimientos"])
logger = logging.getLogger(__name__)


class DatosMovimiento(BaseModel):
    id_producto: int
    tipo: str
    cantidad: int = Field(gt=0)
    observacion: Optional[str] = None


def obtener_contexto(codigo_negocio, id_usuario, db):
    negocio = db.scalar(
        select(Negocio).where(
            Negocio.codigo == codigo_negocio.strip().upper()
        )
    )

    if negocio is None or negocio.estado != "activo":
        raise HTTPException(404, detail="El negocio no existe o está inactivo.")

    usuario = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_usuario,
            Usuario.id_negocio == negocio.id_negocio
        )
    )

    if usuario is None or usuario.estado != "activo":
        raise HTTPException(
            403,
            detail="El usuario no pertenece a este negocio o está inactivo."
        )

    return negocio, usuario


def convertir_movimiento(movimiento, producto, usuario):
    return {
        "id": movimiento.id_movimiento,
        "tipo": movimiento.tipo,
        "producto": producto.nombre,
        "id_producto": producto.id_producto,
        "cantidad": movimiento.cantidad,
        "fecha": (
            movimiento.fecha.strftime("%Y-%m-%d %H:%M:%S")
            if movimiento.fecha else ""
        ),
        "usuario": f"{usuario.nombre} {usuario.apellido}".strip(),
        "observacion": movimiento.observacion or ""
    }


@router.get("/")
def listar_movimientos(
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    negocio, usuario = obtener_contexto(codigo_negocio, id_usuario, db)

    registros = db.execute(
        select(Movimiento, Producto, Usuario)
        .join(Producto, Movimiento.id_producto == Producto.id_producto)
        .join(Usuario, Movimiento.id_usuario == Usuario.id_usuario)
        .where(Movimiento.id_negocio == negocio.id_negocio)
        .order_by(Movimiento.fecha.desc())
    ).all()

    return {
        "movimientos": [
            convertir_movimiento(m, p, u)
            for m, p, u in registros
        ]
    }


@router.post("/")
def registrar_movimiento(
    datos: DatosMovimiento,
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    try:
        negocio, usuario = obtener_contexto(
            codigo_negocio, id_usuario, db
        )

        if usuario.rol == "dueno":
            puede_administrar = True
        elif usuario.rol == "empleado":
            puede_administrar = bool(usuario.es_administrador)
        else:
            puede_administrar = False

        if not puede_administrar:
            raise HTTPException(
                403,
                detail="No tienes permisos para registrar movimientos."
            )

        tipo = datos.tipo.strip().lower()

        if tipo not in ["entrada", "salida"]:
            raise HTTPException(
                400,
                detail="El tipo debe ser Entrada o Salida."
            )

        producto = db.scalar(
            select(Producto)
            .where(
                Producto.id_producto == datos.id_producto,
                Producto.id_negocio == negocio.id_negocio,
                Producto.estado == "activo"
            )
            .with_for_update()
        )

        if producto is None:
            raise HTTPException(
                404,
                detail="El producto no existe o está inactivo."
            )

        if tipo == "salida":
            if datos.cantidad > producto.cantidad:
                raise HTTPException(
                    400,
                    detail=(
                        "No hay suficiente inventario. "
                        f"Existencias actuales: {producto.cantidad}."
                    )
                )
            producto.cantidad -= datos.cantidad
        else:
            producto.cantidad += datos.cantidad

        ultimo_id = db.scalar(
            select(func.max(Movimiento.id_movimiento))
        ) or 0

        nuevo_movimiento = Movimiento(
            id_movimiento=ultimo_id + 1,
            id_negocio=negocio.id_negocio,
            id_producto=producto.id_producto,
            id_usuario=usuario.id_usuario,
            tipo=tipo,
            cantidad=datos.cantidad,
            observacion=datos.observacion
        )

        db.add(nuevo_movimiento)
        db.flush()
        db.refresh(nuevo_movimiento)

        respuesta = convertir_movimiento(
            nuevo_movimiento, producto, usuario
        )

        db.commit()

        return {
            "mensaje": f"{tipo.capitalize()} registrada correctamente.",
            "movimiento": respuesta,
            "producto": {
                "id": producto.id_producto,
                "cantidad": producto.cantidad
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        logger.exception("ERROR REAL AL REGISTRAR EL MOVIMIENTO")
        raise HTTPException(
            500,
            detail="Ocurrió un error al guardar el movimiento."
        )
