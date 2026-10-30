from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Producto
from app.schemas.schemas import ProductoCrear, ProductoRespuesta


router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(
    categoria: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[Producto]:
    query = select(Producto).order_by(Producto.nombre)
    if categoria:
        query = query.where(Producto.categoria == categoria)
    return list(db.scalars(query).all())


@router.get("/{producto_id}", response_model=ProductoRespuesta)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)) -> Producto:
    producto = db.get(Producto, producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoRespuesta, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCrear, db: Session = Depends(get_db)) -> Producto:
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto
