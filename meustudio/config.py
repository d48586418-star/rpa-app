"""B1 — Configuração centralizada: única fonte de leitura de variáveis de ambiente."""
import os, logging
from pathlib import Path

BASE_DIR   = Path(__file__).parent
DATA_DIR   = BASE_DIR / "data"
LOG_DIR    = DATA_DIR / "logs"
BACKUP_DIR = DATA_DIR / "backups"

# Gemini / IA
GEMINI_API_KEY       = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL         = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS = [
    m.strip()
    for m in os.environ.get("GEMINI_FALLBACK_MODELS", "").split(",")
    if m.strip()
]
AI_DAILY_BUDGET      = int(os.environ.get("AI_DAILY_BUDGET", "15"))
AI_TIMEOUT_S         = int(os.environ.get("AI_TIMEOUT_S", "60"))
AI_MAX_OUTPUT_TOKENS = int(os.environ.get("AI_MAX_OUTPUT_TOKENS", "4096"))

# Servidor
HOST   = os.environ.get("HOST", "127.0.0.1")
PORT   = int(os.environ.get("PORT", "8000"))
RELOAD = os.environ.get("RELOAD", "0") == "1"

# Integrações opcionais
YOUTUBE_API_KEY  = os.environ.get("YOUTUBE_API_KEY", "")
GOOGLE_CSE_KEY   = os.environ.get("GOOGLE_CSE_KEY", "")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")


def log_startup(logger: logging.Logger) -> None:
    """Regista integrações configuradas mascarando segredos."""
    def mask(v: str) -> str:
        return f"ok (…{v[-4:]})" if len(v) >= 4 else ("ok" if v else "ausente")

    logger.info(
        "Config: GEMINI_API_KEY=%s model=%s fallbacks=%d budget=%d/dia",
        mask(GEMINI_API_KEY), GEMINI_MODEL, len(GEMINI_FALLBACK_MODELS), AI_DAILY_BUDGET,
    )
    logger.info(
        "Config: YOUTUBE=%s GOOGLE_CSE=%s CALENDAR=%s",
        bool(YOUTUBE_API_KEY), bool(GOOGLE_CSE_KEY), bool(GOOGLE_CLIENT_ID),
    )
