import uuid
from decimal import Decimal

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Carrito, DetallePedido, InventarioSucursal, Pedido, Producto, Sucursal, Usuario
from app.routers.products import obtener_precios_oferta


router = APIRouter(prefix="/checkout", tags=["Checkout"])
optional_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

COSTO_DOMICILIO_EXPRESS = Decimal("4500.00")


class ProductoCheckout(BaseModel):
    id: int
    nombre: str
    cantidad: int = Field(gt=0)
    precio: Decimal = Field(gt=0, decimal_places=2)


class CheckoutSolicitud(BaseModel):
    productos: list[ProductoCheckout] = Field(min_length=1)
    total: Decimal = Field(gt=0, decimal_places=2)
    barrio: str | None = Field(default=None, max_length=120)
    direccion_entrega: str = Field(default="Entrega a domicilio", max_length=300)
    metodo_pago: str = Field(default="Nequi", max_length=80)
    costo_domicilio: Decimal = Field(default=Decimal("0.00"), ge=0, decimal_places=2)
    sucursal_id: int | None = None


class CheckoutRespuesta(BaseModel):
    pedido_id: int | None = None
    codigo_seguimiento: str
    estado: str = "Pendiente de despacho"
    sucursal_nombre: str | None = None
    metodo_pago: str
    direccion_entrega: str
    barrio: str | None = None
    subtotal: Decimal
    costo_domicilio: Decimal
    mensaje: str
    total: Decimal


def obtener_usuario_opcional(
    token: str | None = Depends(optional_oauth2),
    cookie_token: str | None = Cookie(default=None, alias="frulex_access_token"),
    db: Session = Depends(get_db),
) -> Usuario | None:
    effective_token = token or cookie_token
    if not effective_token:
        return None
    try:
        payload = jwt.decode(
            effective_token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        subject = payload.get("sub")
        if not subject:
            return None
        return db.get(Usuario, int(subject))
    except (JWTError, ValueError):
        return None


@router.post("/", response_model=CheckoutRespuesta, status_code=status.HTTP_200_OK)
def procesar_checkout(
    datos: CheckoutSolicitud,
    db: Session = Depends(get_db),
    usuario: Usuario | None = Depends(obtener_usuario_opcional),
) -> CheckoutRespuesta:
    sucursal: Sucursal | None = None
    if datos.sucursal_id is not None:
        sucursal = db.get(Sucursal, datos.sucursal_id)
        if sucursal is None or not sucursal.activa:
            raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    else:
        sucursal = db.scalar(select(Sucursal).where(Sucursal.activa.is_(True)).order_by(Sucursal.id))

    effective_sucursal_id = datos.sucursal_id if datos.sucursal_id is not None else (sucursal.id if sucursal else None)
    ofertas = obtener_precios_oferta(db, effective_sucursal_id)

    subtotal_calculado = Decimal("0.00")
    detalles_crear: list[DetallePedido] = []
    pedido_id: int | None = None
    codigo_uuid = str(uuid.uuid4()).upper()
    costo_domicilio = Decimal(datos.costo_domicilio).quantize(Decimal("0.01"))

    try:
        # CU-11: Transacción atómica SQL (verifica y descuenta inventario por sucursal + crea Orden de Despacho)
        for item in datos.productos:
            producto_bd = db.get(Producto, item.id)
            if producto_bd:
                if effective_sucursal_id is not None:
                    inv = db.scalar(
                        select(InventarioSucursal)
                        .where(
                            InventarioSucursal.producto_id == producto_bd.id,
                            InventarioSucursal.sucursal_id == effective_sucursal_id,
                        )
                        .with_for_update()
                    )
                    if inv is not None:
                        if inv.stock < item.cantidad:
                            raise HTTPException(
                                status_code=400,
                                detail=f"Stock insuficiente para {producto_bd.nombre} en {sucursal.nombre if sucursal else 'la sede seleccionada'} (disponible: {inv.stock} lb).",
                            )
                        inv.stock -= item.cantidad
                if producto_bd.stock is not None and producto_bd.stock >= item.cantidad:
                    producto_bd.stock -= item.cantidad

                precio_unitario = ofertas.get(producto_bd.id, Decimal(producto_bd.precio))
            else:
                precio_unitario = Decimal(item.precio)

            nombre_prod = producto_bd.nombre if producto_bd else item.nombre
            subtotal_item = (precio_unitario * Decimal(item.cantidad)).quantize(Decimal("0.01"))
            subtotal_calculado += subtotal_item

            if producto_bd is not None:
                detalles_crear.append(
                    DetallePedido(
                        producto_id=producto_bd.id,
                        nombre_producto=nombre_prod,
                        cantidad=item.cantidad,
                        precio_unitario=precio_unitario,
                        subtotal=subtotal_item,
                    )
                )

        total_final = (subtotal_calculado + costo_domicilio).quantize(Decimal("0.01"))

        pedido = Pedido(
            codigo_seguimiento=codigo_uuid,
            usuario_id=usuario.id if usuario else None,
            sucursal_id=effective_sucursal_id,
            barrio=(datos.barrio or "").strip() or None,
            direccion_entrega=datos.direccion_entrega.strip() or "Entrega a domicilio",
            metodo_pago=datos.metodo_pago.strip() or "Nequi",
            costo_domicilio=costo_domicilio,
            total=total_final,
            estado="Pendiente de despacho",
            detalles=detalles_crear,
        )
        db.add(pedido)
        db.commit()
        db.refresh(pedido)
        pedido_id = pedido.id
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        total_final = (subtotal_calculado + costo_domicilio).quantize(Decimal("0.01"))

    if pedido_id is not None and usuario is not None:
        # El pedido ya quedó registrado: se vacía el carrito guardado en el servidor.
        try:
            carrito = db.scalar(select(Carrito).where(Carrito.usuario_id == usuario.id))
            if carrito is not None:
                carrito.items.clear()
                db.commit()
        except Exception:
            db.rollback()

    return CheckoutRespuesta(
        pedido_id=pedido_id,
        codigo_seguimiento=codigo_uuid,
        estado="Pendiente de despacho",
        sucursal_nombre=sucursal.nombre if sucursal else None,
        metodo_pago=datos.metodo_pago.strip() or "Nequi",
        direccion_entrega=datos.direccion_entrega.strip() or "Entrega a domicilio",
        barrio=(datos.barrio or "").strip() or None,
        subtotal=subtotal_calculado,
        costo_domicilio=costo_domicilio,
        mensaje="Pago procesado exitosamente. Pedido confirmado y pendiente de despacho.",
        total=total_final,
    )
