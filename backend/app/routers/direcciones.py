from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Direccion, Usuario
from app.routers.auth import obtener_usuario_actual
from app.schemas.schemas import DireccionCrear, DireccionRespuesta


router = APIRouter(prefix="/direcciones", tags=["Direcciones de entrega"])


@router.get("/", response_model=list[DireccionRespuesta])
def listar_direcciones(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> list[Direccion]:
    query = select(Direccion).where(Direccion.usuario_id == usuario.id).order_by(Direccion.id)
    return list(db.scalars(query).all())


@router.post("/", response_model=DireccionRespuesta, status_code=status.HTTP_201_CREATED)
def crear_direccion(
    datos: DireccionCrear,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> Direccion:
    direccion = Direccion(
        usuario_id=usuario.id,
        alias=datos.alias.strip(),
        direccion=datos.direccion.strip(),
        ciudad=datos.ciudad.strip(),
        referencia=(datos.referencia or "").strip() or None,
    )
    db.add(direccion)
    db.commit()
    db.refresh(direccion)
    return direccion


@router.delete("/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_direccion(
    direccion_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obtener_usuario_actual),
) -> None:
    direccion = db.get(Direccion, direccion_id)
    if direccion is None or direccion.usuario_id != usuario.id:
        raise HTTPException(status_code=404, detail="Dirección no encontrada")
    db.delete(direccion)
    db.commit()
