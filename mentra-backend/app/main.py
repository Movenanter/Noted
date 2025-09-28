from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .api.routes import router
from .db.session import engine
from .db.base import Base
from .models import entities as _entities  # noqa: F401 - ensure models are registered
from contextlib import asynccontextmanager


def create_app() -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # For demo: ensure tables exist if Alembic not yet run
        Base.metadata.create_all(bind=engine)
        yield

    app = FastAPI(title="Mentra Backend", version="0.1.0", lifespan=lifespan)

    app.include_router(router)

    @app.exception_handler(Exception)
    async def unhandled_exc(_: Request, exc: Exception):
        return JSONResponse(status_code=500, content={"detail": str(exc), "code": "internal_error"})

    return app


app = create_app()
