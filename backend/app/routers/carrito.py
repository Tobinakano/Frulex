from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Carrito, ItemCarrito, Producto, Sucursal, Usuario
from app.routers.auth import obtener_usuario_actual
from app.routers.products import obtener_precios_oferta
from app.schemas.schemas import (
    CarritoRespuesta,
    ItemCarritoActualizar,
    ItemCarritoCrear,
    ItemCarritoRespuesta,
)


router = APIRouter(prefix="/carrito", tags=["Carrito de compras"])

CANTIDAD_MAXIMA = 100000
CENTAVOS = Decimal("0.01")


def _obtener_o_crear_carrito(db: Session, usuario: Usuario) -> Carrito:
    carrito = db.scalar(select(Carrito).where(Carrito.usuario_id == usuario.id))
    if carrito is None:
        carrito = Carrito(usuario_id=usuario.id)
        db.add(carrito)
        db.commit()
        db.refresh(carrito)
    return carrito


def _validar_sucursal(db: Session, sucursal_id: int | None) -> None:
    if sucursal_id is None:
        return
    sucursal = db.get(Sucursal, sucursal_id)
    if sucursal is None or not sucursal.activa:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")


def _construir_respuesta(db: Session, carrito: Carrito, sucursal_id: int | None) -> CarritoRespuesta:
    ofertas = obtener_precios_oferta(db, sucursal_id)
    items: list[ItemCarritoRespuesta] = []
    total = Decimal("0.00")
    total_unidades = 0
    for item in carrito.items:
        producto = item.producto
        precio_base = Decimal(producto.precio)
        precio_oferta = ofertas.get(producto.id)
        precio_unitario = precio_oferta if precio_oferta is not None else precio_base
        subtotal = (precio_unitario * item.cantidad).quantize(CENTAVOS)
        total += subtotal
        total_unidades += item.cantidad
        items.append(
            ItemCarritoRespuesta(
                producto_id=producto.id,
                nombre=producto.nombre,
                categoria=producto.categoria,
                imagen_url=producto.imagen_url,
                cantidad=item.cantidad,
                precio_base=precio_base,
                precio_oferta=precio_oferta,
                precio_unitario=precio_unitario,
                subtotal=subtotal,
            )
        )
    return CarritoRespuesta(items=items, total_unidades=total_unidades, total=total)


def _buscar_item(carrito: Carrito, producto_id: int) -> ItemCarrito | None:
    return next((item for item in carrito.items if item.producto_id == producto_id), None)


@router.get("/", response_model=CarritoRespuesta)
def ver_carrito(
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> CarritoRespuesta:
    _validar_sucursal(db, sucursal_id)
    return _construir_respuesta(db, _obtener_o_crear_carrito(db, usuario), sucursal_id)


@router.post("/items", response_model=CarritoRespuesta)
def agregar_item(
    datos: ItemCarritoCrear,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> CarritoRespuesta:
    _validar_sucursal(db, sucursal_id)
    if db.get(Producto, datos.producto_id) is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    carrito = _obtener_o_crear_carrito(db, usuario)
    existente = _buscar_item(carrito, datos.producto_id)
    if existente:
        nueva_cantidad = existente.cantidad + datos.cantidad
        if nueva_cantidad > CANTIDAD_MAXIMA:
            raise HTTPException(status_code=422, detail=f"La cantidad máxima por producto es {CANTIDAD_MAXIMA}")
        existente.cantidad = nueva_cantidad
    else:
        carrito.items.append(ItemCarrito(producto_id=datos.producto_id, cantidad=datos.cantidad))
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


# CU-07: Modificar cantidad en el carrito
@router.put("/items/{producto_id}", response_model=CarritoRespuesta)
def modificar_cantidad(
    producto_id: int,
    datos: ItemCarritoActualizar,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> CarritoRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    item = _buscar_item(carrito, producto_id)
    if item is None:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")
    item.cantidad = datos.cantidad
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


# CU-08: Eliminar producto del carrito
@router.delete("/items/{producto_id}", response_model=CarritoRespuesta)
def eliminar_item(
    producto_id: int,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> CarritoRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    item = _buscar_item(carrito, producto_id)
    if item is None:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito")
    carrito.items.remove(item)
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.delete("/", response_model=CarritoRespuesta)
def vaciar_carrito(
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> CarritoRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    carrito.items.clear()
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)
