from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegistroUsuario(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    correo: EmailStr
    celular: str = Field(default="3000000000", min_length=7, max_length=30)
    password: str = Field(min_length=8, max_length=128)


class LoginUsuario(BaseModel):
    correo: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    correo: EmailStr
    celular: str | None = None
    rol: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=160)
    precio: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    categoria: str = Field(min_length=2, max_length=100)
    unidad: str = Field(default="libra", max_length=40)
    stock: int = Field(default=50, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)


class ProductoCrear(ProductoBase):
    pass


class ProductoRespuesta(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    precio_oferta: Decimal | None = None
    en_oferta: bool = False
    etiqueta_oferta: str | None = None
    sucursal_id: int | None = None


# --- CU-04: Seleccionar sucursal activa ---
class SucursalRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    direccion: str
    ciudad: str
    activa: bool


# --- CU-05: Consultar productos en oferta por sucursal ---
class OfertaRespuesta(BaseModel):
    id: int  # id del producto (mismo contrato que el endpoint original)
    oferta_id: int
    nombre: str
    categoria: str
    unidad: str = "libra"
    stock: int = 0
    imagen_url: str | None = None
    precio_original: Decimal
    precio_oferta: Decimal
    etiqueta: str = "Oferta por maduración"
    sucursal_id: int


# --- CU-09: Seleccionar dirección de entrega ---
class DireccionCrear(BaseModel):
    alias: str = Field(min_length=2, max_length=60)
    barrio: str | None = Field(default=None, max_length=120)
    direccion: str = Field(min_length=3, max_length=300)
    ciudad: str = Field(default="Cali", min_length=2, max_length=100)
    referencia: str | None = Field(default=None, max_length=200)


class DireccionRespuesta(DireccionCrear):
    model_config = ConfigDict(from_attributes=True)

    id: int


# --- CU-15: Gestionar carrito de compras B2B ---
class ItemB2BCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0, le=100000)


class ItemB2BActualizar(BaseModel):
    cantidad: int = Field(gt=0, le=100000)


class ItemB2BRespuesta(BaseModel):
    producto_id: int
    nombre: str
    categoria: str
    imagen_url: str | None = None
    cantidad: int
    precio_base: Decimal
    precio_oferta: Decimal | None = None
    descuento_volumen_pct: int
    precio_unitario_final: Decimal
    subtotal: Decimal


class CarritoB2BRespuesta(BaseModel):
    items: list[ItemB2BRespuesta]
    total_unidades: int
    subtotal_sin_descuento: Decimal
    descuento_total: Decimal
    total: Decimal
    minimo_pedido: Decimal
    cumple_minimo: bool
    tramos_descuento: list[dict[str, int]]


class ConfirmarB2B(BaseModel):
    sucursal_id: int | None = None
    direccion_entrega: str = Field(min_length=3, max_length=300)
    metodo_pago: str = Field(default="Pago contra entrega", max_length=80)


class ConfirmarB2BRespuesta(BaseModel):
    pedido_id: int
    codigo_seguimiento: str | None = None
    estado: str = "Pendiente de despacho"
    mensaje: str
    total: Decimal


# --- CU-07 / CU-08: Carrito de compras (modificar cantidad, eliminar producto) ---
class ItemCarritoCrear(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0, le=100000)


class ItemCarritoActualizar(BaseModel):
    cantidad: int = Field(gt=0, le=100000)


class ItemCarritoRespuesta(BaseModel):
    producto_id: int
    nombre: str
    categoria: str
    imagen_url: str | None = None
    cantidad: int
    precio_base: Decimal
    precio_oferta: Decimal | None = None
    precio_unitario: Decimal
    subtotal: Decimal


class CarritoRespuesta(BaseModel):
    items: list[ItemCarritoRespuesta]
    total_unidades: int
    total: Decimal


# --- CU-11: Generar orden de despacho ---
class PedidoPorDespacharRespuesta(BaseModel):
    pedido_id: int
    tipo: str
    cliente_nombre: str | None = None
    direccion_entrega: str
    total: Decimal
    unidades: int
    sucursal_id: int | None = None
    creado_en: datetime


class OrdenDespachoCrear(BaseModel):
    pedido_id: int
    sucursal_id: int | None = None
    observaciones: str | None = Field(default=None, max_length=300)


class OrdenDespachoEstado(BaseModel):
    estado: str


class ItemDespachoRespuesta(BaseModel):
    producto_id: int
    nombre: str
    cantidad: int


class OrdenDespachoRespuesta(BaseModel):
    id: int
    codigo: str
    pedido_id: int
    sucursal_id: int
    sucursal_nombre: str
    estado: str
    siguiente_estado: str | None = None
    direccion_entrega: str
    cliente_nombre: str | None = None
    cliente_correo: str | None = None
    observaciones: str | None = None
    total: Decimal
    items: list[ItemDespachoRespuesta]
    creado_en: datetime
    actualizado_en: datetime
