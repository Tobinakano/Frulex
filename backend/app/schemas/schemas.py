from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegistroUsuario(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    correo: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginUsuario(BaseModel):
    correo: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    correo: EmailStr
    rol: str


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=160)
    precio: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    categoria: str = Field(min_length=2, max_length=100)
    imagen_url: str | None = Field(default=None, max_length=500)


class ProductoCrear(ProductoBase):
    pass


class ProductoRespuesta(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


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
    imagen_url: str | None = None
    precio_original: Decimal
    precio_oferta: Decimal
    sucursal_id: int


# --- CU-09: Seleccionar dirección de entrega ---
class DireccionCrear(BaseModel):
    alias: str = Field(min_length=2, max_length=60)
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
    mensaje: str
    total: Decimal
