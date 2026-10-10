import streamlit as st
import pandas as pd
from src.data_pipeline import load_and_validate_data
from src.delay_model import BusGuardPredictor
from src.risk_engine import assign_risk_category, compute_priority_score
from src.recovery_optimizer import evaluate_recovery_candidates, select_best_action
from src.execution_policy import determine_execution_policy
from src.impact_verifier import verify_impact

st.set_page_config(page_title="BusGuard AI - Recovery Workbench", layout="wide")

if 'audit_log' not in st.session_state:
    st.session_state['audit_log'] = []

st.title("🚌 BusGuard AI - Rapid KL Recovery Workbench")
st.caption("AI-Powered Bus Delay Prediction & Automated Recovery Decision Support")

# Sidebar Configuration
st.sidebar.header("System Controls & Limits")
data_path = st.sidebar.text_input("Dataset CSV Path", "busguard_ai_10000_records.csv")
min_conf = st.sidebar.slider("Min Confidence for Auto-Execution", 0.50, 0.95, 0.70, 0.05)

@st.cache_resource
def init_system(filepath):
    df = load_and_validate_data(filepath)
    predictor = BusGuardPredictor()
    metrics = predictor.train_and_evaluate(df)
    return df, predictor, metrics

try:
    df, predictor, metrics = init_system(data_path)
    st.sidebar.success(f"Model Active (RF Regressor | Test MAE: {metrics['MAE']}m, RMSE: {metrics['RMSE']}m)")
except Exception as e:
    st.error(f"Initialization Failed: {str(e)}")
    st.stop()

# 1. Detect & Prioritise Section
st.subheader("1. At-Risk Trip Prioritisation Queue")
sample_trips = df.iloc[8000:8050].copy()

evaluated_records = []
for idx, row in sample_trips.iterrows():
    pred_res = predictor.predict_trip(row)
    r_cat = assign_risk_category(pred_res['predicted_delay_min'], pred_res['delay_probability'])
    p_score = compute_priority_score(pred_res['predicted_delay_min'], pred_res['delay_probability'], row['passenger_load_pct'])
    evaluated_records.append({
        'trip_id': row['trip_id'],
        'route_id': row['route_id'],
        'bus_id': row['bus_id'],
        'predicted_delay_min': pred_res['predicted_delay_min'],
        'probability': pred_res['delay_probability'],
        'risk_level': r_cat,
        'priority_score': p_score,
        'primary_factor': pred_res['primary_factor'],
        'row_data': row
    })

queue_df = pd.DataFrame(evaluated_records).sort_values('priority_score', ascending=False).reset_index(drop=True)

st.dataframe(
    queue_df[['trip_id', 'route_id', 'bus_id', 'predicted_delay_min', 'risk_level', 'priority_score', 'primary_factor']],
    use_container_width=True
)

# 2. Selected Trip Details & Optimization
selected_trip_id = st.selectbox("Select Trip for Recovery Inspection:", queue_df['trip_id'].tolist())
trip_meta = queue_df[queue_df['trip_id'] == selected_trip_id].iloc[0]
trip_row = trip_meta['row_data']

col1, col2, col3, col4 = st.columns(4)
col1.metric("Predicted Delay", f"{trip_meta['predicted_delay_min']} min")
col2.metric("Risk Level", trip_meta['risk_level'])
col3.metric("Priority Rank", f"Score {trip_meta['priority_score']}")
col4.metric("Key Root Cause", trip_meta['primary_factor'])

st.divider()

# Recovery Evaluation
candidates = evaluate_recovery_candidates(trip_row, trip_meta['predicted_delay_min'])
best_action = select_best_action(candidates)
exec_decision = determine_execution_policy(best_action, trip_meta['risk_level'], trip_row.get('model_confidence_simulated', 0.75), min_conf)
impact = verify_impact(trip_meta['predicted_delay_min'], best_action['expected_reduction_min'], best_action['action'])

col_opt, col_exec = st.columns(2)

with col_opt:
    st.subheader("2. Candidate Recovery Evaluation")
    st.dataframe(pd.DataFrame(candidates)[['action', 'feasible', 'expected_reduction_min', 'simulated_cost_myr', 'rejection_reason']], use_container_width=True)
    st.info(f"**Recommended Action:** `{best_action['action']}`\n\n**Rationale:** {best_action['rationale']}")

with col_exec:
    st.subheader("3. Execution & Verification Policy")
    dec_type = exec_decision['decision']
    if dec_type == 'AUTO_EXECUTE':
        st.success(f"**Status: AUTO-EXECUTED**\n\n{exec_decision['reason']}")
    elif dec_type == 'REQUIRES_APPROVAL':
        st.warning(f"**Status: REQUIRES OPERATOR APPROVAL**\n\n{exec_decision['reason']}")
        c_app, c_rej = st.columns(2)
        if c_app.button("Approve Action", key="btn_app"):
            st.session_state['audit_log'].append({
                'trip_id': selected_trip_id,
                'action': best_action['action'],
                'decision': 'MANUALLY_APPROVED',
                'impact': impact['recovery_status'],
                'reduction': impact['delay_reduction_min']
            })
            st.success("Action applied to simulation!")
        if c_rej.button("Reject Action", key="btn_rej"):
            st.session_state['audit_log'].append({
                'trip_id': selected_trip_id,
                'action': best_action['action'],
                'decision': 'MANUALLY_REJECTED',
                'impact': 'Baseline_Retained',
                'reduction': 0.0
            })
            st.error("Action rejected; baseline retained.")
    else:
        st.error(f"**Status: BLOCKED**\n\n{exec_decision['reason']}")

    st.markdown("#### Projected Simulation Impact")
    m1, m2, m3 = st.columns(3)
    m1.metric("Post-Action Delay", f"{impact['post_action_delay_min']} min")
    m2.metric("Delay Reduction", f"{impact['delay_reduction_min']} min")
    m3.metric("Service Improvement", f"{impact['percentage_improvement']}%")

# Audit History Section
if st.session_state['audit_log']:
    st.subheader("Audit & Execution Trail")
    st.dataframe(pd.DataFrame(st.session_state['audit_log']), use_container_width=True)
