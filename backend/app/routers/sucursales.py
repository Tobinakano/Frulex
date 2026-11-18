from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Sucursal
from app.schemas.schemas import SucursalRespuesta


router = APIRouter(prefix="/sucursales", tags=["Sucursales"])


@router.get("/", response_model=list[SucursalRespuesta])
def listar_sucursales(db: Session = Depends(get_db)) -> list[Sucursal]:
    """Sucursales activas disponibles para ser seleccionadas como sucursal activa."""
    query = select(Sucursal).where(Sucursal.activa.is_(True)).order_by(Sucursal.nombre)
    return list(db.scalars(query).all())


@router.get("/{sucursal_id}", response_model=SucursalRespuesta)
def obtener_sucursal(sucursal_id: int, db: Session = Depends(get_db)) -> Sucursal:
    sucursal = db.get(Sucursal, sucursal_id)
    if sucursal is None or not sucursal.activa:
        raise HTTPException(status_code=404, detail="Sucursal no encontrada")
    return sucursal
