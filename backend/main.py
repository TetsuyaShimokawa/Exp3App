import csv
import io
import random
import uuid
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from models.result import CTBResult, CEResult
from trial_generator import DELAYS, generate_trials, generate_ce_trials

app = FastAPI(title="Exp3 CTB + CE Backend")

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

sessions: dict[str, dict[str, Any]] = {}
ctb_results: list[dict[str, Any]] = []
ce_results: list[dict[str, Any]] = []


class StartSessionRequest(BaseModel):
    participant_id: str
    name: str


class StartSessionResponse(BaseModel):
    session_id: str
    delay_condition: str
    delay_label: str
    trials: list[dict]
    ce_trials: list[dict]


@app.post("/api/session/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    session_id = str(uuid.uuid4())
    delay_condition = random.choice(list(DELAYS.keys()))
    trials = generate_trials(delay_condition)
    ce_trials = generate_ce_trials()

    sessions[session_id] = {
        "session_id": session_id,
        "participant_id": req.participant_id,
        "name": req.name,
        "delay_condition": delay_condition,
        "delay_label": DELAYS[delay_condition],
        "started_at": datetime.utcnow().isoformat(),
    }

    return StartSessionResponse(
        session_id=session_id,
        delay_condition=delay_condition,
        delay_label=DELAYS[delay_condition],
        trials=trials,
        ce_trials=ce_trials,
    )


@app.post("/api/results", status_code=201)
def save_ctb_result(result: CTBResult):
    session = sessions.get(result.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["delay_label"] = DELAYS.get(result.delay_condition, result.delay_condition)
    record["timestamp"] = datetime.utcnow().isoformat()
    ctb_results.append(record)
    return {"status": "ok"}


@app.post("/api/ce/result", status_code=201)
def save_ce_result(result: CEResult):
    session = sessions.get(result.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    record = result.model_dump()
    record["name"] = session.get("name", "")
    record["delay_condition"] = session.get("delay_condition", "")
    record["timestamp"] = datetime.utcnow().isoformat()
    ce_results.append(record)
    return {"status": "ok"}


@app.get("/api/results/csv")
def download_csv():
    output = io.StringIO()
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

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

    ce_fields = [
        "participant_id", "name", "delay_condition",
        "trial_id", "block", "stake", "probability", "ce_amount", "response_time_ms", "timestamp",
    ]
    w.writerow(["## CE RESULTS"])
    ce_writer = csv.DictWriter(output, fieldnames=ce_fields, extrasaction="ignore", lineterminator="\n")
    ce_writer.writeheader()
    ce_writer.writerows(ce_results)

    output.seek(0)
    filename = f"exp3_results_{ts}.csv"
    return StreamingResponse(
        iter([output.getvalue().encode("utf-8-sig")]),
        media_type="text/csv; charset=utf-8-sig",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "sessions": len(sessions),
        "ctb_results": len(ctb_results),
        "ce_results": len(ce_results),
    }
