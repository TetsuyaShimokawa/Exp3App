from pydantic import BaseModel


class CTBResult(BaseModel):
    session_id: str
    participant_id: str
    delay_condition: str
    trial_id: int
    stake: int
    exchange_rate: float
    allocation_today: int
    allocation_future: int
    response_time_ms: int


class CEResult(BaseModel):
    session_id: str
    participant_id: str
    trial_id: int
    block: int
    stake: int
    probability: float
    ce_amount: int
    response_time_ms: int
