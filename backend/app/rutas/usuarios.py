
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.orm import Session
import bcrypt

from app.conexion import obtener_db
from app.modelos import Negocio, Usuario


router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


class DatosEmpleado(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    apellido: str = Field(min_length=2, max_length=100)
    correo: str
    contrasena: str = Field(min_length=6)


def obtener_negocio_activo(codigo_negocio: str, db: Session):
    codigo = codigo_negocio.strip().upper()

    negocio = db.scalar(
        select(Negocio).where(
            Negocio.codigo == codigo,
            Negocio.estado == "activo"
        )
    )

    if not negocio:
        raise HTTPException(
            status_code=404,
            detail="El negocio no existe o está inactivo."
        )

    return negocio


def obtener_dueno(
    codigo_negocio: str,
    id_usuario: int,
    db: Session
):
    negocio = obtener_negocio_activo(codigo_negocio, db)

    usuario = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_usuario,
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.rol == "dueno",
            Usuario.estado == "activo"
        )
    )

    if not usuario:
        raise HTTPException(
            status_code=403,
            detail="Solo el dueño del negocio puede realizar esta acción."
        )

    return negocio, usuario


def convertir_usuario(usuario: Usuario):
    return {
        "id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "rol": usuario.rol,
        "esAdministrador": usuario.es_administrador
    }


def generar_id_usuario(db: Session):
    resultado = db.execute(
        text("""
            UPDATE secuencias
            SET ultimo_id = LAST_INSERT_ID(ultimo_id + 1)
            WHERE nombre = 'usuarios'
        """)
    )

    if resultado.rowcount != 1:
        raise RuntimeError(
            "No se encontró la secuencia de usuarios."
        )

    return db.execute(
        text("SELECT LAST_INSERT_ID()")
    ).scalar_one()


@router.get("/")
def listar_usuarios(
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio_activo(codigo_negocio, db)

    actor = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_usuario,
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.estado == "activo"
        )
    )

    if not actor:
        raise HTTPException(
            status_code=403,
            detail="No tienes autorización para consultar estos usuarios."
        )

    usuarios = db.scalars(
        select(Usuario).where(
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.estado == "activo"
        ).order_by(Usuario.nombre)
    ).all()

    empleados = [
        convertir_usuario(usuario)
        for usuario in usuarios
        if usuario.rol == "empleado"
    ]

    return {
        "usuarios": [
            convertir_usuario(usuario)
            for usuario in usuarios
        ],
        "empleados": empleados
    }


@router.post("/empleados")
def registrar_empleado(
    datos: DatosEmpleado,
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    try:
        negocio, _ = obtener_dueno(
            codigo_negocio,
            id_usuario,
            db
        )

        correo = datos.correo.strip().lower()

        existente = db.scalar(
            select(Usuario).where(Usuario.correo == correo)
        )

        if existente:
            raise HTTPException(
                status_code=409,
                detail="Ya existe un usuario registrado con ese correo."
            )

        contrasena_hash = bcrypt.hashpw(
            datos.contrasena.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        empleado = Usuario(
            id_usuario=generar_id_usuario(db),
            id_negocio=negocio.id_negocio,
            nombre=datos.nombre.strip(),
            apellido=datos.apellido.strip(),
            correo=correo,
            password_hash=contrasena_hash,
            rol="empleado",
            es_administrador=False,
            estado="activo"
        )

        db.add(empleado)
        db.commit()
        db.refresh(empleado)

        return {
            "mensaje": "Empleado registrado correctamente.",
            "empleado": convertir_usuario(empleado)
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Ocurrió un error al registrar el empleado."
        )


@router.put("/empleados/{id_empleado}/administrador")
def designar_administrador(
    id_empleado: int,
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    negocio, _ = obtener_dueno(
        codigo_negocio,
        id_usuario,
        db
    )

    empleado = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_empleado,
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.rol == "empleado",
            Usuario.estado == "activo"
        )
    )

    if not empleado:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el empleado."
        )

    empleados = db.scalars(
        select(Usuario).where(
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.rol == "empleado",
            Usuario.estado == "activo"
        )
    ).all()

    for usuario in empleados:
        usuario.es_administrador = (
            usuario.id_usuario == empleado.id_usuario
        )

    db.commit()

    return {
        "mensaje": "El empleado fue designado administrador.",
        "empleado": convertir_usuario(empleado)
    }


@router.delete("/empleados/{id_empleado}/administrador")
def revocar_administrador(
    id_empleado: int,
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    negocio, _ = obtener_dueno(
        codigo_negocio,
        id_usuario,
        db
    )

    empleado = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_empleado,
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.rol == "empleado",
            Usuario.estado == "activo"
        )
    )

    if not empleado:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el empleado."
        )

    empleado.es_administrador = False
    db.commit()

    return {
        "mensaje": "Se quitaron los permisos de administrador."
    }


@router.delete("/empleados/{id_empleado}")
def eliminar_empleado(
    id_empleado: int,
    codigo_negocio: str,
    id_usuario: int,
    db: Session = Depends(obtener_db)
):
    negocio, _ = obtener_dueno(
        codigo_negocio,
        id_usuario,
        db
    )

    empleado = db.scalar(
        select(Usuario).where(
            Usuario.id_usuario == id_empleado,
            Usuario.id_negocio == negocio.id_negocio,
            Usuario.rol == "empleado",
            Usuario.estado == "activo"
        )
    )

    if not empleado:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el empleado."
        )

    empleado.estado = "inactivo"
    empleado.es_administrador = False

    db.commit()

    return {
        "mensaje": "El empleado fue desactivado correctamente."
    }
