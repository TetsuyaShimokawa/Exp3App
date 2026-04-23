import random

STAKES = [10000, 100000, 1000000]  # yen
EXCHANGE_RATES = [1.0, 1.1, 1.2, 1.5, 2.0, 3.0]  # gross return on future payment
DELAYS = {"1week": "1週間後", "3months": "3ヶ月後", "2years": "2年後"}


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
