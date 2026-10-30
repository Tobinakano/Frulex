from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.database import Base, SessionLocal, engine
from app.core.seed import seed_data
from app.routers.auth import router as auth_router
from app.routers.checkout import router as checkout_router
from app.routers.products import router as products_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    if "rol" not in {column["name"] for column in inspect(engine).get_columns("usuarios")}:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE usuarios ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'cliente'")
            )
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
    description="API para autenticación y catálogo de productos de Frulex.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(checkout_router, prefix="/api")


@app.get("/health", tags=["Sistema"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
