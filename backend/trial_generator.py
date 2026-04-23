import random

STAKES = [10000, 100000, 1000000]  # yen
EXCHANGE_RATES = [1.0, 1.1, 1.2, 1.5, 2.0, 3.0]
DELAYS = {"1week": "1週間後", "3months": "3ヶ月後", "2years": "2年後"}

# CE (certainty equivalent) parameters — same stakes as CTB
CE_PROBABILITY_LEVELS = [0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]


def generate_trials(delay_condition: str) -> list:
    trials = []
    trial_id = 0
    for stake in STAKES:
        for rate in EXCHANGE_RATES:
            trial_id += 1
            trials.append({
                "trial_id": trial_id,
                "stake": stake,
                "exchange_rate": rate,
                "delay": delay_condition,
                "delay_label": DELAYS[delay_condition],
                "budget_today": stake,
                "budget_future": stake * rate,
            })
    random.shuffle(trials)
    return trials


def generate_ce_trials() -> list[dict]:
    """3 stakes × 10 probability levels = 30 CE trials. Grouped into 3 blocks by stake."""
    stakes = STAKES.copy()
    random.shuffle(stakes)  # randomise block order

    trials = []
    trial_id = 1
    for block_idx, stake in enumerate(stakes):
        probs = CE_PROBABILITY_LEVELS.copy()
        random.shuffle(probs)
        for prob in probs:
            trials.append({
                "trial_id": trial_id,
                "block": block_idx + 1,
                "stake": stake,
                "probability": prob,
                "probability_percent": int(prob * 100),
            })
            trial_id += 1
    return trials
