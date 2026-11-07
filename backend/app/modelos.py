
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    ForeignKeyConstraint,
    UniqueConstraint,
    CheckConstraint,
    text
)

from app.conexion import Base


# ==================================================
# MODELO: NEGOCIOS
# ==================================================

class Negocio(Base):
    __tablename__ = "negocios"

    id_negocio = Column(Integer, primary_key=True, autoincrement=True)
    codigo = Column(String(20), nullable=False, unique=True)
    nombre = Column(String(120), nullable=False)
    estado = Column(
        String(10),
        nullable=False,
        server_default=text("'activo'")
    )
    fecha_creacion = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )


# ==================================================
# MODELO: USUARIOS
# ==================================================

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    id_negocio = Column(
        Integer,
        ForeignKey("negocios.id_negocio"),
        nullable=True
    )
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100))
    correo = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)
    es_administrador = Column(Boolean, default=False)
    estado = Column(
        String(10),
        nullable=False,
        server_default=text("'activo'")
    )
    fecha_creacion = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )

    __table_args__ = (
        UniqueConstraint(
            "id_usuario",
            "id_negocio",
            name="uq_usuario_negocio"
        ),
    )


# ==================================================
# MODELO: CATEGORÍAS
# ==================================================

class Categoria(Base):
    __tablename__ = "categorias"

    id_categoria = Column(Integer, primary_key=True, autoincrement=True)
    id_negocio = Column(
        Integer,
        ForeignKey("negocios.id_negocio"),
        nullable=False
    )
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)

    __table_args__ = (
        UniqueConstraint(
            "id_categoria",
            "id_negocio",
            name="uq_categoria_negocio"
        ),
        UniqueConstraint(
            "id_negocio",
            "nombre",
            name="uq_nombre_categoria"
        ),
    )


# ==================================================
# MODELO: PRODUCTOS
# ==================================================

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, autoincrement=True)
    id_negocio = Column(Integer, nullable=False)
    id_categoria = Column(Integer, nullable=True)
    codigo = Column(String(50))
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precio = Column(Numeric(12, 2), nullable=False, default=0)
    cantidad = Column(Integer, nullable=False, default=0)
    stock_minimo = Column(Integer, nullable=False, default=0)
    estado = Column(
        String(10),
        nullable=False,
        server_default=text("'activo'")
    )
    fecha_creacion = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )

    __table_args__ = (
        UniqueConstraint(
            "id_producto",
            "id_negocio",
            name="uq_producto_negocio"
        ),
        UniqueConstraint(
            "id_negocio",
            "codigo",
            name="uq_codigo_producto"
        ),
        ForeignKeyConstraint(
            ["id_negocio"],
            ["negocios.id_negocio"],
            name="fk_producto_negocio"
        ),
        ForeignKeyConstraint(
            ["id_categoria", "id_negocio"],
            ["categorias.id_categoria", "categorias.id_negocio"],
            name="fk_producto_categoria"
        ),
        CheckConstraint("precio >= 0", name="chk_precio"),
        CheckConstraint("cantidad >= 0", name="chk_cantidad"),
        CheckConstraint("stock_minimo >= 0", name="chk_stock_minimo"),
    )


# ==================================================
# MODELO: MOVIMIENTOS
# ==================================================

class Movimiento(Base):
    __tablename__ = "movimientos"

    id_movimiento = Column(Integer, primary_key=True, autoincrement=True)
    id_negocio = Column(Integer, nullable=False)
    id_producto = Column(Integer, nullable=False)
    id_usuario = Column(Integer, nullable=False)
    tipo = Column(String(10), nullable=False)
    cantidad = Column(Integer, nullable=False)
    observacion = Column(Text)
    fecha = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP")
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["id_negocio"],
            ["negocios.id_negocio"],
            name="fk_movimiento_negocio"
        ),
        ForeignKeyConstraint(
            ["id_producto", "id_negocio"],
            ["productos.id_producto", "productos.id_negocio"],
            name="fk_movimiento_producto"
        ),
        ForeignKeyConstraint(
            ["id_usuario", "id_negocio"],
            ["usuarios.id_usuario", "usuarios.id_negocio"],
            name="fk_movimiento_usuario"
        ),
        CheckConstraint(
            "cantidad > 0",
            name="chk_cantidad_movimiento"
        ),
    )
