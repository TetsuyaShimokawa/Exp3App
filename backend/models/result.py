from pydantic import BaseModel


class CTBResult(BaseModel):
    session_id: str
    participant_id: str
    delay_condition: str
    trial_id: int
    stake: int
    exchange_rate: float
    allocation_today: int    # yen allocated to today
    allocation_future: int   # yen allocated to future (= stake - allocation_today) × exchange_rate
    response_time_ms: int
