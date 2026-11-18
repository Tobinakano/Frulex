from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Oferta, Producto, Sucursal, Usuario
from app.routers.auth import requerir_roles
from app.schemas.schemas import OfertaRespuesta, ProductoCrear, ProductoRespuesta


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
def crear_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db),
    _: Usuario = Depends(requerir_roles("admin", "gerente")),
) -> Producto:
    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def obtener_precios_oferta(db: Session, sucursal_id: int | None) -> dict[int, Decimal]:
    """Devuelve {producto_id: precio_oferta} de las ofertas activas de una sucursal."""
    if sucursal_id is None:
        return {}
    query = select(Oferta).where(Oferta.sucursal_id == sucursal_id, Oferta.activa.is_(True))
    return {oferta.producto_id: Decimal(oferta.precio_oferta) for oferta in db.scalars(query).all()}


@router.get("/ofertas/{sucursal_id}", response_model=list[OfertaRespuesta])
def obtener_productos_oferta(sucursal_id: int, db: Session = Depends(get_db)) -> list[OfertaRespuesta]:
    sucursal = db.get(Sucursal, sucursal_id)
    if sucursal is None or not sucursal.activa:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    query = (
        select(Oferta, Producto)
        .join(Producto, Producto.id == Oferta.producto_id)
        .where(Oferta.sucursal_id == sucursal_id, Oferta.activa.is_(True))
        .order_by(Producto.nombre)
    )
    return [
        OfertaRespuesta(
            id=producto.id,
            oferta_id=oferta.id,
            nombre=producto.nombre,
            categoria=producto.categoria,
            imagen_url=producto.imagen_url,
            precio_original=producto.precio,
            precio_oferta=oferta.precio_oferta,
            sucursal_id=sucursal_id,
        )
        for oferta, producto in db.execute(query).all()
    ]
