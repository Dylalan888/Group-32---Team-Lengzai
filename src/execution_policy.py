def determine_execution_policy(
    selected_action: dict, 
    risk_level: str, 
    confidence: float, 
    min_auto_conf: float = 0.70
) -> dict:
    action_name = selected_action['action']
    
    if not selected_action['feasible']:
        return {
            'decision': 'BLOCKED',
            'reason': selected_action['rejection_reason']
        }
        
    if action_name == 'No_Action':
        return {
            'decision': 'AUTO_EXECUTE',
            'reason': 'Baseline retained; no high-impact intervention needed.'
        }
        
    # High-impact interventions or critical delays require human sign-off
    if action_name == 'Standby_Bus_Reassignment':
        return {
            'decision': 'REQUIRES_APPROVAL',
            'reason': 'Fleet dispatch incurring crew cost; human sign-off mandated.'
        }
        
    if risk_level == 'Critical' or confidence < min_auto_conf:
        return {
            'decision': 'REQUIRES_APPROVAL',
            'reason': f"High operational sensitivity (Risk: {risk_level}, Model Confidence: {confidence:.2f})."
        }
        
    return {
        'decision': 'AUTO_EXECUTE',
        'reason': f"Safe low-cost strategy meeting confidence threshold ({confidence:.2f} >= {min_auto_conf})."
    }
