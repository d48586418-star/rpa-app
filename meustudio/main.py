"""
Meu Studio v2 — Sistema Operacional de Carreira
FastAPI + SQLite + Motor de Análise + Motor Financeiro
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import json, time, logging, sqlite3
from pathlib import Path
from contextlib import contextmanager
from typing import Optional
import feedparser, requests
from bs4 import BeautifulSoup

try:
    from pytrends.request import TrendReq
    HAS_PYTRENDS = True
except ImportError:
    HAS_PYTRENDS = False

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("meustudio")

app = FastAPI(title="Meu Studio API v2")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_PATH = Path("studio.db")
CACHE: dict = {}

# ── DATABASE ───────────────────────────────────────────────────────
def init_db():
    with sqlite3.connect(DB_PATH) as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY DEFAULT 1,
            data TEXT NOT NULL DEFAULT '{}',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS diagnostic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stage TEXT NOT NULL,
            question_id TEXT NOT NULL,
            answer TEXT NOT NULL,
            label TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS financial_data (
            id INTEGER PRIMARY KEY DEFAULT 1,
            data TEXT NOT NULL DEFAULT '{}',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            rationale TEXT,
            context TEXT,
            outcome TEXT,
            date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS research_cache (
            cache_key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            expires_at REAL NOT NULL
        );
        INSERT OR IGNORE INTO profile (id, data) VALUES (1, '{}');
        INSERT OR IGNORE INTO financial_data (id, data) VALUES (1, '{}');
        """)
    log.info("DB initialised at %s", DB_PATH)

init_db()

@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def cached(key: str, fn, ttl: int = 600):
    now = time.time()
    with db() as c:
        row = c.execute("SELECT data, expires_at FROM research_cache WHERE cache_key=?", (key,)).fetchone()
        if row and now < row["expires_at"]:
            return json.loads(row["data"])
    v = fn()
    with db() as c:
        c.execute("INSERT OR REPLACE INTO research_cache VALUES (?,?,?)", (key, json.dumps(v), now + ttl))
    return v

# ── CAREER ANALYSIS ENGINE ────────────────────────────────────────
CAREER_PATHS = {
    "freelancer_premium": {
        "name": "Freelancer Premium",
        "icon": "✂️",
        "desc": "Edição high-end para clientes nacionais e internacionais, com foco em qualidade e recorrência.",
        "time_to_revenue": "1–3 meses",
        "monthly_potential": "R$ 4.000–12.000",
        "risk": "baixo",
        "investment": "R$ 0–500",
        "signals": ["executar", "editor_freelance", "editor_empresa"],
        "boosts": {"b4": "sim", "b2": "tecnica", "a3": "clientes"},
        "penalties": {"a2": "ensinar", "d3": "muito"},
        "gaps": {
            "portf_fraco": "Construir portfólio internacional",
            "nao_divulga": "Estratégia de prospecção ativa",
            "b4_nao": "Desenvolver inglês profissional",
        }
    },
    "educador_digital": {
        "name": "Educadora Digital",
        "icon": "🎓",
        "desc": "Cursos, workshops e mentorias transformando conhecimento em produtos escaláveis.",
        "time_to_revenue": "2–4 meses",
        "monthly_potential": "R$ 3.000–15.000",
        "risk": "médio",
        "investment": "R$ 500–2.000",
        "signals": ["ensinar", "criar"],
        "boosts": {"d2": "muito", "d1": "sim_varios", "d1": "sim_1_2"},
        "penalties": {"a2": "executar"},
        "gaps": {
            "sem_publico": "Construir audiência antes de lançar",
            "sem_produto": "Definir e estruturar o produto educacional",
        }
    },
    "criador_conteudo": {
        "name": "Criadora de Conteúdo",
        "icon": "📺",
        "desc": "Canal próprio com audiência engajada, monetização via AdSense, patrocínios e produtos.",
        "time_to_revenue": "6–12 meses",
        "monthly_potential": "R$ 2.000–20.000+",
        "risk": "alto",
        "investment": "R$ 200–1.000",
        "signals": ["criar", "estrategia"],
        "boosts": {"d3": "muito", "d2": "muito", "a2": "criar"},
        "penalties": {"e1": "urgente_3m", "e2": "baixo"},
        "gaps": {
            "sem_audiencia": "Crescimento de audiência leva tempo",
            "sem_nicho": "Definir nicho antes de começar",
        }
    },
    "empreendedor_audiovisual": {
        "name": "Empreendedora Audiovisual",
        "icon": "🚀",
        "desc": "Negócio próprio combinando serviços, produtos digitais e posicionamento de marca.",
        "time_to_revenue": "3–6 meses",
        "monthly_potential": "R$ 6.000–25.000+",
        "risk": "alto",
        "investment": "R$ 1.000–5.000",
        "signals": ["estrategia"],
        "boosts": {"a3": "propria_empresa", "e2": "alto", "a2": "estrategia"},
        "penalties": {"e1": "urgente_3m", "e2": "baixo"},
        "gaps": {
            "sem_estrutura": "Formalização e estrutura de negócio",
            "sem_capital": "Capital inicial necessário",
        }
    },
}

def score_career_paths(answers: dict) -> list:
    scored = []
    for path_id, path in CAREER_PATHS.items():
        score = 50  # base
        reasons = []
        gaps = []

        # Signals (primary indicators)
        a2 = answers.get("a2", "")
        if a2 in path["signals"]:
            score += 25
            reasons.append(f"Perfil energético alinhado ({a2})")

        a1 = answers.get("a1", "")
        if a1 in path["signals"]:
            score += 10

        # Boosts
        for qid, val in path["boosts"].items():
            if answers.get(qid) == val:
                score += 15
                reasons.append(f"Forte indicador: {qid}={val}")

        # Penalties
        for qid, val in path["penalties"].items():
            if answers.get(qid) == val:
                score -= 20

        # Risk tolerance alignment
        e2 = answers.get("e2", "moderado")
        if path["risk"] == "alto" and e2 == "baixo":
            score -= 25
        if path["risk"] == "baixo" and e2 == "alto":
            score -= 5
        if path["risk"] == e2:
            score += 10

        # Urgency vs time-to-revenue
        e1 = answers.get("e1", "em_6m")
        if e1 == "urgente_3m" and path_id == "criador_conteudo":
            score -= 30
            gaps.append("Canal leva 6–12 meses para gerar renda significativa")

        # Investment capacity
        e3 = answers.get("e3", "ate_500")
        if path["investment"].startswith("R$ 1.000") and e3 == "nada":
            score -= 15
            gaps.append("Investimento inicial necessário")

        # English bonus for freelancer
        if path_id == "freelancer_premium":
            if answers.get("b4") == "sim":
                score += 15
                reasons.append("Inglês fluente — mercado internacional aberto")
            elif answers.get("b4") == "nao":
                score -= 10
                gaps.append("Inglês profissional para clientes internacionais")

        # Teaching interest for educator
        if path_id == "educador_digital":
            if answers.get("d2") == "muito":
                score += 20
                reasons.append("Alto interesse em ensinar")
            elif answers.get("d2") == "nao":
                score -= 30

        # Content creation interest
        if path_id == "criador_conteudo":
            d3 = answers.get("d3", "")
            if d3 == "muito":
                score += 20
            elif d3 == "nao":
                score -= 30

        # Authorial projects
        if answers.get("d1") in ["sim_varios", "sim_1_2"]:
            if path_id in ["criador_conteudo", "empreendedor_audiovisual"]:
                score += 10
                reasons.append("Projetos autorais existentes")

        score = max(0, min(100, score))
        scored.append({
            **path,
            "id": path_id,
            "score": score,
            "reasons": reasons[:3],
            "gaps": gaps,
            "recommended": False,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    if scored:
        scored[0]["recommended"] = True
    return scored


def calculate_financial_scenarios(data: dict) -> dict:
    """
    Generates conservative/base/optimistic scenarios.
    All calculations explicit and auditable.
    """
    price = float(data.get("price_per_project", 0))
    hours_per_project = float(data.get("hours_per_project", 10))
    hours_available = float(data.get("hours_per_month", 80))
    conversion_rate = float(data.get("conversion_rate", 0.10))
    fixed_costs = float(data.get("fixed_costs", 0))
    current_income = float(data.get("current_income", 0))
    goal = float(data.get("income_goal", 6000))

    max_projects = int(hours_available / hours_per_project) if hours_per_project > 0 else 0

    def scenario(multiplier_price, multiplier_projects, multiplier_conv):
        p = price * multiplier_price
        n = int(max_projects * multiplier_projects)
        conv = conversion_rate * multiplier_conv
        revenue = p * n
        contacts_needed = int(n / conv) if conv > 0 else 0
        net = revenue - fixed_costs
        goal_pct = (revenue / goal * 100) if goal > 0 else 0
        breakeven_clients = int(fixed_costs / p) + 1 if p > 0 else 0
        return {
            "price": round(p, 2),
            "projects": n,
            "revenue": round(revenue, 2),
            "net_revenue": round(net, 2),
            "contacts_needed": contacts_needed,
            "goal_percent": round(goal_pct, 1),
            "breakeven_clients": breakeven_clients,
        }

    return {
        "conservative": scenario(0.8, 0.6, 0.7),
        "base": scenario(1.0, 1.0, 1.0),
        "optimistic": scenario(1.2, 1.0, 1.5),
        "max_capacity": max_projects,
        "current_gap": round(goal - current_income, 2),
        "roi_estimate": round((goal - fixed_costs) / max(fixed_costs, 1) * 100, 1),
    }


# ── PROFILE ───────────────────────────────────────────────────────
@app.get("/api/profile")
async def get_profile():
    with db() as c:
        row = c.execute("SELECT data FROM profile WHERE id=1").fetchone()
        return json.loads(row["data"]) if row else {}

@app.put("/api/profile")
async def update_profile(request: Request):
    body = await request.json()
    with db() as c:
        c.execute("UPDATE profile SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=1",
                  (json.dumps(body),))
    return {"ok": True}


# ── DIAGNOSTIC ────────────────────────────────────────────────────
@app.get("/api/diagnostic")
async def get_diagnostic():
    with db() as c:
        rows = c.execute("SELECT * FROM diagnostic ORDER BY id").fetchall()
        return {"answers": [dict(r) for r in rows]}

@app.post("/api/diagnostic/answer")
async def save_answer(request: Request):
    body = await request.json()
    with db() as c:
        c.execute("INSERT OR REPLACE INTO diagnostic (stage, question_id, answer, label) VALUES (?,?,?,?)",
                  (body["stage"], body["question_id"], body["answer"], body.get("label", "")))
    return {"ok": True}

@app.delete("/api/diagnostic")
async def reset_diagnostic():
    with db() as c:
        c.execute("DELETE FROM diagnostic")
    return {"ok": True}

@app.post("/api/analysis/career")
async def career_analysis(request: Request):
    body = await request.json()
    answers = body.get("answers", {})
    paths = score_career_paths(answers)
    return {"paths": paths, "top": paths[0] if paths else None}

@app.post("/api/analysis/finances")
async def financial_analysis(request: Request):
    body = await request.json()
    return calculate_financial_scenarios(body)


# ── PROJECTS ──────────────────────────────────────────────────────
@app.get("/api/projects")
async def get_projects():
    with db() as c:
        rows = c.execute("SELECT * FROM projects ORDER BY created_at DESC").fetchall()
        return [json.loads(r["data"]) | {"id": r["id"]} for r in rows]

@app.post("/api/projects")
async def create_project(request: Request):
    body = await request.json()
    pid = body.get("id") or f"p{int(time.time()*1000)}"
    with db() as c:
        c.execute("INSERT OR REPLACE INTO projects (id, data) VALUES (?,?)", (pid, json.dumps(body)))
    return {"id": pid, "ok": True}

@app.put("/api/projects/{pid}")
async def update_project(pid: str, request: Request):
    body = await request.json()
    with db() as c:
        c.execute("UPDATE projects SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                  (json.dumps(body), pid))
    return {"ok": True}

@app.delete("/api/projects/{pid}")
async def delete_project(pid: str):
    with db() as c:
        c.execute("DELETE FROM projects WHERE id=?", (pid,))
    return {"ok": True}


# ── FINANCES ──────────────────────────────────────────────────────
@app.get("/api/finances")
async def get_finances():
    with db() as c:
        row = c.execute("SELECT data FROM financial_data WHERE id=1").fetchone()
        return json.loads(row["data"]) if row else {}

@app.put("/api/finances")
async def update_finances(request: Request):
    body = await request.json()
    with db() as c:
        c.execute("UPDATE financial_data SET data=?, updated_at=CURRENT_TIMESTAMP WHERE id=1",
                  (json.dumps(body),))
    return {"ok": True}


# ── DECISIONS ─────────────────────────────────────────────────────
@app.get("/api/decisions")
async def get_decisions():
    with db() as c:
        rows = c.execute("SELECT * FROM decisions ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/decisions")
async def add_decision(request: Request):
    body = await request.json()
    with db() as c:
        c.execute("INSERT INTO decisions (description, rationale, context, outcome, date) VALUES (?,?,?,?,?)",
                  (body.get("description",""), body.get("rationale",""),
                   body.get("context",""), body.get("outcome",""), body.get("date","")))
    return {"ok": True}


# ── EXPORT ────────────────────────────────────────────────────────
@app.get("/api/export")
async def export_data():
    with db() as c:
        profile = json.loads(c.execute("SELECT data FROM profile WHERE id=1").fetchone()["data"])
        diagnostic = [dict(r) for r in c.execute("SELECT * FROM diagnostic ORDER BY id").fetchall()]
        projects = [json.loads(r["data"]) for r in c.execute("SELECT data FROM projects").fetchall()]
        finances = json.loads(c.execute("SELECT data FROM financial_data WHERE id=1").fetchone()["data"])
        decisions = [dict(r) for r in c.execute("SELECT * FROM decisions ORDER BY id").fetchall()]
    return {
        "exported_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "profile": profile,
        "diagnostic": diagnostic,
        "projects": projects,
        "finances": finances,
        "decisions": decisions,
    }

@app.post("/api/import")
async def import_data(request: Request):
    body = await request.json()
    with db() as c:
        if "profile" in body:
            c.execute("UPDATE profile SET data=? WHERE id=1", (json.dumps(body["profile"]),))
        if "finances" in body:
            c.execute("UPDATE financial_data SET data=? WHERE id=1", (json.dumps(body["finances"]),))
        if "projects" in body:
            for p in body["projects"]:
                c.execute("INSERT OR REPLACE INTO projects (id, data) VALUES (?,?)",
                          (p.get("id", f"imp{int(time.time()*1000)}"), json.dumps(p)))
    return {"ok": True}


# ── RESEARCH ──────────────────────────────────────────────────────
def pytrends_client():
    if not HAS_PYTRENDS:
        return None
    from pytrends.request import TrendReq
    return TrendReq(hl="pt-BR", tz=180, timeout=(10, 30), retries=2, backoff_factor=0.5)

@app.get("/api/research/trends")
async def trends(keywords: str = "edição de vídeo,DaVinci Resolve,Adobe Premiere"):
    kws = [k.strip() for k in keywords.split(",") if k.strip()][:5]
    key = "trends_" + "_".join(kws)
    def fetch():
        try:
            pt = pytrends_client()
            if not pt:
                return {"data": [], "dates": [], "error": "pytrends not installed"}
            pt.build_payload(kws, timeframe="today 3-m", geo="BR")
            df = pt.interest_over_time()
            if df.empty:
                return {"data": [], "dates": [], "error": None}
            result = []
            for kw in kws:
                if kw in df.columns:
                    vals = [int(v) for v in df[kw].tolist()[-12:]]
                    result.append({"keyword": kw, "values": vals,
                                   "avg": round(sum(vals)/len(vals)) if vals else 0,
                                   "trend": "subindo" if len(vals)>1 and vals[-1]>vals[0] else "descendo"})
            return {"data": result, "dates": [str(d.date()) for d in df.index[-12:]], "error": None}
        except Exception as e:
            return {"data": [], "dates": [], "error": str(e)}
    return cached(key, fetch)

@app.get("/api/research/hoje")
async def trending_today():
    def fetch():
        try:
            pt = pytrends_client()
            if not pt:
                return {"trending": [], "error": "pytrends not available"}
            df = pt.trending_searches(pn="brazil")
            return {"trending": df[0].tolist()[:20], "error": None}
        except Exception as e:
            return {"trending": [], "error": str(e)}
    return cached("hoje", fetch, ttl=300)

RSS_FEEDS = [
    ("No Film School", "https://nofilmschool.com/feed"),
    ("Videomaker", "https://www.videomaker.com/feed/"),
    ("Cinema5D", "https://www.cinema5d.com/feed/"),
    ("PremiumBeat", "https://www.premiumbeat.com/blog/feed/"),
    ("Motion Array", "https://motionarray.com/blog/feed/"),
]

@app.get("/api/research/noticias")
async def noticias():
    def fetch():
        articles = []
        for name, url in RSS_FEEDS:
            try:
                feed = feedparser.parse(url)
                for e in feed.entries[:4]:
                    summary = e.get("summary", "")
                    if summary:
                        summary = BeautifulSoup(summary, "html.parser").get_text()[:220]
                    articles.append({"title": e.get("title",""), "link": e.get("link",""),
                                     "summary": summary, "published": e.get("published",""), "source": name})
            except Exception as ex:
                log.warning("RSS %s: %s", url, ex)
        return {"articles": articles[:25]}
    return cached("noticias", fetch, ttl=1800)

@app.get("/api/research/youtube")
async def youtube_research(q: str = "video editing tutorial", lang: str = "pt"):
    """YouTube Data API stub — requires API key configuration."""
    return {
        "status": "needs_api_key",
        "message": "Configure YOUTUBE_API_KEY no painel de conexões para ativar pesquisa no YouTube.",
        "results": [],
        "query": q,
    }


# ── STATUS ────────────────────────────────────────────────────────
@app.get("/api/status")
async def status():
    import os
    return {
        "status": "ok",
        "version": "2.0",
        "db": str(DB_PATH),
        "pytrends": HAS_PYTRENDS,
        "youtube_api": bool(os.environ.get("YOUTUBE_API_KEY")),
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("\n🎬 Meu Studio v2 em http://localhost:8000\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
