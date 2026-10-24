"""B3 — Camada de IA: única porta de saída para o Gemini."""
import asyncio, logging, random
from typing import Any

log = logging.getLogger("meustudio")

try:
    from google import genai as genai_client
    from google.genai import types as genai_types
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODELS, AI_MAX_OUTPUT_TOKENS


async def call_gemini(contents: Any, system_instruction: str) -> str:
    """Chama o Gemini com retry/fallback. Devolve texto não-vazio ou levanta excepção."""
    if not HAS_GEMINI:
        raise RuntimeError("google-genai não instalado")

    client = genai_client.Client(api_key=GEMINI_API_KEY)
    models_to_try = [GEMINI_MODEL] + [m for m in GEMINI_FALLBACK_MODELS if m != GEMINI_MODEL]
    last_err: BaseException | None = None

    for model in models_to_try:
        skip_retry = False
        for attempt in range(3):
            if skip_retry and attempt > 0:
                break
            try:
                response = await client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=genai_types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        max_output_tokens=AI_MAX_OUTPUT_TOKENS,
                    ),
                )
                if not response.text or not response.text.strip():
                    last_err = ValueError("Resposta vazia da IA")
                    break
                return response.text
            except Exception as e:
                last_err = e
                code = getattr(e, "status_code", None) or getattr(e, "code", None)
                # Erros não-retentáveis: falhar imediatamente
                if code in (400, 401, 403, 404):
                    raise
                # 429: distinguir cota diária (RPD) de limite por minuto (RPM/TPM)
                if code == 429:
                    if "PerDay" in str(e):
                        # Cota diária esgotada — tentar próximo modelo uma vez, sem retry
                        skip_retry = True
                        break
                    # Limite por minuto — backoff exponencial + jitter
                    if attempt < 2:
                        await asyncio.sleep((2 ** attempt) * 1.5 + random.uniform(0, 0.5))
                        continue
                    break
                # Erros de servidor — retry com backoff linear
                if code in (500, 503, 504) and attempt < 2:
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                break

    log.error("Gemini falhou em todos os modelos: %s", last_err)
    raise last_err if last_err else RuntimeError("IA indisponível")
