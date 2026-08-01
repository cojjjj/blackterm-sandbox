from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="BLACKTERM // SANDBOX",
    version="0.1.0",
    description="Safe malware-behavior replay and analysis API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "BLACKTERM // SANDBOX",
        "version": "0.1.0",
        "mode": "safe behavioral replay",
        "docs": "/docs",
    }
