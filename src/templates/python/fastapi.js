/**
 * TEMPLATE ADAPTER: Python / FastAPI  (src/templates/python/fastapi.js)
 * Cross-language proof-of-concept — same manifest contract, completely
 * different ecosystem (Python, pip, asyncio, SQLAlchemy/Motor).
 */
import { dockerFiles } from '../partials/docker.js';
import { envFiles } from '../partials/env.js';

export async function fastapiAdapter(config) {
  const dbExtras =
    {
      mongodb: 'motor>=3.3.2',
      postgresql: 'asyncpg>=0.29.0\nsqlalchemy[asyncio]>=2.0.23\npsycopg2-binary>=2.9.9',
      sqlite: 'aiosqlite>=0.19.0\nsqlalchemy[asyncio]>=2.0.23',
    }[config.db] || '';

  const files = {
    'requirements.txt': requirements(dbExtras, config),
    'app/__init__.py': '',
    'app/main.py': mainPy(),
    'app/config.py': configPy(),
    'app/database.py': databasePy(config.db),
    'app/routers/__init__.py': '',
    'app/routers/items.py': itemsRouter(),
    'app/controllers/__init__.py': '',
    'app/controllers/items.py': itemsController(),
    'app/services/__init__.py': '',
    'app/services/items.py': itemsService(),
    'app/models/__init__.py': '',
    'app/models/item.py': itemModel(config.db),
    'app/schemas/__init__.py': '',
    'app/schemas/item.py': itemSchema(),
    'app/middleware/__init__.py': '',
    'app/middleware/error.py': errorMiddleware(),
    'app/utils/__init__.py': '',
    'app/utils/response.py': responseUtil(),
    'README.md': readme(),
    ...envFiles(config),
    ...(config.docker ? dockerFiles('python', 'fastapi') : {}),
  };

  return {
    files,
    installCommand: 'pip install -r requirements.txt',
    defaultPort: 8000,
    vars: {},
  };
}

function requirements(dbExtras, _config) {
  return `fastapi>=0.104.1
uvicorn[standard]>=0.24.0
python-dotenv>=1.0.0
pydantic>=2.4.2
pydantic-settings>=2.0.3
${dbExtras}<% if (includeAuth) { %>
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4<% } %>
`;
}

function mainPy() {
  return `"""
<%= projectName %> — FastAPI CRUD Application
Architecture: routers -> controllers -> services -> models
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import items
from app.middleware.error import register_error_handlers
from app.database import lifespan

app = FastAPI(
    title="<%= projectName %>",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(items.router, prefix="/api/v1/items", tags=["items"])
<% if (includeAuth) { %>
from app.routers import auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
<% } %>

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
`;
}

function configPy() {
  return `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str    = "<%= projectName %>"
    database_url: str = ""
    jwt_secret: str  = "change-me-in-production"
    debug: bool      = False

    class Config:
        env_file = ".env"

settings = Settings()
`;
}

function databasePy(db) {
  if (db === 'mongodb') {
    return `from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client: AsyncIOMotorClient = None

@asynccontextmanager
async def lifespan(app):
    global _client
    _client = AsyncIOMotorClient(settings.database_url)
    yield
    _client.close()

def get_db():
    """FastAPI dependency — returns the default Motor database."""
    return _client.get_default_database()
`;
  }
  return `from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    create_async_engine, AsyncSession, async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

engine       = create_async_engine(settings.database_url, echo=settings.debug)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

@asynccontextmanager
async def lifespan(app):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with SessionLocal() as session:
        yield session
`;
}

function itemsRouter() {
  return `from fastapi import APIRouter, Depends
from typing import List
from app.controllers.items import ItemsController
from app.schemas.item import ItemCreate, ItemOut
from app.database import get_db

router = APIRouter()

@router.get("/",      response_model=List[ItemOut])
async def list_items(db=Depends(get_db)):
    return await ItemsController(db).list()

@router.get("/{id}",  response_model=ItemOut)
async def get_item(id: str, db=Depends(get_db)):
    return await ItemsController(db).get(id)

@router.post("/",     response_model=ItemOut, status_code=201)
async def create_item(data: ItemCreate, db=Depends(get_db)):
    return await ItemsController(db).create(data)

@router.put("/{id}",  response_model=ItemOut)
async def update_item(id: str, data: ItemCreate, db=Depends(get_db)):
    return await ItemsController(db).update(id, data)

@router.delete("/{id}", status_code=204)
async def delete_item(id: str, db=Depends(get_db)):
    await ItemsController(db).delete(id)
`;
}

function itemsController() {
  return `from fastapi import HTTPException
from app.services.items import ItemsService
from app.schemas.item import ItemCreate

class ItemsController:
    """HTTP boundary only. Delegates all logic to ItemsService."""

    def __init__(self, db):
        self._svc = ItemsService(db)

    async def list(self):
        return await self._svc.find_all()

    async def get(self, id: str):
        item = await self._svc.find_by_id(id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    async def create(self, data: ItemCreate):
        return await self._svc.create(data)

    async def update(self, id: str, data: ItemCreate):
        item = await self._svc.update(id, data)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    async def delete(self, id: str):
        await self._svc.delete(id)
`;
}

function itemsService() {
  return `"""
Business logic layer.
No HTTP context — pure domain operations.
Swap model implementation without touching controller.
"""
from app.models.item import Item
from app.schemas.item import ItemCreate

class ItemsService:
    def __init__(self, db):
        self._db = db

    async def find_all(self):
        return await Item.find_all(self._db)

    async def find_by_id(self, id: str):
        return await Item.find_by_id(self._db, id)

    async def create(self, data: ItemCreate):
        return await Item.create(self._db, data.model_dump())

    async def update(self, id: str, data: ItemCreate):
        return await Item.update(self._db, id, data.model_dump(exclude_unset=True))

    async def delete(self, id: str):
        await Item.delete(self._db, id)
`;
}

function itemModel(db) {
  if (db === 'mongodb') {
    return `from bson import ObjectId
from datetime import datetime, timezone

class Item:
    COLLECTION = "items"

    @staticmethod
    async def find_all(db):
        cursor = db[Item.COLLECTION].find()
        return await cursor.to_list(length=None)

    @staticmethod
    async def find_by_id(db, id: str):
        try:
            return await db[Item.COLLECTION].find_one({"_id": ObjectId(id)})
        except Exception:
            return None

    @staticmethod
    async def create(db, data: dict):
        data["created_at"] = datetime.now(timezone.utc)
        result = await db[Item.COLLECTION].insert_one(data)
        return await db[Item.COLLECTION].find_one({"_id": result.inserted_id})

    @staticmethod
    async def update(db, id: str, data: dict):
        oid = ObjectId(id)
        await db[Item.COLLECTION].update_one({"_id": oid}, {"$set": data})
        return await db[Item.COLLECTION].find_one({"_id": oid})

    @staticmethod
    async def delete(db, id: str):
        await db[Item.COLLECTION].delete_one({"_id": ObjectId(id)})
`;
  }
  return `from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.future import select
import uuid
from app.database import Base

class Item(Base):
    __tablename__ = "items"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String,  nullable=False)
    description = Column(String,  nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    @classmethod
    async def find_all(cls, db):
        result = await db.execute(select(cls))
        return result.scalars().all()

    @classmethod
    async def find_by_id(cls, db, id):
        result = await db.execute(select(cls).where(cls.id == id))
        return result.scalar_one_or_none()

    @classmethod
    async def create(cls, db, data: dict):
        obj = cls(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj

    @classmethod
    async def update(cls, db, id, data: dict):
        obj = await cls.find_by_id(db, id)
        if not obj:
            return None
        for k, v in data.items():
            setattr(obj, k, v)
        await db.commit()
        await db.refresh(obj)
        return obj

    @classmethod
    async def delete(cls, db, id):
        obj = await cls.find_by_id(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()
`;
}

function itemSchema() {
  return `from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ItemOut(ItemCreate):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
`;
}

function errorMiddleware() {
  return `from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

def register_error_handlers(app) -> None:

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {"message": "Validation failed", "details": exc.errors()},
            },
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": {"message": str(exc)}},
        )
`;
}

function responseUtil() {
  return `from typing import Any

def success(data: Any, status: int = 200):
    return {"success": True, "data": data}

def error(message: str, status: int = 400):
    return {"success": False, "error": {"message": message}}
`;
}

function readme() {
  return `# <%= projectName %>

> Scaffolded by **crud-scaffold** — FastAPI / <%= db %>

## Quick Start
\`\`\`bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
\`\`\`

Interactive docs: http://localhost:8000/docs
`;
}
