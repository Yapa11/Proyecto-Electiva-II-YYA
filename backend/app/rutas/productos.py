
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.conexion import obtener_db
from app.modelos import Producto, Categoria, Negocio

router = APIRouter(prefix="/api/productos", tags=["Productos"])


class DatosProducto(BaseModel):
    codigo: str | None = Field(default=None, max_length=50)
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = None
    categoria: str | None = None
    precio: float = Field(ge=0)
    cantidad: int = Field(ge=0)
    stock_minimo: int = Field(ge=0)


def generar_id_producto(db: Session):
    db.execute(
        text("""
            UPDATE secuencias
            SET ultimo_id = LAST_INSERT_ID(ultimo_id + 1)
            WHERE nombre = 'productos'
        """)
    )

    nuevo_id = db.execute(
        text("SELECT LAST_INSERT_ID()")
    ).scalar()

    if not nuevo_id:
        raise HTTPException(
            status_code=500,
            detail="No se pudo generar el identificador del producto. Verifica la secuencia productos en la base de datos."
        )

    return nuevo_id


def obtener_negocio(codigo_negocio: str, db: Session):
    negocio = db.scalar(
        select(Negocio).where(
            Negocio.codigo == codigo_negocio,
            Negocio.estado == "activo"
        )
    )

    if negocio is None:
        raise HTTPException(
            status_code=404,
            detail="El negocio no existe o está inactivo."
        )

    return negocio


def obtener_categoria(nombre, id_negocio, db):
    if not nombre:
        return None

    categoria = db.scalar(
        select(Categoria).where(
            Categoria.nombre == nombre,
            Categoria.id_negocio == id_negocio
        )
    )

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail=f'La categoría "{nombre}" no existe en este negocio.'
        )

    return categoria


def serializar_producto(producto, db):
    nombre_categoria = "Sin categoría"

    if producto.id_categoria is not None:
        categoria = db.get(Categoria, producto.id_categoria)

        if categoria:
            nombre_categoria = categoria.nombre

    return {
        "id": producto.id_producto,
        "codigo": producto.codigo,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion or "",
        "categoria": nombre_categoria,
        "precio": float(producto.precio),
        "cantidad": producto.cantidad,
        "minimo": producto.stock_minimo,
        "estado": producto.estado
    }


@router.get("/categorias")
def consultar_categorias(
    codigo_negocio: str,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio(codigo_negocio, db)

    categorias = db.scalars(
        select(Categoria)
        .where(Categoria.id_negocio == negocio.id_negocio)
        .order_by(Categoria.nombre)
    ).all()

    return [
        {
            "id": categoria.id_categoria,
            "nombre": categoria.nombre
        }
        for categoria in categorias
    ]


@router.get("/")
def consultar_productos(
    codigo_negocio: str,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio(codigo_negocio, db)

    productos = db.scalars(
        select(Producto)
        .where(
            Producto.id_negocio == negocio.id_negocio,
            Producto.estado == "activo"
        )
        .order_by(Producto.id_producto.desc())
    ).all()

    return {
        "negocio": negocio.nombre,
        "total": len(productos),
        "productos": [
            serializar_producto(producto, db)
            for producto in productos
        ]
    }


@router.post("/")
def crear_producto(
    datos: DatosProducto,
    codigo_negocio: str,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio(codigo_negocio, db)

    categoria = obtener_categoria(
        datos.categoria,
        negocio.id_negocio,
        db
    )

    try:
        nuevo_id = generar_id_producto(db)

        producto = Producto(
            id_producto=nuevo_id,
            id_negocio=negocio.id_negocio,
            id_categoria=categoria.id_categoria if categoria else None,
            codigo=datos.codigo.strip() if datos.codigo else None,
            nombre=datos.nombre.strip(),
            descripcion=datos.descripcion,
            precio=datos.precio,
            cantidad=datos.cantidad,
            stock_minimo=datos.stock_minimo,
            estado="activo"
        )

        db.add(producto)
        db.commit()
        db.refresh(producto)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Ya existe un producto con ese código en este negocio."
        )

    return serializar_producto(producto, db)


@router.put("/{id_producto}")
def actualizar_producto(
    id_producto: int,
    datos: DatosProducto,
    codigo_negocio: str,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio(codigo_negocio, db)

    producto = db.scalar(
        select(Producto).where(
            Producto.id_producto == id_producto,
            Producto.id_negocio == negocio.id_negocio,
            Producto.estado == "activo"
        )
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="El producto no existe en este negocio."
        )

    categoria = obtener_categoria(
        datos.categoria,
        negocio.id_negocio,
        db
    )

    producto.codigo = datos.codigo.strip() if datos.codigo else None
    producto.nombre = datos.nombre.strip()
    producto.descripcion = datos.descripcion
    producto.id_categoria = categoria.id_categoria if categoria else None
    producto.precio = datos.precio
    producto.cantidad = datos.cantidad
    producto.stock_minimo = datos.stock_minimo

    try:
        db.commit()
        db.refresh(producto)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Ya existe otro producto con ese código en este negocio."
        )

    return serializar_producto(producto, db)


@router.delete("/{id_producto}")
def eliminar_producto(
    id_producto: int,
    codigo_negocio: str,
    db: Session = Depends(obtener_db)
):
    negocio = obtener_negocio(codigo_negocio, db)

    producto = db.scalar(
        select(Producto).where(
            Producto.id_producto == id_producto,
            Producto.id_negocio == negocio.id_negocio,
            Producto.estado == "activo"
        )
    )

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="El producto no existe en este negocio."
        )

    producto.estado = "inactivo"
    db.commit()

    return {
        "mensaje": "Producto eliminado correctamente."
    }
