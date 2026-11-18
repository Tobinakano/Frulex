from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    CarritoB2B,
    DetallePedido,
    ItemCarritoB2B,
    Pedido,
    Producto,
    Sucursal,
    Usuario,
)
from app.routers.auth import requerir_roles
from app.routers.products import obtener_precios_oferta
from app.schemas.schemas import (
    CarritoB2BRespuesta,
    ConfirmarB2B,
    ConfirmarB2BRespuesta,
    ItemB2BActualizar,
    ItemB2BCrear,
    ItemB2BRespuesta,
)


router = APIRouter(prefix="/carrito-b2b", tags=["Carrito B2B"])

# --- Reglas comerciales B2B (ajustar aquí si cambian) ---
# Descuento por volumen por producto: (cantidad mínima, % de descuento), de mayor a menor.
TRAMOS_DESCUENTO: list[tuple[int, int]] = [(100, 15), (50, 10), (10, 5)]
# Valor mínimo del pedido (ya con descuentos) para poder confirmarlo.
MINIMO_PEDIDO_B2B = Decimal("100.00")
CANTIDAD_MAXIMA = 100000
CENTAVOS = Decimal("0.01")


def _descuento_por_volumen(cantidad: int) -> int:
    for minimo, porcentaje in TRAMOS_DESCUENTO:
        if cantidad >= minimo:
            return porcentaje
    return 0


def _obtener_o_crear_carrito(db: Session, usuario: Usuario) -> CarritoB2B:
    carrito = db.scalar(select(CarritoB2B).where(CarritoB2B.usuario_id == usuario.id))
    if carrito is None:
        carrito = CarritoB2B(usuario_id=usuario.id)
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


def _construir_respuesta(db: Session, carrito: CarritoB2B, sucursal_id: int | None) -> CarritoB2BRespuesta:
    ofertas = obtener_precios_oferta(db, sucursal_id)
    items: list[ItemB2BRespuesta] = []
    subtotal_sin_descuento = Decimal("0.00")
    total = Decimal("0.00")
    total_unidades = 0

    for item in carrito.items:
        producto = item.producto
        precio_base = Decimal(producto.precio)
        precio_oferta = ofertas.get(producto.id)
        precio_vigente = precio_oferta if precio_oferta is not None else precio_base
        descuento_pct = _descuento_por_volumen(item.cantidad)
        precio_final = (precio_vigente * (Decimal(100 - descuento_pct) / Decimal(100))).quantize(CENTAVOS)
        subtotal = (precio_final * item.cantidad).quantize(CENTAVOS)

        subtotal_sin_descuento += (precio_base * item.cantidad).quantize(CENTAVOS)
        total += subtotal
        total_unidades += item.cantidad
        items.append(
            ItemB2BRespuesta(
                producto_id=producto.id,
                nombre=producto.nombre,
                categoria=producto.categoria,
                imagen_url=producto.imagen_url,
                cantidad=item.cantidad,
                precio_base=precio_base,
                precio_oferta=precio_oferta,
                descuento_volumen_pct=descuento_pct,
                precio_unitario_final=precio_final,
                subtotal=subtotal,
            )
        )

    return CarritoB2BRespuesta(
        items=items,
        total_unidades=total_unidades,
        subtotal_sin_descuento=subtotal_sin_descuento,
        descuento_total=subtotal_sin_descuento - total,
        total=total,
        minimo_pedido=MINIMO_PEDIDO_B2B,
        cumple_minimo=total >= MINIMO_PEDIDO_B2B,
        tramos_descuento=[
            {"desde": minimo, "porcentaje": porcentaje} for minimo, porcentaje in reversed(TRAMOS_DESCUENTO)
        ],
    )


@router.get("/", response_model=CarritoB2BRespuesta)
def ver_carrito_b2b(
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> CarritoB2BRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.post("/items", response_model=CarritoB2BRespuesta)
def agregar_item_b2b(
    datos: ItemB2BCrear,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> CarritoB2BRespuesta:
    _validar_sucursal(db, sucursal_id)
    if db.get(Producto, datos.producto_id) is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    carrito = _obtener_o_crear_carrito(db, usuario)
    existente = next((i for i in carrito.items if i.producto_id == datos.producto_id), None)
    if existente:
        nueva_cantidad = existente.cantidad + datos.cantidad
        if nueva_cantidad > CANTIDAD_MAXIMA:
            raise HTTPException(status_code=422, detail=f"La cantidad máxima por producto es {CANTIDAD_MAXIMA}")
        existente.cantidad = nueva_cantidad
    else:
        carrito.items.append(ItemCarritoB2B(producto_id=datos.producto_id, cantidad=datos.cantidad))
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.put("/items/{producto_id}", response_model=CarritoB2BRespuesta)
def actualizar_item_b2b(
    producto_id: int,
    datos: ItemB2BActualizar,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> CarritoB2BRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    item = next((i for i in carrito.items if i.producto_id == producto_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito B2B")
    item.cantidad = datos.cantidad
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.delete("/items/{producto_id}", response_model=CarritoB2BRespuesta)
def eliminar_item_b2b(
    producto_id: int,
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> CarritoB2BRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    item = next((i for i in carrito.items if i.producto_id == producto_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="El producto no está en el carrito B2B")
    carrito.items.remove(item)
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.delete("/", response_model=CarritoB2BRespuesta)
def vaciar_carrito_b2b(
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> CarritoB2BRespuesta:
    _validar_sucursal(db, sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    carrito.items.clear()
    db.commit()
    db.refresh(carrito)
    return _construir_respuesta(db, carrito, sucursal_id)


@router.post("/confirmar", response_model=ConfirmarB2BRespuesta, status_code=status.HTTP_201_CREATED)
def confirmar_pedido_b2b(
    datos: ConfirmarB2B,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(requerir_roles("cliente")),
) -> ConfirmarB2BRespuesta:
    _validar_sucursal(db, datos.sucursal_id)
    carrito = _obtener_o_crear_carrito(db, usuario)
    if not carrito.items:
        raise HTTPException(status_code=400, detail="El carrito B2B está vacío")

    resumen = _construir_respuesta(db, carrito, datos.sucursal_id)
    if not resumen.cumple_minimo:
        raise HTTPException(
            status_code=400,
            detail=f"El pedido B2B debe ser de al menos ${resumen.minimo_pedido:.2f} (actual: ${resumen.total:.2f})",
        )

    pedido = Pedido(
        usuario_id=usuario.id,
        sucursal_id=datos.sucursal_id,
        tipo="b2b",
        direccion_entrega=datos.direccion_entrega.strip(),
        metodo_pago=datos.metodo_pago.strip() or "Pago contra entrega",
        total=resumen.total,
        estado="confirmado",
        detalles=[
            DetallePedido(
                producto_id=item.producto_id,
                nombre_producto=item.nombre,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario_final,
                subtotal=item.subtotal,
            )
            for item in resumen.items
        ],
    )
    db.add(pedido)
    carrito.items.clear()
    db.commit()
    db.refresh(pedido)
    return ConfirmarB2BRespuesta(
        pedido_id=pedido.id,
        mensaje="Pedido B2B confirmado exitosamente.",
        total=pedido.total,
    )
