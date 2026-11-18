import os
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import InventarioSucursal, Oferta, Producto, Sucursal, Usuario
from app.routers.auth import pwd_context

CATALOGO_OBLIGATORIO = [
    {
        "nombre": "Sandía",
        "precio": Decimal("3200.00"),
        "categoria": "Frutas",
        "unidad": "libra",
        "stock": 85,
        "imagen_url": "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=900&q=80",
    },
    {
        "nombre": "Tomate",
        "precio": Decimal("1500.00"),
        "categoria": "Frutas",
        "unidad": "libra",
        "stock": 120,
        "imagen_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80",
    },
    {
        "nombre": "Granadilla",
        "precio": Decimal("4900.00"),
        "categoria": "Frutas",
        "unidad": "libra",
        "stock": 65,
        "imagen_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80",
    },
    {
        "nombre": "Zanahoria",
        "precio": Decimal("2000.00"),
        "categoria": "Verduras",
        "unidad": "libra",
        "stock": 110,
        "imagen_url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=900&q=80",
    },
    {
        "nombre": "Papa amarilla",
        "precio": Decimal("4500.00"),
        "categoria": "Verduras",
        "unidad": "libra",
        "stock": 95,
        "imagen_url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
    },
    {
        "nombre": "Coliflor",
        "precio": Decimal("3200.00"),
        "categoria": "Verduras",
        "unidad": "libra",
        "stock": 60,
        "imagen_url": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=900&q=80",
    },
]

SUCURSALES_CALI = [
    {"nombre": "Sede Norte", "direccion": "Avenida 6N # 25-40, Santa Mónica", "ciudad": "Cali"},
    {"nombre": "Sede Sur", "direccion": "Carrera 100 # 14-20, Ciudad Jardín", "ciudad": "Cali"},
    {"nombre": "Sede Centro", "direccion": "Calle 11 # 5-30, San Pedro", "ciudad": "Cali"},
]

STOCK_POR_SEDE: dict[str, dict[str, int]] = {
    "Sede Norte": {
        "Sandía": 34,
        "Tomate": 48,
        "Granadilla": 26,
        "Zanahoria": 42,
        "Papa amarilla": 38,
        "Coliflor": 24,
    },
    "Sede Sur": {
        "Sandía": 30,
        "Tomate": 45,
        "Granadilla": 25,
        "Zanahoria": 40,
        "Papa amarilla": 35,
        "Coliflor": 22,
    },
    "Sede Centro": {
        "Sandía": 28,
        "Tomate": 50,
        "Granadilla": 20,
        "Zanahoria": 36,
        "Papa amarilla": 32,
        "Coliflor": 20,
    },
}

OFERTAS_POR_SEDE = [
    ("Sede Norte", "Sandía", Decimal("2700.00"), "Oferta por maduración"),
    ("Sede Norte", "Zanahoria", Decimal("1650.00"), "Cosecha fresca del día"),
    ("Sede Sur", "Granadilla", Decimal("4200.00"), "Oferta por maduración"),
    ("Sede Sur", "Papa amarilla", Decimal("3900.00"), "Descuento de temporada"),
    ("Sede Centro", "Tomate", Decimal("1200.00"), "Oferta por maduración"),
    ("Sede Centro", "Coliflor", Decimal("2750.00"), "Oferta por maduración"),
]


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
                    celular="3154001122",
                    hashed_password=pwd_context.hash(admin_pass),
                    rol="admin",
                ),
                Usuario(
                    nombre="Gerente",
                    correo=os.getenv("SEED_GERENTE_EMAIL", "jsmazuerae@correo.usbcali.edu.co"),
                    celular="3165002233",
                    hashed_password=pwd_context.hash(gerente_pass),
                    rol="gerente",
                ),
                Usuario(
                    nombre="Empleado",
                    correo=os.getenv("SEED_EMPLEADO_EMAIL", "jsmazuma@gmail.com"),
                    celular="3176003344",
                    hashed_password=pwd_context.hash(empleado_pass),
                    rol="empleado",
                ),
            ]
        )
        db.commit()
        print("Usuarios insertados", flush=True)

    # Normalizar o crear las 3 sucursales de Cali (Sede Norte, Sede Sur, Sede Centro)
    renombres_sedes = {
        "Frulex Norte": "Sede Norte",
        "Frulex Sur": "Sede Sur",
        "Frulex Centro": "Sede Centro",
    }
    for viejo, nuevo in renombres_sedes.items():
        suc_vieja = db.scalar(select(Sucursal).where(Sucursal.nombre == viejo))
        suc_nueva = db.scalar(select(Sucursal).where(Sucursal.nombre == nuevo))
        if suc_vieja and not suc_nueva:
            suc_vieja.nombre = nuevo
    db.commit()

    for sede_data in SUCURSALES_CALI:
        existente = db.scalar(select(Sucursal).where(Sucursal.nombre == sede_data["nombre"]))
        if existente:
            existente.direccion = sede_data["direccion"]
            existente.ciudad = sede_data["ciudad"]
            existente.activa = True
        else:
            db.add(Sucursal(**sede_data, activa=True))
    db.commit()

    # Asegurar que el catálogo tenga exactamente los 6 productos obligatorios con sus precios por libra
    nombres_obligatorios = {item["nombre"] for item in CATALOGO_OBLIGATORIO}
    productos_actuales = db.scalars(select(Producto)).all()

    # Si hay productos antiguos que no pertenecen a los 6 obligatorios, sincronizarlos
    antiguos = [p for p in productos_actuales if p.nombre not in nombres_obligatorios]
    for idx, prod_data in enumerate(CATALOGO_OBLIGATORIO):
        existente = db.scalar(select(Producto).where(Producto.nombre == prod_data["nombre"]))
        if existente:
            existente.precio = prod_data["precio"]
            existente.categoria = prod_data["categoria"]
            existente.unidad = prod_data["unidad"]
            existente.imagen_url = prod_data["imagen_url"]
            if not existente.stock or existente.stock <= 0:
                existente.stock = prod_data["stock"]
        elif idx < len(antiguos):
            reemplazo = antiguos[idx]
            reemplazo.nombre = prod_data["nombre"]
            reemplazo.precio = prod_data["precio"]
            reemplazo.categoria = prod_data["categoria"]
            reemplazo.unidad = prod_data["unidad"]
            reemplazo.stock = prod_data["stock"]
            reemplazo.imagen_url = prod_data["imagen_url"]
        else:
            db.add(Producto(**prod_data))
    db.commit()

    # Sincronizar inventario positivo por sucursal para los 6 productos
    sucursales = {s.nombre: s for s in db.scalars(select(Sucursal)).all()}
    productos = {p.nombre: p for p in db.scalars(select(Producto)).all()}

    for sede_nombre, mapa_stock in STOCK_POR_SEDE.items():
        sucursal = sucursales.get(sede_nombre)
        if not sucursal:
            continue
        for prod_nombre, cant_inicial in mapa_stock.items():
            producto = productos.get(prod_nombre)
            if not producto:
                continue
            inv = db.scalar(
                select(InventarioSucursal).where(
                    InventarioSucursal.producto_id == producto.id,
                    InventarioSucursal.sucursal_id == sucursal.id,
                )
            )
            if inv is None:
                db.add(
                    InventarioSucursal(
                        producto_id=producto.id,
                        sucursal_id=sucursal.id,
                        stock=cant_inicial,
                    )
                )
            elif inv.stock <= 0:
                inv.stock = cant_inicial
    db.commit()

    # Sincronizar ofertas por maduración en cada sede
    for sede_nombre, prod_nombre, precio_oferta, etiqueta in OFERTAS_POR_SEDE:
        sucursal = sucursales.get(sede_nombre)
        producto = productos.get(prod_nombre)
        if not sucursal or not producto:
            continue
        oferta_existente = db.scalar(
            select(Oferta).where(
                Oferta.producto_id == producto.id,
                Oferta.sucursal_id == sucursal.id,
            )
        )
        if oferta_existente:
            oferta_existente.precio_oferta = precio_oferta
            oferta_existente.etiqueta = etiqueta
            oferta_existente.activa = True
        else:
            db.add(
                Oferta(
                    producto_id=producto.id,
                    sucursal_id=sucursal.id,
                    precio_oferta=precio_oferta,
                    etiqueta=etiqueta,
                    activa=True,
                )
            )
    db.commit()
    print("Catálogo Frulex Cali (6 productos, 3 sedes, inventarios y ofertas) sincronizado", flush=True)
