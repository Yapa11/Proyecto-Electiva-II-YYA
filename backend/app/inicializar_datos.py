
from sqlalchemy import select
from pwdlib import PasswordHash

from app.conexion import SessionLocal
from app.modelos import Negocio, Usuario


password_hash = PasswordHash.recommended()

# Contraseña inicial para las cuentas de demostración.
CONTRASENA_INICIAL = "123456"


def obtener_hash(contrasena):
    return password_hash.hash(contrasena)


def inicializar_datos():
    db = SessionLocal()

    try:
        # ==========================================
        # 1. REGISTRAR LOS NEGOCIOS
        # ==========================================

        negocios_iniciales = [
            {
                "codigo": "NEG001",
                "nombre": "TecnoQuibdó"
            },
            {
                "codigo": "NEG002",
                "nombre": "Comercial Chocó"
            }
        ]

        for negocio_data in negocios_iniciales:
            negocio = db.scalar(
                select(Negocio).where(
                    Negocio.codigo == negocio_data["codigo"]
                )
            )

            if negocio is None:
                db.add(Negocio(**negocio_data))

        db.flush()

        # Obtener los identificadores de los negocios.
        negocio_1 = db.scalar(
            select(Negocio).where(Negocio.codigo == "NEG001")
        )

        negocio_2 = db.scalar(
            select(Negocio).where(Negocio.codigo == "NEG002")
        )

        # ==========================================
        # 2. DEFINIR LOS USUARIOS INICIALES
        # ==========================================

        usuarios_iniciales = [
            {
                "id_negocio": None,
                "nombre": "Administrador",
                "apellido": "Global",
                "correo": "admin@sgi.com",
                "rol": "admin_global",
                "es_administrador": False
            },
            {
                "id_negocio": negocio_1.id_negocio,
                "nombre": "Dueño",
                "apellido": "TecnoQuibdó",
                "correo": "dueno@tecnoquibdo.com",
                "rol": "dueno",
                "es_administrador": True
            },
            {
                "id_negocio": negocio_1.id_negocio,
                "nombre": "Ana",
                "apellido": "Empleado",
                "correo": "ana@tecnoquibdo.com",
                "rol": "empleado",
                "es_administrador": False
            },
            {
                "id_negocio": negocio_2.id_negocio,
                "nombre": "Dueño",
                "apellido": "Comercial Chocó",
                "correo": "dueno@comercialchoco.com",
                "rol": "dueno",
                "es_administrador": True
            },
            {
                "id_negocio": negocio_2.id_negocio,
                "nombre": "Carlos",
                "apellido": "Empleado",
                "correo": "carlos@comercialchoco.com",
                "rol": "empleado",
                "es_administrador": False
            }
        ]

        # ==========================================
        # 3. REGISTRAR LOS USUARIOS
        # ==========================================

        for usuario_data in usuarios_iniciales:

            usuario_existente = db.scalar(
                select(Usuario).where(
                    Usuario.correo == usuario_data["correo"]
                )
            )

            if usuario_existente is None:
                nuevo_usuario = Usuario(
                    **usuario_data,
                    password_hash=obtener_hash(
                        CONTRASENA_INICIAL
                    )
                )

                db.add(nuevo_usuario)

        db.commit()

        print("======================================")
        print("DATOS INICIALES REGISTRADOS CORRECTAMENTE")
        print("======================================")
        print("Negocios: 2")
        print("Usuarios de demostración: 5")
        print("Contraseña inicial: 123456")
        print("======================================")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    inicializar_datos()
