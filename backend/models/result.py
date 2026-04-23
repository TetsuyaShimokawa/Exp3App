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


class MPLResult(BaseModel):
    session_id: str
    participant_id: str
    trial_id: int
    probability: float
    option_b_amount: int
    choice: str        # "A" or "B"
    row_index: int
    block_index: int
