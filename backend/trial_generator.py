import random

STAKES = [10000, 100000, 1000000]  # yen
EXCHANGE_RATES = [1.0, 1.1, 1.2, 1.5, 2.0, 3.0]  # gross return on future payment
DELAYS = {"1week": "1週間後", "3months": "3ヶ月後", "2years": "2年後"}

# MPL parameters (probability weighting task)
PROBABILITY_LEVELS = [0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
MPL_SAFE_AMOUNTS = [50 * i for i in range(1, 21)]  # ¥50–¥1000 in ¥50 steps
OPTION_A_PRIZE = 1000


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
                "budget_today": stake,          # if all taken today
                "budget_future": stake * rate,  # if all deferred
            })
    random.shuffle(trials)
    return trials


def generate_mpl_trials() -> list[dict]:
    """10 probability levels × 20 rows = 200 MPL trials. Block order shuffled."""
    trials = []
    trial_id = 1
    for p in PROBABILITY_LEVELS:
        for row_idx, cert_amount in enumerate(MPL_SAFE_AMOUNTS):
            trials.append({
                "id": trial_id,
                "probability": p,
                "probability_percent": int(p * 100),
                "option_a_prize": OPTION_A_PRIZE,
                "option_a_expected": round(p * OPTION_A_PRIZE),
                "option_b_amount": cert_amount,
                "block_index": PROBABILITY_LEVELS.index(p),
                "row_index": row_idx,
            })
            trial_id += 1

    blocks = [
        [t for t in trials if t["probability"] == p]
        for p in PROBABILITY_LEVELS
    ]
    random.shuffle(blocks)

    result = []
    for block in blocks:
        result.extend(block)
    return result
