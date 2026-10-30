from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import Usuario
from app.schemas.schemas import LoginUsuario, RegistroUsuario, TokenRespuesta, UsuarioRespuesta


router = APIRouter(prefix="/auth", tags=["Autenticación"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def crear_token(usuario_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": str(usuario_id), "exp": expires_at},
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        subject = payload.get("sub")
        if not subject:
            raise credentials_error
        usuario = db.get(Usuario, int(subject))
    except (JWTError, ValueError):
        raise credentials_error from None
    if usuario is None:
        raise credentials_error
    return usuario


@router.post("/registro", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: RegistroUsuario, db: Session = Depends(get_db)) -> Usuario:
    existente = db.scalar(select(Usuario).where(Usuario.correo == datos.correo))
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo")
    usuario = Usuario(
        nombre=datos.nombre.strip(),
        correo=str(datos.correo).lower(),
        hashed_password=pwd_context.hash(datos.password),
        rol="cliente",
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.post("/login", response_model=TokenRespuesta)
def iniciar_sesion(datos: LoginUsuario, db: Session = Depends(get_db)) -> TokenRespuesta:
    usuario = db.scalar(select(Usuario).where(Usuario.correo == str(datos.correo).lower()))
    if usuario is None or not pwd_context.verify(datos.password, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return TokenRespuesta(access_token=crear_token(usuario.id), usuario=usuario)


@router.get("/me", response_model=UsuarioRespuesta)
def obtener_perfil(usuario: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
    return usuario
