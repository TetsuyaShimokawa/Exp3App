import csv
import io
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.result import CTBResult
from trial_generator import DELAYS, generate_trials

app = FastAPI(title="Exp3 CTB Backend")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://exp3app-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory storage
# ---------------------------------------------------------------------------
sessions: dict[str, dict[str, Any]] = {}   # session_id -> session info
results: list[dict[str, Any]] = []          # flat list of all CTB results


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------
class StartSessionRequest(BaseModel):
    participant_id: str
    name: str
    delay_condition: str  # "1week" | "3months" | "2years"


class StartSessionResponse(BaseModel):
    session_id: str
    delay_condition: str
    delay_label: str
    trials: list[dict]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    if req.delay_condition not in DELAYS:
        raise HTTPException(
            status_code=400,
            detail=f"delay_condition must be one of {list(DELAYS.keys())}",
        )

    session_id = str(uuid.uuid4())
    trials = generate_trials(req.delay_condition)

    sessions[session_id] = {
        "session_id": session_id,
        "participant_id": req.participant_id,
        "name": req.name,
        "delay_condition": req.delay_condition,
        "delay_label": DELAYS[req.delay_condition],
        "started_at": datetime.utcnow().isoformat(),
    }

    return StartSessionResponse(
        session_id=session_id,
        delay_condition=req.delay_condition,
        delay_label=DELAYS[req.delay_condition],
        trials=trials,
    )


@app.post("/api/results", status_code=201)
def save_result(result: CTBResult):
    session = sessions.get(result.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["delay_label"] = DELAYS.get(result.delay_condition, result.delay_condition)
    record["timestamp"] = datetime.utcnow().isoformat()
    results.append(record)
    return {"status": "ok"}


@app.get("/api/results/csv")
def download_csv():
    fieldnames = [
        "participant_id",
        "name",
        "delay_condition",
        "delay_label",
        "trial_id",
        "stake",
        "exchange_rate",
        "allocation_today",
        "allocation_future",
        "response_time_ms",
        "timestamp",
    ]

    output = io.StringIO()
    writer = csv.DictWriter(
        output, fieldnames=fieldnames, extrasaction="ignore", lineterminator="\n"
    )
    writer.writeheader()
    writer.writerows(results)

    output.seek(0)
    filename = f"exp3_ctb_results_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "sessions": len(sessions), "results": len(results)}
