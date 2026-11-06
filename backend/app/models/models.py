from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    correo: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="cliente",
        server_default=text("'cliente'"),
    )


class Producto(Base):
    __tablename__ = "productos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    precio: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    categoria: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    imagen_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Pedido(Base):
    __tablename__ = "pedidos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"), nullable=True, index=True)
    sucursal_id: Mapped[int | None] = mapped_column(ForeignKey("sucursales.id"), nullable=True, index=True)
    tipo: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="minorista",
        server_default=text("'minorista'"),
    )
    direccion_entrega: Mapped[str] = mapped_column(String(300), nullable=False, default="Entrega a domicilio")
    metodo_pago: Mapped[str] = mapped_column(String(80), nullable=False, default="Pago contra entrega")
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    estado: Mapped[str] = mapped_column(String(40), nullable=False, default="confirmado")
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    detalles: Mapped[list["DetallePedido"]] = relationship(
        back_populates="pedido",
        cascade="all, delete-orphan",
    )


class DetallePedido(Base):
    __tablename__ = "detalles_pedido"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pedido_id: Mapped[int] = mapped_column(ForeignKey("pedidos.id"), nullable=False, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    nombre_producto: Mapped[str] = mapped_column(String(160), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)
    precio_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    pedido: Mapped["Pedido"] = relationship(back_populates="detalles")


class Sucursal(Base):
    __tablename__ = "sucursales"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    direccion: Mapped[str] = mapped_column(String(300), nullable=False)
    ciudad: Mapped[str] = mapped_column(String(100), nullable=False)
    activa: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )


class Oferta(Base):
    __tablename__ = "ofertas"
    __table_args__ = (UniqueConstraint("producto_id", "sucursal_id", name="uq_oferta_producto_sucursal"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False, index=True)
    sucursal_id: Mapped[int] = mapped_column(ForeignKey("sucursales.id"), nullable=False, index=True)
    precio_oferta: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    activa: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )

    producto: Mapped["Producto"] = relationship()


class Direccion(Base):
    __tablename__ = "direcciones"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False, index=True)
    alias: Mapped[str] = mapped_column(String(60), nullable=False)
    direccion: Mapped[str] = mapped_column(String(300), nullable=False)
    ciudad: Mapped[str] = mapped_column(String(100), nullable=False, default="Cali")
    referencia: Mapped[str | None] = mapped_column(String(200), nullable=True)


class CarritoB2B(Base):
    __tablename__ = "carritos_b2b"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), unique=True, nullable=False, index=True)

    items: Mapped[list["ItemCarritoB2B"]] = relationship(
        back_populates="carrito",
        cascade="all, delete-orphan",
        order_by="ItemCarritoB2B.id",
    )


class ItemCarritoB2B(Base):
    __tablename__ = "items_carrito_b2b"
    __table_args__ = (UniqueConstraint("carrito_id", "producto_id", name="uq_item_carrito_producto"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    carrito_id: Mapped[int] = mapped_column(ForeignKey("carritos_b2b.id"), nullable=False, index=True)
    producto_id: Mapped[int] = mapped_column(ForeignKey("productos.id"), nullable=False)
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False)

    carrito: Mapped["CarritoB2B"] = relationship(back_populates="items")
    producto: Mapped["Producto"] = relationship()
