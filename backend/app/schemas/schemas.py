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
