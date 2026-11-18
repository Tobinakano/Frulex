from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import OrdenDespacho, Pedido, Sucursal, Usuario
from app.routers.auth import requerir_roles
from app.schemas.schemas import (
    ItemDespachoRespuesta,
    OrdenDespachoCrear,
    OrdenDespachoEstado,
    OrdenDespachoRespuesta,
    PedidoPorDespacharRespuesta,
)


router = APIRouter(prefix="/despachos", tags=["Órdenes de despacho"])

SIGUIENTE_ESTADO: dict[str, str | None] = {
    "generada": "en_preparacion",
    "en_preparacion": "despachada",
    "despachada": "entregada",
    "entregada": None,
}
ESTADO_PEDIDO: dict[str, str] = {
    "generada": "en_despacho",
    "en_preparacion": "en_despacho",
    "despachada": "en_camino",
    "entregada": "entregado",
}

ESTADOS_PENDIENTES_DESPACHO = ("confirmado", "Pendiente de despacho")

solo_personal = requerir_roles("empleado", "gerente")


def _construir_orden(db: Session, orden: OrdenDespacho) -> OrdenDespachoRespuesta:
    pedido = orden.pedido
    cliente = db.get(Usuario, pedido.usuario_id) if pedido.usuario_id else None
    return OrdenDespachoRespuesta(
        id=orden.id,
        codigo=pedido.codigo_seguimiento or f"OD-{orden.id:05d}",
        pedido_id=pedido.id,
        sucursal_id=orden.sucursal_id,
        sucursal_nombre=orden.sucursal.nombre,
        estado=orden.estado,
        siguiente_estado=SIGUIENTE_ESTADO.get(orden.estado),
        direccion_entrega=pedido.direccion_entrega,
        cliente_nombre=cliente.nombre if cliente else None,
        cliente_correo=cliente.correo if cliente else None,
        observaciones=orden.observaciones,
        total=pedido.total,
        items=[
            ItemDespachoRespuesta(
                producto_id=detalle.producto_id,
                nombre=detalle.nombre_producto,
                cantidad=detalle.cantidad,
            )
            for detalle in pedido.detalles
        ],
        creado_en=orden.creado_en,
        actualizado_en=orden.actualizado_en,
    )


def _obtener_orden(db: Session, orden_id: int) -> OrdenDespacho:
    orden = db.get(OrdenDespacho, orden_id)
    if orden is None:
        raise HTTPException(status_code=404, detail="Orden de despacho no encontrada")
    return orden


@router.get("/pedidos-pendientes", response_model=list[PedidoPorDespacharRespuesta])
def listar_pedidos_por_despachar(
    sucursal_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_personal),
) -> list[PedidoPorDespacharRespuesta]:
    """Pedidos confirmados o pendientes de despacho que aún no tienen orden de despacho."""
    query = (
        select(Pedido)
        .outerjoin(OrdenDespacho, OrdenDespacho.pedido_id == Pedido.id)
        .where(Pedido.estado.in_(ESTADOS_PENDIENTES_DESPACHO), OrdenDespacho.id.is_(None))
        .order_by(Pedido.id)
    )
    if sucursal_id is not None:
        query = query.where(or_(Pedido.sucursal_id == sucursal_id, Pedido.sucursal_id.is_(None)))
    resultado = []
    for pedido in db.scalars(query).all():
        cliente = db.get(Usuario, pedido.usuario_id) if pedido.usuario_id else None
        resultado.append(
            PedidoPorDespacharRespuesta(
                pedido_id=pedido.id,
                tipo=pedido.tipo,
                cliente_nombre=cliente.nombre if cliente else None,
                direccion_entrega=pedido.direccion_entrega,
                total=pedido.total,
                unidades=sum(detalle.cantidad for detalle in pedido.detalles),
                sucursal_id=pedido.sucursal_id,
                creado_en=pedido.creado_en,
            )
        )
    return resultado


@router.post("/", response_model=OrdenDespachoRespuesta, status_code=status.HTTP_201_CREATED)
def generar_orden_despacho(
    datos: OrdenDespachoCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(solo_personal),
) -> OrdenDespachoRespuesta:
    pedido = db.get(Pedido, datos.pedido_id)
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if db.scalar(select(OrdenDespacho).where(OrdenDespacho.pedido_id == pedido.id)):
        raise HTTPException(status_code=409, detail="El pedido ya tiene una orden de despacho")
    if pedido.estado not in ESTADOS_PENDIENTES_DESPACHO:
        raise HTTPException(
            status_code=400,
            detail=f"Solo se puede despachar un pedido confirmado (estado actual: {pedido.estado})",
        )
    if pedido.sucursal_id and datos.sucursal_id and pedido.sucursal_id != datos.sucursal_id:
        raise HTTPException(status_code=400, detail="El pedido pertenece a otra sucursal")

    sucursal_id = pedido.sucursal_id or datos.sucursal_id
    if sucursal_id is None:
        raise HTTPException(
            status_code=400,
            detail="El pedido no tiene sucursal asignada; indica la sucursal de despacho",
        )
    sucursal = db.get(Sucursal, sucursal_id)
    if sucursal is None or not sucursal.activa:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")

    orden = OrdenDespacho(
        pedido_id=pedido.id,
        sucursal_id=sucursal_id,
        estado="generada",
        observaciones=(datos.observaciones or "").strip() or None,
        generada_por_id=usuario.id,
    )
    pedido.sucursal_id = sucursal_id
    pedido.estado = ESTADO_PEDIDO["generada"]
    db.add(orden)
    db.commit()
    db.refresh(orden)
    return _construir_orden(db, orden)


@router.get("/", response_model=list[OrdenDespachoRespuesta])
def listar_ordenes_despacho(
    sucursal_id: int | None = Query(default=None),
    estado: str | None = Query(default=None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_personal),
) -> list[OrdenDespachoRespuesta]:
    query = select(OrdenDespacho).order_by(OrdenDespacho.id.desc())
    if sucursal_id is not None:
        query = query.where(OrdenDespacho.sucursal_id == sucursal_id)
    if estado:
        query = query.where(OrdenDespacho.estado == estado)
    return [_construir_orden(db, orden) for orden in db.scalars(query).all()]


@router.get("/{orden_id}", response_model=OrdenDespachoRespuesta)
def obtener_orden_despacho(
    orden_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_personal),
) -> OrdenDespachoRespuesta:
    return _construir_orden(db, _obtener_orden(db, orden_id))


@router.patch("/{orden_id}/estado", response_model=OrdenDespachoRespuesta)
def avanzar_estado_orden(
    orden_id: int,
    datos: OrdenDespachoEstado,
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_personal),
) -> OrdenDespachoRespuesta:
    orden = _obtener_orden(db, orden_id)
    siguiente = SIGUIENTE_ESTADO.get(orden.estado)
    if siguiente is None:
        raise HTTPException(status_code=400, detail="La orden ya fue entregada")
    if datos.estado != siguiente:
        raise HTTPException(
            status_code=400,
            detail=f"Transición no válida: desde '{orden.estado}' solo se puede pasar a '{siguiente}'",
        )
    orden.estado = siguiente
    orden.actualizado_en = datetime.now(timezone.utc)
    orden.pedido.estado = ESTADO_PEDIDO[siguiente]
    db.commit()
    db.refresh(orden)
    return _construir_orden(db, orden)
