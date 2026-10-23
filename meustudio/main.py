"""
Meu Studio — Backend
FastAPI + pytrends + RSS feeds + persistência local
"""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json, time, logging
from pathlib import Path
from pytrends.request import TrendReq
import feedparser
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("meustudio")

app = FastAPI(title="Meu Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path("user_data.json")
CACHE: dict = {}
CACHE_TTL = 600  # 10 minutos


def load_data():
    if DATA_FILE.exists():
        try:
            return json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_data(data: dict):
    existing = load_data()
    existing.update(data)
    DATA_FILE.write_text(json.dumps(existing, ensure_ascii=False, indent=2), encoding="utf-8")


def cached(key: str, fn, ttl: int = CACHE_TTL):
    now = time.time()
    if key in CACHE and now - CACHE[key]["ts"] < ttl:
        return CACHE[key]["v"]
    v = fn()
    CACHE[key] = {"v": v, "ts": now}
    return v


def pytrends_client():
    return TrendReq(hl="pt-BR", tz=180, timeout=(10, 30), retries=2, backoff_factor=0.5)


# ── Google Trends (web geral) ──────────────────────────────────────────
@app.get("/api/trends")
async def trends(keywords: str = "edição de vídeo,DaVinci Resolve,Adobe Premiere"):
    kws = [k.strip() for k in keywords.split(",") if k.strip()][:5]
    cache_key = "trends_" + "_".join(kws)

    def fetch():
        try:
            pt = pytrends_client()
            pt.build_payload(kws, timeframe="today 3-m", geo="BR")
            df = pt.interest_over_time()
            if df.empty:
                return {"data": [], "dates": [], "error": None}
            weeks = df.index[-12:].tolist()
            result = []
            for kw in kws:
                if kw in df.columns:
                    vals = [int(v) for v in df[kw].tolist()[-12:]]
                    result.append({
                        "keyword": kw,
                        "values": vals,
                        "avg": round(sum(vals) / len(vals)) if vals else 0,
                        "trend": "subindo" if len(vals) > 1 and vals[-1] > vals[0] else "descendo",
                    })
            return {"data": result, "dates": [str(d.date()) for d in weeks], "error": None}
        except Exception as e:
            log.error(f"Trends error: {e}")
            return {"data": [], "dates": [], "error": str(e)}

    return cached(cache_key, fetch)


# ── Google Trends (YouTube específico) ────────────────────────────────
@app.get("/api/trends/youtube")
async def youtube_trends(keywords: str = "edição de vídeo,tutorial edição"):
    kws = [k.strip() for k in keywords.split(",") if k.strip()][:3]
    cache_key = "yt_" + "_".join(kws)

    def fetch():
        try:
            pt = pytrends_client()
            pt.build_payload(kws, timeframe="today 3-m", geo="BR", gprop="youtube")
            df = pt.interest_over_time()
            if df.empty:
                return {"data": [], "dates": [], "error": None}
            result = []
            for kw in kws:
                if kw in df.columns:
                    vals = [int(v) for v in df[kw].tolist()[-8:]]
                    result.append({"keyword": kw, "values": vals, "avg": round(sum(vals) / len(vals)) if vals else 0})
            return {"data": result, "dates": [str(d.date()) for d in df.index[-8:]], "error": None}
        except Exception as e:
            log.error(f"YT Trends error: {e}")
            return {"data": [], "dates": [], "error": str(e)}

    return cached(cache_key, fetch)


# ── Buscas relacionadas ────────────────────────────────────────────────
@app.get("/api/trends/relacionados")
async def related(keyword: str = "edição de vídeo"):
    cache_key = "rel_" + keyword

    def fetch():
        try:
            pt = pytrends_client()
            pt.build_payload([keyword], timeframe="today 3-m", geo="BR")
            rel = pt.related_queries()
            result = {}
            for k, v in rel.items():
                if v:
                    if v.get("top") is not None:
                        result["top"] = v["top"].head(10)[["query", "value"]].to_dict("records")
                    if v.get("rising") is not None:
                        result["rising"] = v["rising"].head(10)[["query", "value"]].to_dict("records")
            return result
        except Exception as e:
            return {"error": str(e)}

    return cached(cache_key, fetch)


# ── Trending searches Brasil agora ────────────────────────────────────
@app.get("/api/trends/hoje")
async def trending_today():
    def fetch():
        try:
            pt = pytrends_client()
            df = pt.trending_searches(pn="brazil")
            return {"trending": df[0].tolist()[:20], "error": None}
        except Exception as e:
            return {"trending": [], "error": str(e)}

    return cached("hoje", fetch, ttl=300)


# ── Notícias via RSS (5 fontes audiovisual) ───────────────────────────
RSS_FEEDS = [
    ("No Film School",    "https://nofilmschool.com/feed"),
    ("Videomaker",        "https://www.videomaker.com/feed/"),
    ("Cinema5D",          "https://www.cinema5d.com/feed/"),
    ("PremiumBeat Blog",  "https://www.premiumbeat.com/blog/feed/"),
    ("Motion Array Blog", "https://motionarray.com/blog/feed/"),
]


@app.get("/api/noticias")
async def noticias():
    def fetch():
        articles = []
        for source_name, url in RSS_FEEDS:
            try:
                feed = feedparser.parse(url)
                for entry in feed.entries[:4]:
                    summary = entry.get("summary", "")
                    if summary:
                        soup = BeautifulSoup(summary, "html.parser")
                        summary = soup.get_text()[:220]
                    articles.append({
                        "title":     entry.get("title", ""),
                        "link":      entry.get("link", ""),
                        "summary":   summary,
                        "published": entry.get("published", ""),
                        "source":    source_name,
                    })
            except Exception as e:
                log.warning(f"RSS error {url}: {e}")
        return {"articles": articles[:25], "error": None}

    return cached("noticias", fetch, ttl=1800)


# ── Persistência de dados do usuário (JSON local) ─────────────────────
@app.get("/api/dados")
async def get_dados():
    return load_data()


@app.post("/api/dados")
async def post_dados(request: Request):
    body = await request.json()
    save_data(body)
    return {"ok": True}


# ── Health check ───────────────────────────────────────────────────────
@app.get("/api/status")
async def status():
    return {"status": "ok", "version": "2.0", "cached_keys": list(CACHE.keys())}


# ── Serve o frontend (static/index.html) ──────────────────────────────
app.mount("/", StaticFiles(directory="static", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    print("\n🎬 Meu Studio iniciando em http://localhost:8000\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
