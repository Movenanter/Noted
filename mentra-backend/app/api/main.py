# Shim module so `uvicorn app.api.main:app` works.
# The real FastAPI app is defined in app/main.py.
from app.main import app  # re-export

__all__ = ["app"]
