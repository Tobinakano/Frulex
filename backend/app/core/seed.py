import os
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.models import Producto, Usuario
from app.routers.auth import pwd_context


def seed_data(db: Session) -> None:
    if not db.query(Usuario).first():
        admin_pass = os.getenv("SEED_ADMIN_PASSWORD") or "Lumanico*123"
        gerente_pass = os.getenv("SEED_GERENTE_PASSWORD") or "mazuera*123"
        empleado_pass = os.getenv("SEED_EMPLEADO_PASSWORD") or "millan*123"

        db.add_all(
            [
                Usuario(
                    nombre="Admin",
                    correo=os.getenv("SEED_ADMIN_EMAIL", "nicolashdezrd@gmail.com"),
                    hashed_password=pwd_context.hash(admin_pass),
                    rol="admin",
                ),
                Usuario(
                    nombre="Gerente",
                    correo=os.getenv("SEED_GERENTE_EMAIL", "jsmazuerae@correo.usbcali.edu.co"),
                    hashed_password=pwd_context.hash(gerente_pass),
                    rol="gerente",
                ),
                Usuario(
                    nombre="Empleado",
                    correo=os.getenv("SEED_EMPLEADO_EMAIL", "jsmazuma@gmail.com"),
                    hashed_password=pwd_context.hash(empleado_pass),
                    rol="empleado",
                ),
            ]
        )
        db.commit()
        print("Usuarios insertados", flush=True)

    if not db.query(Producto).first():
        db.add_all(
            [
                Producto(
                    nombre="Manzanas",
                    precio=Decimal("3.50"),
                    categoria="Frutas",
                    imagen_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
                ),
                Producto(
                    nombre="Naranjas",
                    precio=Decimal("2.80"),
                    categoria="Frutas",
                    imagen_url="https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80",
                ),
                Producto(
                    nombre="Tomates",
                    precio=Decimal("2.40"),
                    categoria="Verduras",
                    imagen_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
                ),
                Producto(
                    nombre="Cebollas",
                    precio=Decimal("1.90"),
                    categoria="Verduras",
                    imagen_url="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
                ),
            ]
        )
        db.commit()
        print("Productos insertados", flush=True)
