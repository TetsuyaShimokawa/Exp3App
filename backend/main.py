import csv
import io
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.result import CTBResult, MPLResult
from trial_generator import DELAYS, generate_trials, generate_mpl_trials

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
ctb_results: list[dict[str, Any]] = []
mpl_results: list[dict[str, Any]] = []


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
    mpl_trials: list[dict]


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
    mpl_trials = generate_mpl_trials()

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
        mpl_trials=mpl_trials,
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
    ctb_results.append(record)
    return {"status": "ok"}


@app.post("/api/mpl/result", status_code=201)
def save_mpl_result(result: MPLResult):
    session = sessions.get(result.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["delay_condition"] = session.get("delay_condition", "")
    record["timestamp"] = datetime.utcnow().isoformat()
    mpl_results.append(record)
    return {"status": "ok"}


@app.get("/api/results/csv")
def download_csv():
    output = io.StringIO()
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    # --- CTB results ---
    ctb_fields = [
        "participant_id", "name", "delay_condition", "delay_label",
        "trial_id", "stake", "exchange_rate",
        "allocation_today", "allocation_future", "response_time_ms", "timestamp",
    ]
    w = csv.writer(output)
    w.writerow(["## CTB RESULTS"])
    ctb_writer = csv.DictWriter(output, fieldnames=ctb_fields, extrasaction="ignore", lineterminator="\n")
    ctb_writer.writeheader()
    ctb_writer.writerows(ctb_results)
    output.write("\n")

    # --- MPL results ---
    mpl_fields = [
        "participant_id", "name", "delay_condition",
        "trial_id", "block_index", "row_index",
        "probability", "option_b_amount", "choice", "timestamp",
    ]
    w.writerow(["## MPL RESULTS"])
    mpl_writer = csv.DictWriter(output, fieldnames=mpl_fields, extrasaction="ignore", lineterminator="\n")
    mpl_writer.writeheader()
    mpl_writer.writerows(mpl_results)

    output.seek(0)
    filename = f"exp3_results_{ts}.csv"
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "sessions": len(sessions), "ctb_results": len(ctb_results), "mpl_results": len(mpl_results)}
