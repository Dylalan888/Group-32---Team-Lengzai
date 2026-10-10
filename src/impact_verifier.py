def verify_impact(baseline_delay: float, expected_reduction: float, action: str) -> dict:
    post_delay = max(0.0, baseline_delay - expected_reduction)
    delay_reduction = baseline_delay - post_delay
    
    pct_improvement = 0.0
    if baseline_delay > 0.0:
        pct_improvement = round((delay_reduction / baseline_delay) * 100.0, 1)
        
    if action == 'No_Action':
        status = 'No_Action_Baseline'
    elif pct_improvement >= 60.0:
        status = 'Successful'
    elif pct_improvement >= 15.0:
        status = 'Partially_Effective'
    else:
        status = 'Ineffective'
        
    return {
        'baseline_delay_min': round(baseline_delay, 1),
        'post_action_delay_min': round(post_delay, 1),
        'delay_reduction_min': round(delay_reduction, 1),
        'percentage_improvement': pct_improvement,
        'recovery_status': status
    }
