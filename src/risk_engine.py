def assign_risk_category(pred_delay: float, prob: float) -> str:
    """Categorises trips into Low, Medium, High, or Critical risk tiers."""
    if pred_delay >= 12.0 or (pred_delay >= 9.0 and prob >= 0.75):
        return 'Critical'
    elif pred_delay >= 7.0 or (pred_delay >= 5.0 and prob >= 0.65):
        return 'High'
    elif pred_delay >= 3.0:
        return 'Medium'
    return 'Low'

def compute_priority_score(pred_delay: float, prob: float, passenger_load: float) -> float:
    """
    Priority Score = (Predicted Delay * 0.5) + (Probability * 4.0) + (Passenger Load Pct * 0.05)
    Reflects delay magnitude, certainty, and customer disruption urgency.
    """
    score = (pred_delay * 0.5) + (prob * 4.0) + ((passenger_load / 100.0) * 5.0)
    return round(score, 2)
