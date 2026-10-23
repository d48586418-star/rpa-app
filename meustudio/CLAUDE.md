# MEU STUDIO — Notas de Arquitectura para Claude

## Stack
- **Backend**: FastAPI 0.115 + Python 3.11 + SQLite (via `sqlite3` stdlib)
- **Frontend**: HTML/CSS/JS single-file em `static/index.html` (~2500 linhas)
- **IA**: `google-genai>=1.0.0` (v2.33.0) — padrão `genai_client.Client(api_key=…)` + `client.models.generate_content(model='gemini-2.0-flash')`
- **Gráficos**: Chart.js 4.4.1 (CDN)
- **OAuth**: Google Calendar via `requests-oauthlib`

## Comandos de desenvolvimento

```bash
cd meustudio
pip install -r requirements.txt
python main.py              # inicia em http://localhost:8000
python -m py_compile main.py   # verifica sintaxe sem dependências
```

## Variáveis de ambiente (ver .env.example)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GEMINI_API_KEY` | Sim | Chave da API Gemini |
| `GOOGLE_CLIENT_ID` | Não | OAuth Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Não | OAuth Google Calendar |
| `SECRET_KEY` | Não | Sessão Flask (gerado automaticamente se ausente) |

## Regras de segurança — NUNCA violar

1. `GEMINI_API_KEY` **nunca** exposta ao frontend
2. API keys de terceiros (YouTube, Google) passadas via header `X-*`, nunca em URLs
3. `.env` nunca commitado (está em `.gitignore`)
4. Erros da IA não devolvem stack trace ao browser — usar `log.error` + `HTTPException`
5. Nenhuma execução de código arbitrário via IA — apenas consulta de dados estruturados

## Estrutura de ficheiros

```
meustudio/
├── main.py              # FastAPI app + todos os endpoints + engine de carreira
├── static/
│   └── index.html       # SPA completa — CSS + HTML + JS inline
├── requirements.txt
├── .env.example
└── CLAUDE.md            # este ficheiro
```

## Base de dados (SQLite — `meustudio.db`)

Tabelas existentes (não modificar colunas sem migração):

| Tabela | Descrição |
|---|---|
| `profile` | Perfil único (1 linha) |
| `diagnostic_answers` | Respostas do diagnóstico adaptativo |
| `projects` | Projetos CRUD |
| `events` | Eventos de agenda |
| `results` | Resultados/conquistas |
| `decisions` | Registo de decisões |
| `finance_data` | Parâmetros financeiros |
| `ai_conversations` | Histórico do chat IA |
| `checklist_items` | Revisão mensal (migrado de localStorage) |
| `references_library` | Biblioteca de referências |
| `financial_entries` | Lançamentos financeiros reais |
| `ideas` | Notas e ideias rápidas |
| `opportunities` | Oportunidades de mercado |
| `learning_goals` | Objetivos de aprendizado |

## Padrões de código

### Endpoints FastAPI
```python
@app.get("/api/exemplo")
async def get_exemplo():
    with get_db() as c:
        rows = c.execute("SELECT * FROM tabela ORDER BY created_at DESC").fetchall()
    return [dict(r) for r in rows]
```

### Frontend — api() helper
```javascript
// GET
const data = await api('/api/endpoint');
// POST com body
const result = await api('/api/endpoint', 'POST', {campo: valor});
// PUT
await api('/api/endpoint/'+id, 'PUT', payload);
// DELETE
await api('/api/endpoint/'+id, 'DELETE');
```

## Motor de carreira (7 caminhos)

`score_career_paths(answers)` em `main.py` e `scorePathsClient(answers)` em `index.html`.
Ambos devem ser mantidos em sincronia quando novos caminhos ou sinais forem adicionados.

Caminhos disponíveis: `freelancer_premium`, `educador_digital`, `criador_conteudo`,
`empreendedor_audiovisual`, `editora_conteudo_digital`, `freelancer_internacional`,
`criadora_produtos_educativos`.

## Diagnóstico adaptativo (35 perguntas)

Objecto `QUESTIONS` em `index.html`. Cada pergunta tem:
- `stage`: grupo temático (perfil, habilidades, mercado, proposta, barreiras, estrategia, valores, estilo, exposicao, historico, restricoes)
- `text`: texto da pergunta
- `options`: array `{val, label}`
- `next`: id da próxima pergunta, ou função `(answers) => id`

`TOTAL_Q` é calculado automaticamente como `Object.keys(QUESTIONS).length`.
