from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..core.database import get_db
from ..core.config import settings
from ..core.security import verify_password, get_password_hash, create_access_token, ALGORITHM
from ..models.user import User
from ..schemas.auth import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Extraction token schema
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """Dependency to retrieve currently authenticated user via JWT headers."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_analyst(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new security analyst credentials record."""
    # Check username
    db_user = db.query(User).filter(User.username == request.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered on network."
        )
        
    # Check email
    db_email = db.query(User).filter(User.email == request.email).first()
    if db_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered on network."
        )
        
    # Standard roles validation
    role = request.role.lower()
    if role not in ["admin", "analyst"]:
        role = "analyst"
        
    # Create user
    hashed_password = get_password_hash(request.password)
    user = User(
        username=request.username,
        email=request.email,
        hashed_password=hashed_password,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
def login_session(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Verifies analyst credentials and establishes JWT authorization session."""
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid analyst username or security key."
        )
        
    # Create JWT
    access_token = create_access_token(subject=user.username)
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def read_current_analyst(current_user: User = Depends(get_current_user)):
    """Retrieves session profile details of current active security analyst."""
    return current_user
