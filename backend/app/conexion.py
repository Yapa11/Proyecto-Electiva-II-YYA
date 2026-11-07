
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Cargar las variables del archivo .env
load_dotenv()

# Leer los datos de conexión
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "inventario_db")

# Construir la dirección de conexión
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    query={"charset": "utf8mb4"}
)

# Crear el motor de conexión
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Crear sesiones para realizar operaciones en la base de datos
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Clase base para los futuros modelos de las tablas
class Base(DeclarativeBase):
    pass


# Dependencia para utilizar una sesión en las rutas
def obtener_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
