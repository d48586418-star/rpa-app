"""B2 — Migrações numeradas e idempotentes com PRAGMA user_version."""
import sqlite3, shutil, logging
from datetime import datetime
from pathlib import Path
from typing import Callable

log = logging.getLogger("meustudio")


# ── Backup ─────────────────────────────────────────────────────────

def _create_backup(db_path: Path, backup_dir: Path) -> None:
    if not db_path.exists():
        return
    backup_dir.mkdir(parents=True, exist_ok=True)
    ts   = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = backup_dir / f"studio_{ts}.db"
    shutil.copy2(db_path, dest)
    log.info("Backup criado: %s", dest.name)
    # Mantém só as 5 mais recentes
    for old in sorted(backup_dir.glob("studio_*.db"))[:-5]:
        old.unlink()
        log.info("Backup antigo removido: %s", old.name)


# ── Migrações ──────────────────────────────────────────────────────

def migration_001(conn: sqlite3.Connection) -> None:
    """Schema base — todas as tabelas do init_db() original."""
    conn.executescript("""
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


def migration_002(conn: sqlite3.Connection) -> None:
    """Adiciona ai_usage (orçamento diário) e ai_cache."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS ai_usage (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            dia      TEXT    NOT NULL,
            modelo   TEXT    NOT NULL,
            chamadas INTEGER NOT NULL DEFAULT 0,
            UNIQUE(dia, modelo)
        );
        CREATE TABLE IF NOT EXISTS ai_cache (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            modulo     TEXT NOT NULL,
            hash_ctx   TEXT NOT NULL,
            resposta   TEXT NOT NULL,
            modelo     TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(modulo, hash_ctx)
        );
    """)


def migration_003(conn: sqlite3.Connection) -> None:
    """Fase 1 — Histórico de conversas, memória da IA, campos de perfil expandido."""
    # Tabela de conversas nomeadas
    conn.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL DEFAULT 'Nova conversa',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Memória explícita da assistente
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ai_memory (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            fact       TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # Adicionar conversation_id a ai_conversations (se ainda não existe)
    cols = [r[1] for r in conn.execute("PRAGMA table_info(ai_conversations)").fetchall()]
    if "conversation_id" not in cols:
        conn.execute(
            "ALTER TABLE ai_conversations ADD COLUMN conversation_id INTEGER REFERENCES conversations(id)"
        )
    # Migrar mensagens órfãs para uma conversa "Conversa anterior"
    orphans = conn.execute(
        "SELECT COUNT(*) FROM ai_conversations WHERE conversation_id IS NULL"
    ).fetchone()[0]
    if orphans:
        conn.execute(
            "INSERT INTO conversations (title) VALUES ('Conversa anterior')"
        )
        cid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.execute(
            "UPDATE ai_conversations SET conversation_id=? WHERE conversation_id IS NULL",
            (cid,)
        )


_MIGRATIONS: list[Callable[[sqlite3.Connection], None]] = [
    migration_001,
    migration_002,
    migration_003,
]


# ── Ponto de entrada ───────────────────────────────────────────────

def run_migrations(db_path: Path, backup_dir: Path) -> None:
    """Aplica migrações pendentes; faz backup antes se houver alguma."""
    conn = sqlite3.connect(db_path)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA busy_timeout=5000")
        current = conn.execute("PRAGMA user_version").fetchone()[0]
        pending = _MIGRATIONS[current:]
        if not pending:
            log.info("Schema já na versão %d — nenhuma migração pendente.", current)
            return
        _create_backup(db_path, backup_dir)
        for idx, fn in enumerate(pending, start=current + 1):
            conn.execute("BEGIN")
            try:
                fn(conn)
                conn.execute(f"PRAGMA user_version = {idx}")
                conn.commit()
                log.info("Migração %03d aplicada: %s", idx, fn.__name__)
            except Exception:
                conn.rollback()
                log.error("Erro na migração %03d — rollback efectuado.", idx)
                raise
    finally:
        conn.close()
