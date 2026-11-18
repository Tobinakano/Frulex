from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.database import Base, SessionLocal, engine
from app.core.seed import seed_data
from app.routers.auth import router as auth_router
from app.routers.carrito import router as carrito_router
from app.routers.carrito_b2b import router as carrito_b2b_router
from app.routers.checkout import router as checkout_router
from app.routers.despachos import router as despachos_router
from app.routers.direcciones import router as direcciones_router
from app.routers.products import router as products_router
from app.routers.sucursales import router as sucursales_router


def _sincronizar_esquema() -> None:
    inspector = inspect(engine)

    columnas_usuarios = {column["name"] for column in inspector.get_columns("usuarios")}
    with engine.begin() as connection:
        if "rol" not in columnas_usuarios:
            connection.execute(
                text("ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'cliente'")
            )
        if "celular" not in columnas_usuarios:
            connection.execute(text("ALTER TABLE usuarios ADD COLUMN celular VARCHAR(30)"))

    columnas_productos = {column["name"] for column in inspector.get_columns("productos")}
    with engine.begin() as connection:
        if "unidad" not in columnas_productos:
            connection.execute(
                text("ALTER TABLE productos ADD COLUMN unidad VARCHAR(40) NOT NULL DEFAULT 'libra'")
            )
        if "stock" not in columnas_productos:
            connection.execute(
                text("ALTER TABLE productos ADD COLUMN stock INTEGER NOT NULL DEFAULT 100")
            )

    columnas_ofertas = {column["name"] for column in inspector.get_columns("ofertas")}
    with engine.begin() as connection:
        if "etiqueta" not in columnas_ofertas:
            connection.execute(
                text("ALTER TABLE ofertas ADD COLUMN etiqueta VARCHAR(80) NOT NULL DEFAULT 'Oferta por maduración'")
            )

    columnas_direcciones = {column["name"] for column in inspector.get_columns("direcciones")}
    with engine.begin() as connection:
        if "barrio" not in columnas_direcciones:
            connection.execute(text("ALTER TABLE direcciones ADD COLUMN barrio VARCHAR(120)"))

    columnas_pedidos = {column["name"] for column in inspector.get_columns("pedidos")}
    with engine.begin() as connection:
        if "sucursal_id" not in columnas_pedidos:
            connection.execute(
                text("ALTER TABLE pedidos ADD COLUMN sucursal_id INTEGER REFERENCES sucursales(id)")
            )
        if "tipo" not in columnas_pedidos:
            connection.execute(
                text("ALTER TABLE pedidos ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'minorista'")
            )
        if "codigo_seguimiento" not in columnas_pedidos:
            connection.execute(
                text("ALTER TABLE pedidos ADD COLUMN codigo_seguimiento VARCHAR(64)")
            )
        if "barrio" not in columnas_pedidos:
            connection.execute(text("ALTER TABLE pedidos ADD COLUMN barrio VARCHAR(120)"))
        if "costo_domicilio" not in columnas_pedidos:
            connection.execute(
                text("ALTER TABLE pedidos ADD COLUMN costo_domicilio NUMERIC(10, 2) NOT NULL DEFAULT 0.00")
            )


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    _sincronizar_esquema()
    db = None
    try:
        db = SessionLocal()
        seed_data(db)
    except Exception as error:
        print(f"Error durante el seeding: {error}", flush=True)
    finally:
        if db is not None:
            db.close()
    yield


app = FastAPI(
    title="Frulex API",
    description="API multisede de comercio electrónico B2C y B2B de frutas y verduras en Cali.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(checkout_router, prefix="/api")
app.include_router(sucursales_router, prefix="/api")
app.include_router(direcciones_router, prefix="/api")
app.include_router(carrito_b2b_router, prefix="/api")
app.include_router(carrito_router, prefix="/api")
app.include_router(despachos_router, prefix="/api")


@app.get("/health", tags=["Sistema"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
