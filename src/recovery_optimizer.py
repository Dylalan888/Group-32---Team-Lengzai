from typing import Dict, List, Any

CANDIDATES = [
    'No_Action',
    'Adaptive_Departure_Scheduling',
    'Route_Optimisation',
    'Standby_Bus_Reassignment'
]

def evaluate_recovery_candidates(trip: pd.Series, predicted_delay: float) -> List[Dict[str, Any]]:
    evaluations = []
    
    # 1. Baseline: No Action
    evaluations.append({
        'action': 'No_Action',
        'feasible': True,
        'rejection_reason': None,
        'expected_reduction_min': 0.0,
        'simulated_cost_myr': 0.0,
        'net_benefit_score': 0.0,
        'rationale': 'Retain current schedule baseline.'
    })
    
    # 2. Adaptive Departure Scheduling (Headway Regulation)
    evaluations.append({
        'action': 'Adaptive_Departure_Scheduling',
        'feasible': True,
        'rejection_reason': None,
        'expected_reduction_min': round(min(predicted_delay * 0.25, 4.0), 1),
        'simulated_cost_myr': 15.0,
        'net_benefit_score': round(min(predicted_delay * 0.25, 4.0) * 10 - 15, 2),
        'rationale': 'Modulate headways and departure window to smooth delay downstream.'
    })
    
    # 3. Route Optimisation (Alternative Corridor)
    alt_route_avail = bool(trip.get('alternative_route_available_simulated', 0))
    if not alt_route_avail:
        evaluations.append({
            'action': 'Route_Optimisation',
            'feasible': False,
            'rejection_reason': 'No approved alternative bypass corridor available for this route.',
            'expected_reduction_min': 0.0,
            'simulated_cost_myr': 40.0,
            'net_benefit_score': -999.0,
            'rationale': 'Infeasible due to route network constraints.'
        })
    else:
        red = round(min(predicted_delay * 0.55, 9.0), 1)
        evaluations.append({
            'action': 'Route_Optimisation',
            'feasible': True,
            'rejection_reason': None,
            'expected_reduction_min': red,
            'simulated_cost_myr': 40.0,
            'net_benefit_score': round(red * 10 - 40, 2),
            'rationale': 'Divert via parallel arterial route avoiding local bottleneck.'
        })
        
    # 4. Standby Bus Reassignment
    standby_bus = bool(trip.get('standby_bus_available_simulated', 0))
    standby_driver = bool(trip.get('driver_available_simulated', 0))
    if not (standby_bus and standby_driver):
        reasons = []
        if not standby_bus: reasons.append("No depot standby bus")
        if not standby_driver: reasons.append("No driver rostered")
        evaluations.append({
            'action': 'Standby_Bus_Reassignment',
            'feasible': False,
            'rejection_reason': f"Hard constraint violation: {', '.join(reasons)}.",
            'expected_reduction_min': 0.0,
            'simulated_cost_myr': 120.0,
            'net_benefit_score': -999.0,
            'rationale': 'Resource unavailable.'
        })
    else:
        red = round(max(0.0, predicted_delay * 0.80), 1)
        evaluations.append({
            'action': 'Standby_Bus_Reassignment',
            'feasible': True,
            'rejection_reason': None,
            'expected_reduction_min': red,
            'simulated_cost_myr': 120.0,
            'net_benefit_score': round(red * 10 - 120, 2),
            'rationale': 'Inject standby vehicle and driver directly at terminal.'
        })
        
    return evaluations

def select_best_action(evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
    feasible_actions = [e for e in evaluations if e['feasible']]
    # Select highest net benefit score (Delay Reduction Value - Operating Cost)
    best = max(feasible_actions, key=lambda x: x['net_benefit_score'])
    if best['expected_reduction_min'] < 1.0:
        return next(e for e in evaluations if e['action'] == 'No_Action')
    return best
