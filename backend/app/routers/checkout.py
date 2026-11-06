from decimal import Decimal

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import DetallePedido, Pedido, Producto, Usuario


router = APIRouter(prefix="/checkout", tags=["Checkout"])
optional_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


class ProductoCheckout(BaseModel):
    id: int
    nombre: str
    cantidad: int = Field(gt=0)
    precio: Decimal = Field(gt=0, decimal_places=2)


class CheckoutSolicitud(BaseModel):
    productos: list[ProductoCheckout] = Field(min_length=1)
    total: Decimal = Field(gt=0, decimal_places=2)
    direccion_entrega: str = Field(default="Entrega a domicilio", max_length=300)
    metodo_pago: str = Field(default="Pago contra entrega", max_length=80)


class CheckoutRespuesta(BaseModel):
    pedido_id: int | None = None
    mensaje: str
    total: Decimal


def obtener_usuario_opcional(
    token: str | None = Depends(optional_oauth2),
    db: Session = Depends(get_db),
) -> Usuario | None:
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
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
    total_calculado = Decimal("0.00")
    detalles_crear: list[DetallePedido] = []

    for item in datos.productos:
        producto_bd = db.get(Producto, item.id)
        precio_unitario = Decimal(producto_bd.precio) if producto_bd else Decimal(item.precio)
        nombre_prod = producto_bd.nombre if producto_bd else item.nombre
        subtotal = (precio_unitario * Decimal(item.cantidad)).quantize(Decimal("0.01"))
        total_calculado += subtotal

        if producto_bd is not None:
            detalles_crear.append(
                DetallePedido(
                    producto_id=producto_bd.id,
                    nombre_producto=nombre_prod,
                    cantidad=item.cantidad,
                    precio_unitario=precio_unitario,
                    subtotal=subtotal,
                )
            )

    pedido_id: int | None = None
    try:
        pedido = Pedido(
            usuario_id=usuario.id if usuario else None,
            direccion_entrega=datos.direccion_entrega.strip() or "Entrega a domicilio",
            metodo_pago=datos.metodo_pago.strip() or "Pago contra entrega",
            total=total_calculado,
            estado="confirmado",
            detalles=detalles_crear,
        )
        db.add(pedido)
        db.commit()
        db.refresh(pedido)
        pedido_id = pedido.id
    except Exception:
        db.rollback()

    return CheckoutRespuesta(
        pedido_id=pedido_id,
        mensaje="Pago procesado exitosamente. Pedido confirmado.",
        total=total_calculado,
    )
