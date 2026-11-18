from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import InventarioSucursal, Oferta, Producto, Sucursal, Usuario
from app.routers.auth import requerir_roles
from app.schemas.schemas import OfertaRespuesta, ProductoCrear, ProductoRespuesta


router = APIRouter(prefix="/productos", tags=["Productos"])


def obtener_precios_oferta(db: Session, sucursal_id: int | None) -> dict[int, Decimal]:
    """Devuelve {producto_id: precio_oferta} de las ofertas activas de una sucursal."""
    if sucursal_id is None:
        return {}
    query = select(Oferta).where(Oferta.sucursal_id == sucursal_id, Oferta.activa.is_(True))
    return {oferta.producto_id: Decimal(oferta.precio_oferta) for oferta in db.scalars(query).all()}


def obtener_mapa_ofertas(db: Session, sucursal_id: int | None) -> dict[int, Oferta]:
    if sucursal_id is None:
        return {}
    query = select(Oferta).where(Oferta.sucursal_id == sucursal_id, Oferta.activa.is_(True))
    return {oferta.producto_id: oferta for oferta in db.scalars(query).all()}


def obtener_stock_sucursal(db: Session, sucursal_id: int | None) -> dict[int, int]:
    if sucursal_id is None:
        return {}
    query = select(InventarioSucursal).where(InventarioSucursal.sucursal_id == sucursal_id)
    return {inv.producto_id: inv.stock for inv in db.scalars(query).all()}


@router.get("/", response_model=list[ProductoRespuesta])
def listar_productos(
    categoria: str | None = Query(default=None),
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ProductoRespuesta]:
    if sucursal_id is not None:
        sucursal = db.get(Sucursal, sucursal_id)
        if sucursal is None or not sucursal.activa:
            raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    query = select(Producto).order_by(Producto.id)
    if categoria:
        query = query.where(Producto.categoria == categoria)
    productos = list(db.scalars(query).all())

    stocks_sede = obtener_stock_sucursal(db, sucursal_id)
    ofertas_sede = obtener_mapa_ofertas(db, sucursal_id)

    resultado: list[ProductoRespuesta] = []
    for prod in productos:
        stock_efectivo = stocks_sede.get(prod.id, prod.stock) if sucursal_id else prod.stock
        oferta = ofertas_sede.get(prod.id)
        resultado.append(
            ProductoRespuesta(
                id=prod.id,
                nombre=prod.nombre,
                precio=prod.precio,
                categoria=prod.categoria,
                unidad=prod.unidad or "libra",
                stock=stock_efectivo,
                imagen_url=prod.imagen_url,
                precio_oferta=oferta.precio_oferta if oferta else None,
                en_oferta=oferta is not None,
                etiqueta_oferta=oferta.etiqueta if oferta else None,
                sucursal_id=sucursal_id,
            )
        )
    return resultado


@router.get("/ofertas/{sucursal_id}", response_model=list[OfertaRespuesta])
def obtener_productos_oferta(sucursal_id: int, db: Session = Depends(get_db)) -> list[OfertaRespuesta]:
    sucursal = db.get(Sucursal, sucursal_id)
    if sucursal is None or not sucursal.activa:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    stocks_sede = obtener_stock_sucursal(db, sucursal_id)
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
            unidad=producto.unidad or "libra",
            stock=stocks_sede.get(producto.id, producto.stock),
            imagen_url=producto.imagen_url,
            precio_original=producto.precio,
            precio_oferta=oferta.precio_oferta,
            etiqueta=oferta.etiqueta or "Oferta por maduración",
            sucursal_id=sucursal_id,
        )
        for oferta, producto in db.execute(query).all()
    ]


@router.get("/{producto_id}", response_model=ProductoRespuesta)
def obtener_producto(
    producto_id: int,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ProductoRespuesta:
    producto = db.get(Producto, producto_id)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    stocks_sede = obtener_stock_sucursal(db, sucursal_id)
    ofertas_sede = obtener_mapa_ofertas(db, sucursal_id)
    oferta = ofertas_sede.get(producto.id)
    return ProductoRespuesta(
        id=producto.id,
        nombre=producto.nombre,
        precio=producto.precio,
        categoria=producto.categoria,
        unidad=producto.unidad or "libra",
        stock=stocks_sede.get(producto.id, producto.stock) if sucursal_id else producto.stock,
        imagen_url=producto.imagen_url,
        precio_oferta=oferta.precio_oferta if oferta else None,
        en_oferta=oferta is not None,
        etiqueta_oferta=oferta.etiqueta if oferta else None,
        sucursal_id=sucursal_id,
    )


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
