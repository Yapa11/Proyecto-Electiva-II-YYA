
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

# Datos de conexión
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "inventario_db")

# Configuración SSL para TiDB Cloud
DB_SSL_CA = os.getenv("DB_SSL_CA")

connection_query = {"charset": "utf8mb4"}

if DB_SSL_CA:
    connection_query["ssl_ca"] = DB_SSL_CA
    connection_query["ssl_verify_cert"] = "true"

DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    query=connection_query
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass


def obtener_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
