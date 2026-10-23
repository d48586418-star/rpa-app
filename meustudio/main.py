"""
Meu Studio v3 — Sistema Operacional de Carreira de Débora Augusta
FastAPI + SQLite + Motor de Análise + Integrações Externas
"""
from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import json, time, os, logging, sqlite3
from pathlib import Path
from contextlib import contextmanager
import feedparser, requests
from bs4 import BeautifulSoup

# Load .env if present (local dev)
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

try:
    from google_auth_oauthlib.flow import Flow
    from googleapiclient.discovery import build
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request as GRequest
    HAS_GOOGLE_OAUTH = True
except ImportError:
    HAS_GOOGLE_OAUTH = False

try:
    from pytrends.request import TrendReq
    HAS_PYTRENDS = True
except ImportError:
    HAS_PYTRENDS = False

try:
    from google import genai as genai_client
    from google.genai import types as genai_types
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("meustudio")

app = FastAPI(title="Meu Studio API v3")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_PATH = Path("studio.db")

# ── DATABASE ───────────────────────────────────────────────────────
def init_db():
    with sqlite3.connect(DB_PATH) as c:
        # Migrate diagnostic table if old schema (id AUTOINCREMENT, no UNIQUE on question_id)
        cur = c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='diagnostic'")
        row = cur.fetchone()
        if row and 'question_id TEXT PRIMARY KEY' not in row[0]:
            # Save old data
            try:
                old = c.execute("SELECT stage, question_id, answer, label FROM diagnostic").fetchall()
            except Exception:
                old = []
            c.execute("DROP TABLE IF EXISTS diagnostic")
        else:
            old = None

        c.executescript("""
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY DEFAULT 1,
            data TEXT NOT NULL DEFAULT '{}',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS diagnostic (
            question_id TEXT PRIMARY KEY,
            stage TEXT NOT NULL,
            answer TEXT NOT NULL,
            label TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT DEFAULT 'manual',
            project_id TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS results_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            category TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS research_cache (
            cache_key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            expires_at REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS oauth_tokens (
            service TEXT PRIMARY KEY,
            token_data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS ai_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS checklist_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT,
            period TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS references_library (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            url TEXT NOT NULL,
            title TEXT,
            channel TEXT,
            thumbnail TEXT,
            notes TEXT,
            tags TEXT DEFAULT '[]',
            project_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS financial_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            category TEXT,
            date TEXT NOT NULL,
            project_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS ideas (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            type TEXT DEFAULT 'ideia',
            tags TEXT DEFAULT '[]',
            project_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS opportunities (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            organization TEXT,
            category TEXT,
            url TEXT,
            deadline TEXT,
            country TEXT,
            language TEXT,
            notes TEXT,
            status TEXT DEFAULT 'identificada',
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS learning_goals (
            id TEXT PRIMARY KEY,
            competency TEXT NOT NULL,
            current_level INTEGER DEFAULT 1,
            target_level INTEGER DEFAULT 3,
            resources TEXT DEFAULT '[]',
            evidence TEXT,
            status TEXT DEFAULT 'ativa',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        INSERT OR IGNORE INTO profile (id, data) VALUES (1, '{}');
        INSERT OR IGNORE INTO financial_data (id, data) VALUES (1, '{}');
        """)

        # Restore migrated diagnostic data
        if old:
            for stage, qid, answer, label in old:
                try:
                    c.execute(
                        "INSERT OR IGNORE INTO diagnostic (question_id, stage, answer, label) VALUES (?,?,?,?)",
                        (qid, stage, answer, label or "")
                    )
                except Exception:
                    pass

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
        c.execute("INSERT OR REPLACE INTO research_cache VALUES (?,?,?)",
                  (key, json.dumps(v), now + ttl))
    return v

# ── CAREER ANALYSIS ENGINE ────────────────────────────────────────
CAREER_PATHS = {
    "freelancer_premium": {
        "name": "Freelancer Premium",
        "desc": "Edição high-end para clientes nacionais e internacionais, com foco em qualidade e recorrência.",
        "time_to_revenue": "1–3 meses",
        "monthly_potential": "R$ 4.000–12.000",
        "risk": "baixo",
        "investment": "R$ 0–500",
    },
    "educador_digital": {
        "name": "Educadora Digital",
        "desc": "Cursos, workshops e mentorias transformando conhecimento em produtos escaláveis.",
        "time_to_revenue": "2–4 meses",
        "monthly_potential": "R$ 3.000–15.000",
        "risk": "médio",
        "investment": "R$ 500–2.000",
    },
    "criador_conteudo": {
        "name": "Criadora de Conteúdo",
        "desc": "Canal próprio com audiência engajada, monetização via AdSense, patrocínios e produtos.",
        "time_to_revenue": "6–12 meses",
        "monthly_potential": "R$ 2.000–20.000+",
        "risk": "alto",
        "investment": "R$ 200–1.000",
    },
    "empreendedor_audiovisual": {
        "name": "Empreendedora Audiovisual",
        "desc": "Negócio próprio combinando serviços, produtos digitais e posicionamento de marca.",
        "time_to_revenue": "3–6 meses",
        "monthly_potential": "R$ 6.000–25.000+",
        "risk": "alto",
        "investment": "R$ 1.000–5.000",
    },
}

def score_career_paths(answers: dict) -> list:
    scored = []
    for path_id, path in CAREER_PATHS.items():
        score = 50
        reasons = []
        gaps = []

        a2 = answers.get("a1", "")
        signal_map = {
            "freelancer_premium": ["executar"],
            "educador_digital": ["ensinar"],
            "criador_conteudo": ["criar"],
            "empreendedor_audiovisual": ["estrategia"],
        }
        if a2 in signal_map.get(path_id, []):
            score += 25
            reasons.append(f"Perfil energético alinhado com {path['name']}")

        # Risk alignment
        e2 = answers.get("e2", "moderado")
        if path["risk"] == "alto" and e2 == "baixo":
            score -= 25
            gaps.append("Alto risco não alinhado com sua tolerância declarada")
        elif path["risk"] == "baixo" and e2 == "baixo":
            score += 10
        elif path["risk"] == "médio" and e2 == "moderado":
            score += 10

        # Urgency
        e1 = answers.get("e1", "em_6m")
        if e1 == "urgente_3m":
            if path_id == "criador_conteudo":
                score -= 30
                gaps.append("Canal leva 6–12 meses para monetizar")
            elif path_id == "freelancer_premium":
                score += 15
                reasons.append("Retorno rápido — ideal para urgência de 3 meses")

        # Investment
        e3 = answers.get("e3", "ate_500")
        if path_id == "empreendedor_audiovisual" and e3 == "nada":
            score -= 15
            gaps.append("Investimento inicial necessário")

        # English for international market
        if path_id == "freelancer_premium":
            if answers.get("b4") == "fluente":
                score += 15
                reasons.append("Inglês fluente — mercado internacional")
            elif answers.get("b4") in ("basico", "nao"):
                score -= 10
                gaps.append("Desenvolver inglês para mercado internacional")

        # Teaching interest
        if path_id == "educador_digital":
            d2 = answers.get("d2", "")
            if d2 == "muito":
                score += 20
                reasons.append("Alto interesse em ensinar")
            elif d2 == "nao":
                score -= 30
                gaps.append("Interesse em ensinar ausente ou baixo")

        # Content creation drive
        if path_id == "criador_conteudo":
            d3 = answers.get("d3", "")
            if d3 == "muito":
                score += 20
                reasons.append("Alta afinidade com criação de conteúdo")
            elif d3 == "nao":
                score -= 30

        # Entrepreneurial signals
        if path_id == "empreendedor_audiovisual":
            if answers.get("a3") == "propria_empresa":
                score += 20
                reasons.append("Já atua com empresa própria")
            if answers.get("e2") == "alto":
                score += 15

        # Authorial work
        if answers.get("d1") in ["sim_varios", "sim_1_2"]:
            if path_id in ["criador_conteudo", "empreendedor_audiovisual"]:
                score += 10
                reasons.append("Projetos autorais — mentalidade criadora")

        # Years of experience
        anos = answers.get("anos_exp", "")
        if anos in ["5_10", "mais_10"] and path_id == "freelancer_premium":
            score += 10
            reasons.append("Experiência robusta valoriza posicionamento premium")

        # Portfolio strength
        portfolio = answers.get("portfolio_status", "")
        if portfolio == "sim_forte" and path_id in ["freelancer_premium", "empreendedor_audiovisual"]:
            score += 10
            reasons.append("Portfólio sólido disponível")
        elif portfolio == "nao" and path_id == "freelancer_premium":
            score -= 10
            gaps.append("Construir portfólio de cases")

        # Audience
        audiencia = answers.get("audiencia", "")
        if audiencia in ["sim_engajada", "sim_crescendo"] and path_id == "criador_conteudo":
            score += 15
            reasons.append("Audiência existente acelera monetização")

        score = max(0, min(100, score))
        scored.append({
            **path,
            "id": path_id,
            "score": score,
            "reasons": reasons[:3],
            "gaps": gaps[:3],
            "recommended": False,
        })

    scored.sort(key=lambda x: x["score"], reverse=True)
    if scored:
        scored[0]["recommended"] = True
    return scored


def calculate_financial_scenarios(data: dict) -> dict:
    price = float(data.get("price_per_project", 0))
    hours_per_project = float(data.get("hours_per_project", 10))
    hours_available = float(data.get("hours_per_month", 80))
    conversion_rate = float(data.get("conversion_rate", 0.10))
    fixed_costs = float(data.get("fixed_costs", 0))
    current_income = float(data.get("current_income", 0))
    goal = float(data.get("income_goal", 6000))

    max_projects = int(hours_available / hours_per_project) if hours_per_project > 0 else 0

    def scenario(mult_price, mult_proj, mult_conv):
        p = price * mult_price
        n = int(max_projects * mult_proj)
        conv = conversion_rate * mult_conv
        revenue = p * n
        contacts = int(n / conv) if conv > 0 else 0
        net = revenue - fixed_costs
        return {
            "price": round(p, 2),
            "projects": n,
            "revenue": round(revenue, 2),
            "net_revenue": round(net, 2),
            "contacts_needed": contacts,
            "goal_percent": round(revenue / goal * 100, 1) if goal > 0 else 0,
            "breakeven_clients": int(fixed_costs / p) + 1 if p > 0 else 0,
        }

    monthly_projection = []
    for month in range(1, 13):
        ramp = min(1.0, 0.3 + (month - 1) * 0.07)
        proj = round(price * max_projects * ramp, 2)
        monthly_projection.append({"month": month, "projected_revenue": proj})

    return {
        "conservative": scenario(0.8, 0.6, 0.7),
        "base": scenario(1.0, 1.0, 1.0),
        "optimistic": scenario(1.15, 1.0, 1.4),
        "max_capacity": max_projects,
        "current_gap": round(goal - current_income, 2),
        "monthly_projection": monthly_projection,
        "premises": {
            "price": price,
            "hours_per_project": hours_per_project,
            "hours_available": hours_available,
            "conversion_rate": conversion_rate,
            "fixed_costs": fixed_costs,
        }
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
        rows = c.execute("SELECT * FROM diagnostic ORDER BY question_id").fetchall()
        return {"answers": {r["question_id"]: r["answer"] for r in rows}}

@app.post("/api/diagnostic/answer")
async def save_answer(request: Request):
    body = await request.json()
    q_id = body.get("question_id", "")
    if not q_id:
        raise HTTPException(400, "question_id required")
    with db() as c:
        c.execute("""
            INSERT INTO diagnostic (question_id, stage, answer, label)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(question_id) DO UPDATE SET
                stage=excluded.stage, answer=excluded.answer,
                label=excluded.label, updated_at=CURRENT_TIMESTAMP
        """, (q_id, body.get("stage", ""), body.get("answer", ""), body.get("label", "")))
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
        rows = c.execute("SELECT id, data FROM projects ORDER BY created_at DESC").fetchall()
        return [json.loads(r["data"]) | {"id": r["id"]} for r in rows]

@app.post("/api/projects")
async def create_project(request: Request):
    body = await request.json()
    pid = body.get("id") or f"p{int(time.time()*1000)}"
    body["id"] = pid
    with db() as c:
        c.execute("INSERT OR REPLACE INTO projects (id, data) VALUES (?,?)",
                  (pid, json.dumps(body)))
    return {"id": pid, "ok": True}

@app.put("/api/projects/{pid}")
async def update_project(pid: str, request: Request):
    body = await request.json()
    body["id"] = pid
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

@app.get("/api/decisions/{did}")
async def get_decision(did: int):
    with db() as c:
        row = c.execute("SELECT * FROM decisions WHERE id=?", (did,)).fetchone()
        if not row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not found")
        return dict(row)

@app.post("/api/decisions")
async def add_decision(request: Request):
    body = await request.json()
    with db() as c:
        cur = c.execute(
            "INSERT INTO decisions (description, rationale, context, outcome, date) VALUES (?,?,?,?,?)",
            (body.get("description", ""), body.get("rationale", ""),
             body.get("context", ""), body.get("outcome", ""), body.get("date", ""))
        )
    return {"id": cur.lastrowid, "ok": True}

@app.put("/api/decisions/{did}")
async def update_decision(did: int, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE decisions SET description=?, rationale=?, context=?, outcome=?, date=? WHERE id=?",
            (body.get("description", ""), body.get("rationale", ""),
             body.get("context", ""), body.get("outcome", ""), body.get("date", ""), did)
        )
    return {"ok": True}

@app.delete("/api/decisions/{did}")
async def delete_decision(did: int):
    with db() as c:
        c.execute("DELETE FROM decisions WHERE id=?", (did,))
    return {"ok": True}


# ── EVENTS (CALENDAR) ─────────────────────────────────────────────
@app.get("/api/events")
async def get_events():
    with db() as c:
        rows = c.execute("SELECT * FROM events ORDER BY date ASC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/events")
async def add_event(request: Request):
    body = await request.json()
    with db() as c:
        cur = c.execute(
            "INSERT INTO events (title, date, type, project_id, notes) VALUES (?,?,?,?,?)",
            (body.get("title", ""), body.get("date", ""),
             body.get("type", "manual"), body.get("project_id"), body.get("notes", ""))
        )
    return {"id": cur.lastrowid, "ok": True}

@app.put("/api/events/{eid}")
async def update_event(eid: int, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE events SET title=?,date=?,type=?,project_id=?,notes=? WHERE id=?",
            (body.get("title",""), body.get("date",""),
             body.get("type","manual"), body.get("project_id"), body.get("notes",""), eid)
        )
    return {"ok": True}

@app.delete("/api/events/{eid}")
async def delete_event(eid: int):
    with db() as c:
        c.execute("DELETE FROM events WHERE id=?", (eid,))
    return {"ok": True}


# ── RESULTS LOG ───────────────────────────────────────────────────
@app.get("/api/results")
async def get_results():
    with db() as c:
        rows = c.execute("SELECT * FROM results_log ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/results")
async def add_result(request: Request):
    body = await request.json()
    with db() as c:
        cur = c.execute(
            "INSERT INTO results_log (description, date, category) VALUES (?,?,?)",
            (body.get("description", ""), body.get("date", ""), body.get("category", ""))
        )
    return {"id": cur.lastrowid, "ok": True}

@app.put("/api/results/{rid}")
async def update_result(rid: int, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE results_log SET description=?,date=?,category=? WHERE id=?",
            (body.get("description",""), body.get("date",""), body.get("category",""), rid)
        )
    return {"ok": True}

@app.delete("/api/results/{rid}")
async def delete_result(rid: int):
    with db() as c:
        c.execute("DELETE FROM results_log WHERE id=?", (rid,))
    return {"ok": True}


# ── CHECKLIST ─────────────────────────────────────────────────────
@app.get("/api/checklist")
async def get_checklist(period: str = ""):
    with db() as c:
        if period:
            rows = c.execute("SELECT * FROM checklist_items WHERE period=? ORDER BY id", (period,)).fetchall()
        else:
            rows = c.execute("SELECT * FROM checklist_items ORDER BY period DESC, id").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/checklist")
async def save_checklist(request: Request):
    body = await request.json()
    period = body.get("period", "")
    items = body.get("items", [])
    with db() as c:
        if period:
            c.execute("DELETE FROM checklist_items WHERE period=?", (period,))
        for item in items:
            c.execute(
                "INSERT INTO checklist_items (question, answer, period) VALUES (?,?,?)",
                (item.get("question",""), item.get("answer",""), period)
            )
    return {"ok": True}


# ── REFERENCES LIBRARY ────────────────────────────────────────────
@app.get("/api/references")
async def get_references(type: str = "", tags: str = ""):
    with db() as c:
        q = "SELECT * FROM references_library"
        params: list = []
        if type:
            q += " WHERE type=?"; params.append(type)
        q += " ORDER BY created_at DESC"
        rows = c.execute(q, params).fetchall()
        return [dict(r) for r in rows]

@app.post("/api/references")
async def add_reference(request: Request):
    body = await request.json()
    import uuid
    rid = body.get("id") or str(uuid.uuid4())[:8]
    with db() as c:
        c.execute(
            "INSERT OR REPLACE INTO references_library (id,type,url,title,channel,thumbnail,notes,tags,project_id) VALUES (?,?,?,?,?,?,?,?,?)",
            (rid, body.get("type","web"), body.get("url",""), body.get("title",""),
             body.get("channel",""), body.get("thumbnail",""), body.get("notes",""),
             json.dumps(body.get("tags",[])), body.get("project_id"))
        )
    return {"id": rid, "ok": True}

@app.put("/api/references/{rid}")
async def update_reference(rid: str, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE references_library SET notes=?,tags=?,title=? WHERE id=?",
            (body.get("notes",""), json.dumps(body.get("tags",[])), body.get("title",""), rid)
        )
    return {"ok": True}

@app.delete("/api/references/{rid}")
async def delete_reference(rid: str):
    with db() as c:
        c.execute("DELETE FROM references_library WHERE id=?", (rid,))
    return {"ok": True}


# ── FINANCIAL ENTRIES ────────────────────────────────────────────
@app.get("/api/finances/entries")
async def get_financial_entries(type: str = "", month: str = ""):
    with db() as c:
        q = "SELECT * FROM financial_entries WHERE 1=1"
        params: list = []
        if type:
            q += " AND type=?"; params.append(type)
        if month:
            q += " AND date LIKE ?"; params.append(f"{month}%")
        q += " ORDER BY date DESC, id DESC"
        rows = c.execute(q, params).fetchall()
        return [dict(r) for r in rows]

@app.post("/api/finances/entries")
async def add_financial_entry(request: Request):
    body = await request.json()
    with db() as c:
        cur = c.execute(
            "INSERT INTO financial_entries (type,amount,description,category,date,project_id) VALUES (?,?,?,?,?,?)",
            (body.get("type","receita"), float(body.get("amount",0)),
             body.get("description",""), body.get("category",""),
             body.get("date",""), body.get("project_id"))
        )
    return {"id": cur.lastrowid, "ok": True}

@app.put("/api/finances/entries/{eid}")
async def update_financial_entry(eid: int, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE financial_entries SET type=?,amount=?,description=?,category=?,date=?,project_id=? WHERE id=?",
            (body.get("type","receita"), float(body.get("amount",0)),
             body.get("description",""), body.get("category",""),
             body.get("date",""), body.get("project_id"), eid)
        )
    return {"ok": True}

@app.delete("/api/finances/entries/{eid}")
async def delete_financial_entry(eid: int):
    with db() as c:
        c.execute("DELETE FROM financial_entries WHERE id=?", (eid,))
    return {"ok": True}

@app.get("/api/finances/summary")
async def financial_summary(month: str = ""):
    with db() as c:
        q = "SELECT type, SUM(amount) as total FROM financial_entries"
        params: list = []
        if month:
            q += " WHERE date LIKE ?"; params.append(f"{month}%")
        q += " GROUP BY type"
        rows = c.execute(q, params).fetchall()
        return {r["type"]: r["total"] for r in rows}


# ── IDEAS ────────────────────────────────────────────────────────
@app.get("/api/ideas")
async def get_ideas():
    with db() as c:
        rows = c.execute("SELECT * FROM ideas ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/ideas")
async def add_idea(request: Request):
    body = await request.json()
    import uuid
    iid = str(uuid.uuid4())[:8]
    with db() as c:
        c.execute(
            "INSERT INTO ideas (id,content,type,tags,project_id) VALUES (?,?,?,?,?)",
            (iid, body.get("content",""), body.get("type","ideia"),
             json.dumps(body.get("tags",[])), body.get("project_id"))
        )
    return {"id": iid, "ok": True}

@app.put("/api/ideas/{iid}")
async def update_idea(iid: str, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE ideas SET content=?,type=?,tags=?,project_id=? WHERE id=?",
            (body.get("content",""), body.get("type","ideia"),
             json.dumps(body.get("tags",[])), body.get("project_id"), iid)
        )
    return {"ok": True}

@app.delete("/api/ideas/{iid}")
async def delete_idea(iid: str):
    with db() as c:
        c.execute("DELETE FROM ideas WHERE id=?", (iid,))
    return {"ok": True}


# ── OPPORTUNITIES ────────────────────────────────────────────────
@app.get("/api/opportunities")
async def get_opportunities():
    with db() as c:
        rows = c.execute("SELECT * FROM opportunities ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/opportunities")
async def add_opportunity(request: Request):
    body = await request.json()
    import uuid
    oid = str(uuid.uuid4())[:8]
    with db() as c:
        c.execute(
            "INSERT INTO opportunities (id,title,organization,category,url,deadline,country,language,notes,status,source) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (oid, body.get("title",""), body.get("organization",""), body.get("category",""),
             body.get("url",""), body.get("deadline",""), body.get("country",""),
             body.get("language",""), body.get("notes",""),
             body.get("status","identificada"), body.get("source",""))
        )
    return {"id": oid, "ok": True}

@app.put("/api/opportunities/{oid}")
async def update_opportunity(oid: str, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE opportunities SET title=?,organization=?,category=?,url=?,deadline=?,country=?,language=?,notes=?,status=?,source=? WHERE id=?",
            (body.get("title",""), body.get("organization",""), body.get("category",""),
             body.get("url",""), body.get("deadline",""), body.get("country",""),
             body.get("language",""), body.get("notes",""),
             body.get("status","identificada"), body.get("source",""), oid)
        )
    return {"ok": True}

@app.delete("/api/opportunities/{oid}")
async def delete_opportunity(oid: str):
    with db() as c:
        c.execute("DELETE FROM opportunities WHERE id=?", (oid,))
    return {"ok": True}


# ── LEARNING GOALS ────────────────────────────────────────────────
@app.get("/api/learning")
async def get_learning():
    with db() as c:
        rows = c.execute("SELECT * FROM learning_goals ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

@app.post("/api/learning")
async def add_learning(request: Request):
    body = await request.json()
    import uuid
    lid = str(uuid.uuid4())[:8]
    with db() as c:
        c.execute(
            "INSERT INTO learning_goals (id,competency,current_level,target_level,resources,evidence,status,notes) VALUES (?,?,?,?,?,?,?,?)",
            (lid, body.get("competency",""),
             int(body.get("current_level",1)), int(body.get("target_level",3)),
             json.dumps(body.get("resources",[])), body.get("evidence",""),
             body.get("status","ativa"), body.get("notes",""))
        )
    return {"id": lid, "ok": True}

@app.put("/api/learning/{lid}")
async def update_learning(lid: str, request: Request):
    body = await request.json()
    with db() as c:
        c.execute(
            "UPDATE learning_goals SET competency=?,current_level=?,target_level=?,resources=?,evidence=?,status=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
            (body.get("competency",""),
             int(body.get("current_level",1)), int(body.get("target_level",3)),
             json.dumps(body.get("resources",[])), body.get("evidence",""),
             body.get("status","ativa"), body.get("notes",""), lid)
        )
    return {"ok": True}

@app.delete("/api/learning/{lid}")
async def delete_learning(lid: str):
    with db() as c:
        c.execute("DELETE FROM learning_goals WHERE id=?", (lid,))
    return {"ok": True}


# ── EXPORT / IMPORT ───────────────────────────────────────────────
@app.get("/api/export")
async def export_data():
    with db() as c:
        profile = json.loads(c.execute("SELECT data FROM profile WHERE id=1").fetchone()["data"])
        diagnostic = {r["question_id"]: r["answer"]
                      for r in c.execute("SELECT question_id, answer FROM diagnostic").fetchall()}
        projects = [json.loads(r["data"]) for r in c.execute("SELECT data FROM projects").fetchall()]
        finances = json.loads(c.execute("SELECT data FROM financial_data WHERE id=1").fetchone()["data"])
        decisions = [dict(r) for r in c.execute("SELECT * FROM decisions ORDER BY id").fetchall()]
        events = [dict(r) for r in c.execute("SELECT * FROM events ORDER BY date").fetchall()]
        results = [dict(r) for r in c.execute("SELECT * FROM results_log ORDER BY id").fetchall()]
        ideas = [dict(r) for r in c.execute("SELECT * FROM ideas ORDER BY created_at").fetchall()]
        opportunities = [dict(r) for r in c.execute("SELECT * FROM opportunities ORDER BY created_at").fetchall()]
        learning = [dict(r) for r in c.execute("SELECT * FROM learning_goals ORDER BY created_at").fetchall()]
        references = [dict(r) for r in c.execute("SELECT * FROM references_library ORDER BY created_at").fetchall()]
        fin_entries = [dict(r) for r in c.execute("SELECT * FROM financial_entries ORDER BY date").fetchall()]
    return {
        "exported_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "version": "4",
        "profile": profile,
        "diagnostic": diagnostic,
        "projects": projects,
        "finances": finances,
        "decisions": decisions,
        "events": events,
        "results": results,
        "ideas": ideas,
        "opportunities": opportunities,
        "learning": learning,
        "references": references,
        "financial_entries": fin_entries,
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
                pid = p.get("id", f"imp{int(time.time()*1000)}")
                c.execute("INSERT OR REPLACE INTO projects (id, data) VALUES (?,?)",
                          (pid, json.dumps(p)))
        if "diagnostic" in body:
            for qid, answer in body["diagnostic"].items():
                c.execute("""
                    INSERT INTO diagnostic (question_id, stage, answer) VALUES (?,?,?)
                    ON CONFLICT(question_id) DO UPDATE SET answer=excluded.answer
                """, (qid, "", str(answer)))
        if "decisions" in body:
            for d in body["decisions"]:
                c.execute(
                    "INSERT OR IGNORE INTO decisions (id, description, rationale, context, outcome, date) VALUES (?,?,?,?,?,?)",
                    (d.get("id"), d.get("description",""), d.get("rationale",""),
                     d.get("context",""), d.get("outcome",""), d.get("date",""))
                )
        if "results" in body:
            for r in body["results"]:
                c.execute(
                    "INSERT OR IGNORE INTO results_log (id, description, date, category) VALUES (?,?,?,?)",
                    (r.get("id"), r.get("description",""), r.get("date",""), r.get("category",""))
                )
    return {"ok": True}


# ── RESEARCH ──────────────────────────────────────────────────────
def pytrends_client():
    if not HAS_PYTRENDS:
        return None
    return TrendReq(hl="pt-BR", tz=180, timeout=(10, 30), retries=2, backoff_factor=0.5)

@app.get("/api/research/trends")
async def trends(keywords: str = "edição de vídeo,DaVinci Resolve,Adobe Premiere"):
    kws = [k.strip() for k in keywords.split(",") if k.strip()][:5]
    key = "trends_" + "_".join(kws)
    def fetch():
        try:
            pt = pytrends_client()
            if not pt:
                return {"data": [], "dates": [], "error": "pytrends não instalado"}
            pt.build_payload(kws, timeframe="today 3-m", geo="BR")
            df = pt.interest_over_time()
            if df.empty:
                return {"data": [], "dates": [], "error": None}
            result = []
            for kw in kws:
                if kw in df.columns:
                    vals = [int(v) for v in df[kw].tolist()[-12:]]
                    result.append({
                        "keyword": kw, "values": vals,
                        "avg": round(sum(vals)/len(vals)) if vals else 0,
                        "trend": "subindo" if len(vals) > 1 and vals[-1] > vals[0] else "descendo"
                    })
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
                return {"trending": [], "error": "pytrends não disponível"}
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
                    articles.append({
                        "title": e.get("title", ""), "link": e.get("link", ""),
                        "summary": summary, "published": e.get("published", ""), "source": name
                    })
            except Exception as ex:
                log.warning("RSS %s: %s", url, ex)
        return {"articles": articles[:25]}
    return cached("noticias", fetch, ttl=1800)

@app.get("/api/research/youtube")
async def youtube_search(
    q: str = "video editing tutorial",
    x_youtube_key: str = Header(default=None)
):
    api_key = x_youtube_key or os.environ.get("YOUTUBE_API_KEY", "")
    if not api_key:
        return {
            "status": "needs_api_key",
            "message": "Configure sua YouTube Data API v3 key em Configurações → Conectores.",
            "results": [],
        }
    cache_key = f"yt_{q[:50]}"
    def fetch():
        try:
            resp = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet", "q": q, "type": "video",
                    "maxResults": 10, "key": api_key,
                    "relevanceLanguage": "pt", "regionCode": "BR",
                },
                timeout=10
            )
            if resp.status_code == 403:
                return {"status": "error", "message": "API key inválida ou quota excedida.", "results": []}
            resp.raise_for_status()
            data = resp.json()
            results = []
            for item in data.get("items", []):
                s = item["snippet"]
                results.append({
                    "video_id": item["id"]["videoId"],
                    "title": s.get("title", ""),
                    "channel": s.get("channelTitle", ""),
                    "published": s.get("publishedAt", "")[:10],
                    "description": s.get("description", "")[:180],
                    "thumbnail": s.get("thumbnails", {}).get("medium", {}).get("url", ""),
                    "url": f"https://youtube.com/watch?v={item['id']['videoId']}",
                })
            return {"status": "ok", "results": results, "query": q}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    return cached(cache_key, fetch, ttl=3600)

@app.get("/api/research/search")
async def google_search(
    q: str = "",
    x_google_key: str = Header(default=None),
    x_google_cx: str = Header(default=None)
):
    api_key = x_google_key or os.environ.get("GOOGLE_CSE_KEY", "")
    cx = x_google_cx or os.environ.get("GOOGLE_CSE_CX", "")
    if not api_key or not cx:
        return {
            "status": "needs_api_key",
            "message": "Configure Google Custom Search API key e CX em Configurações → Conectores.",
            "results": [],
        }
    if not q:
        return {"status": "error", "message": "Query vazia.", "results": []}
    cache_key = f"gcs_{q[:50]}"
    def fetch():
        try:
            resp = requests.get(
                "https://www.googleapis.com/customsearch/v1",
                params={"key": api_key, "cx": cx, "q": q, "num": 10, "gl": "br", "hl": "pt"},
                timeout=10
            )
            resp.raise_for_status()
            data = resp.json()
            results = [
                {
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "source": item.get("displayLink", ""),
                }
                for item in data.get("items", [])
            ]
            return {"status": "ok", "results": results, "query": q}
        except Exception as e:
            return {"status": "error", "message": str(e), "results": []}
    return cached(cache_key, fetch, ttl=3600)


# ── GOOGLE CALENDAR OAUTH ─────────────────────────────────────────
GCAL_SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
GCAL_REDIRECT = os.environ.get("GCAL_REDIRECT_URI", "http://localhost:8000/api/calendar/callback")

def _gcal_client_config():
    cid = os.environ.get("GOOGLE_CLIENT_ID", "")
    csec = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    if not cid or not csec:
        return None
    return {
        "web": {
            "client_id": cid,
            "client_secret": csec,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GCAL_REDIRECT],
        }
    }

def _gcal_credentials():
    with db() as c:
        row = c.execute("SELECT token_data FROM oauth_tokens WHERE service='gcal'").fetchone()
    if not row:
        return None
    data = json.loads(row["token_data"])
    creds = Credentials(
        token=data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID", ""),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET", ""),
        scopes=GCAL_SCOPES,
    )
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GRequest())
            _save_gcal_token(creds)
        except Exception:
            return None
    return creds

def _save_gcal_token(creds):
    data = json.dumps({
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "expiry": creds.expiry.isoformat() if creds.expiry else None,
    })
    with db() as c:
        c.execute("INSERT OR REPLACE INTO oauth_tokens (service, token_data) VALUES ('gcal', ?)", (data,))

@app.get("/api/calendar/auth")
async def gcal_auth():
    if not HAS_GOOGLE_OAUTH:
        raise HTTPException(501, "google-auth-oauthlib não instalado")
    cfg = _gcal_client_config()
    if not cfg:
        raise HTTPException(400, "GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não configurados")
    flow = Flow.from_client_config(cfg, scopes=GCAL_SCOPES, redirect_uri=GCAL_REDIRECT)
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    return RedirectResponse(auth_url)

@app.get("/api/calendar/callback")
async def gcal_callback(code: str = "", error: str = ""):
    if error:
        return RedirectResponse(f"/?gcal_error={error}")
    if not code:
        raise HTTPException(400, "Código de autorização ausente")
    cfg = _gcal_client_config()
    flow = Flow.from_client_config(cfg, scopes=GCAL_SCOPES, redirect_uri=GCAL_REDIRECT)
    flow.fetch_token(code=code)
    _save_gcal_token(flow.credentials)
    return RedirectResponse("/?gcal_connected=1")

@app.get("/api/calendar/status")
async def gcal_status():
    if not HAS_GOOGLE_OAUTH:
        return {"connected": False, "reason": "library_missing"}
    if not _gcal_client_config():
        return {"connected": False, "reason": "no_credentials"}
    creds = _gcal_credentials()
    return {"connected": bool(creds and creds.valid)}

@app.get("/api/calendar/events")
async def gcal_events(days: int = 30):
    if not HAS_GOOGLE_OAUTH:
        return {"status": "needs_setup", "events": [], "message": "Biblioteca não instalada."}
    if not _gcal_client_config():
        return {"status": "needs_setup", "events": [], "message": "Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET."}
    creds = _gcal_credentials()
    if not creds or not creds.valid:
        return {"status": "needs_auth", "events": [], "message": "Conecte sua conta Google em Configurações."}
    try:
        service = build("calendar", "v3", credentials=creds)
        now = time.strftime("%Y-%m-%dT00:00:00Z")
        end = time.strftime("%Y-%m-%dT23:59:59Z", time.gmtime(time.time() + days * 86400))
        result = service.events().list(
            calendarId="primary", timeMin=now, timeMax=end,
            maxResults=50, singleEvents=True, orderBy="startTime"
        ).execute()
        events = []
        for item in result.get("items", []):
            start = item["start"].get("dateTime", item["start"].get("date", ""))
            events.append({
                "id": item["id"],
                "title": item.get("summary", "(sem título)"),
                "start": start,
                "end": item["end"].get("dateTime", item["end"].get("date", "")),
                "location": item.get("location", ""),
                "description": (item.get("description", "") or "")[:200],
                "url": item.get("htmlLink", ""),
            })
        return {"status": "ok", "events": events}
    except Exception as e:
        return {"status": "error", "events": [], "message": str(e)}

@app.delete("/api/calendar/disconnect")
async def gcal_disconnect():
    with db() as c:
        c.execute("DELETE FROM oauth_tokens WHERE service='gcal'")
    return {"ok": True}


# ── GEMINI AI ─────────────────────────────────────────────────────
def build_ai_context(c) -> str:
    """Build a context string from the user's real DB data."""
    parts = []

    # Profile
    row = c.execute("SELECT data FROM profile WHERE id=1").fetchone()
    if row:
        p = json.loads(row[0] or "{}")
        if p:
            parts.append("PERFIL DA UTILIZADORA:")
            if p.get("name"): parts.append(f"- Nome: {p['name']}")
            if p.get("goal"): parts.append(f"- Objectivo principal: {p['goal']}")
            if p.get("area"): parts.append(f"- Área: {p['area']}")
            if p.get("current_income"): parts.append(f"- Rendimento actual: R$ {p['current_income']}")
            if p.get("target_income"): parts.append(f"- Meta de rendimento: R$ {p['target_income']}")

    # Diagnostic answers
    diag = c.execute("SELECT question_id, label FROM diagnostic").fetchall()
    if diag:
        parts.append("\nRESPOSTAS DO DIAGNÓSTICO:")
        for qid, label in diag:
            if label:
                parts.append(f"- {qid}: {label}")

    # Projects
    projects = c.execute("SELECT data FROM projects ORDER BY created_at DESC LIMIT 10").fetchall()
    if projects:
        parts.append("\nPROJECTOS:")
        for (pdata,) in projects:
            p = json.loads(pdata or "{}")
            status = p.get("status", "")
            parts.append(f"- {p.get('name','?')} ({status}): {p.get('description','')[:80]}")

    # Financial
    row = c.execute("SELECT data FROM financial_data WHERE id=1").fetchone()
    if row:
        f = json.loads(row[0] or "{}")
        if f.get("price_per_project"):
            parts.append(f"\nFINANCEIRO: preço por projecto R$ {f.get('price_per_project')}, "
                         f"horas/mês {f.get('hours_per_month')}, custos fixos R$ {f.get('fixed_costs',0)}")

    # Ideas (last 5)
    ideas = c.execute("SELECT content, type FROM ideas ORDER BY created_at DESC LIMIT 5").fetchall()
    if ideas:
        parts.append("\nIDEIAS RECENTES:")
        for content, itype in ideas:
            parts.append(f"- [{itype}] {content[:100]}")

    # Opportunities (active, next 5 by deadline)
    opps = c.execute("SELECT title, category, deadline, status FROM opportunities WHERE status NOT IN ('rejeitada','expirada') ORDER BY deadline ASC LIMIT 5").fetchall()
    if opps:
        parts.append("\nOPORTUNIDADES ACTIVAS:")
        for title, cat, deadline, status in opps:
            d = f" (prazo: {deadline})" if deadline else ""
            parts.append(f"- {title} [{cat or 'geral'}]{d} — {status}")

    # Learning goals (active)
    goals = c.execute("SELECT competency, current_level, target_level FROM learning_goals WHERE status='ativa' LIMIT 5").fetchall()
    if goals:
        parts.append("\nOBJECTIVOS DE APRENDIZADO:")
        for comp, cur, tgt in goals:
            parts.append(f"- {comp}: nível {cur}/5 → meta {tgt}/5")

    return "\n".join(parts) if parts else "Ainda sem dados registados — peça à utilizadora para preencher o perfil e o diagnóstico."


GEMINI_SYSTEM = """Você é a assistente estratégica pessoal de Débora Augusta, uma profissional brasileira de edição de vídeo e audiovisual.
Você conhece os dados reais de Débora (perfil, diagnóstico, projectos, finanças) e usa-os para dar conselhos específicos e accionáveis.
Responda sempre em português brasileiro. Seja directa, prática e estratégica.
Não seja genérica — use os dados reais da Débora para personalizar cada resposta.
Se ela perguntar sobre projectos, diga quais são os projectos dela. Se perguntar sobre estratégia, use as respostas do diagnóstico dela.
Contexto actual dos dados de Débora:

{context}"""


@app.post("/api/ai/chat")
async def ai_chat(request: Request):
    if not HAS_GEMINI:
        raise HTTPException(status_code=503, detail="google-generativeai não instalado")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY não configurada")

    body = await request.json()
    message = body.get("message", "").strip()
    session_id = body.get("session_id", "default")
    if not message:
        raise HTTPException(status_code=400, detail="Mensagem vazia")

    with db() as c:
        context = build_ai_context(c)
        history = c.execute(
            "SELECT role, content FROM ai_conversations WHERE session_id=? ORDER BY id DESC LIMIT 20",
            (session_id,)
        ).fetchall()
        history = list(reversed(history))

        # Save user message
        c.execute("INSERT INTO ai_conversations (session_id, role, content) VALUES (?,?,?)",
                  (session_id, "user", message))

    try:
        client = genai_client.Client(api_key=api_key)
        contents = []
        for role, content in history:
            contents.append(genai_types.Content(role=role, parts=[genai_types.Part(text=content)]))
        contents.append(genai_types.Content(role='user', parts=[genai_types.Part(text=message)]))
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=genai_types.GenerateContentConfig(
                system_instruction=GEMINI_SYSTEM.format(context=context),
                max_output_tokens=1024,
            )
        )
        reply = response.text
    except Exception as e:
        log.error(f"Gemini error: {e}")
        raise HTTPException(status_code=502, detail=f"Erro na IA: {str(e)}")

    with db() as c:
        c.execute("INSERT INTO ai_conversations (session_id, role, content) VALUES (?,?,?)",
                  (session_id, "model", reply))

    return {"reply": reply, "session_id": session_id}


@app.get("/api/ai/conversations/{session_id}")
async def get_ai_conversation(session_id: str):
    with db() as c:
        rows = c.execute(
            "SELECT role, content, created_at FROM ai_conversations WHERE session_id=? ORDER BY id",
            (session_id,)
        ).fetchall()
        return [{"role": r[0], "content": r[1], "created_at": r[2]} for r in rows]


@app.delete("/api/ai/conversations/{session_id}")
async def delete_ai_conversation(session_id: str):
    with db() as c:
        c.execute("DELETE FROM ai_conversations WHERE session_id=?", (session_id,))
    return {"ok": True}


# ── STATUS ────────────────────────────────────────────────────────
@app.get("/api/status")
async def status():
    return {
        "status": "ok",
        "version": "3.0",
        "db": str(DB_PATH),
        "pytrends": HAS_PYTRENDS,
        "youtube_api": bool(os.environ.get("YOUTUBE_API_KEY")),
        "google_search_api": bool(os.environ.get("GOOGLE_CSE_KEY")),
        "google_calendar": bool(os.environ.get("GOOGLE_CLIENT_ID")),
        "gemini": HAS_GEMINI and bool(os.environ.get("GEMINI_API_KEY")),
    }

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("\n🎬 Meu Studio v3 em http://localhost:8000\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
