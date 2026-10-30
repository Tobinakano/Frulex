from decimal import Decimal

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(prefix="/checkout", tags=["Checkout"])


class ProductoCheckout(BaseModel):
    id: int
    nombre: str
    cantidad: int = Field(gt=0)
    precio: Decimal = Field(gt=0, decimal_places=2)


class CheckoutSolicitud(BaseModel):
    productos: list[ProductoCheckout] = Field(min_length=1)
    total: Decimal = Field(gt=0, decimal_places=2)


class CheckoutRespuesta(BaseModel):
    mensaje: str
    total: Decimal


@router.post("/", response_model=CheckoutRespuesta)
def procesar_checkout(datos: CheckoutSolicitud) -> CheckoutRespuesta:
    return CheckoutRespuesta(
        mensaje="Pago procesado exitosamente. Pedido confirmado.",
        total=datos.total,
    )
