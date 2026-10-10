import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

FEATURE_COLS = ['hour', 'is_peak_hour', 'traffic_norm', 'load_norm', 'weather_code', 'scheduled_travel_time_min']

class BusGuardPredictor:
    def __init__(self, n_estimators: int = 100, random_state: int = 42):
        self.model = RandomForestRegressor(n_estimators=n_estimators, random_state=random_state, max_depth=12)
        self.feature_names = FEATURE_COLS
        self.evaluation_metrics = {}

    def train_and_evaluate(self, df: pd.DataFrame, test_ratio: float = 0.2):
        split_idx = int(len(df) * (1 - test_ratio))
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]

        X_train = train_df[self.feature_names]
        y_train = train_df['actual_delay_min']
        X_test = test_df[self.feature_names]
        y_test = test_df['actual_delay_min']

        self.model.fit(X_train, y_train)
        preds = self.model.predict(X_test)

        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        self.evaluation_metrics = {'MAE': round(mae, 2), 'RMSE': round(rmse, 2)}
        return self.evaluation_metrics

    def predict_trip(self, row: pd.Series) -> dict:
        features = np.array([[row[f] for f in self.feature_names]])
        pred_delay = max(0.0, float(self.model.predict(features)[0]))
        
        # Delay probability estimate based on non-linear saturation
        prob = min(0.99, max(0.05, 1.0 / (1.0 + np.exp(-0.35 * (pred_delay - 4.0)))))
        
        # Primary factor explainability based on highest normalized input contribution
        contributions = {
            'High Traffic': row['traffic_norm'],
            'Passenger Congestion': row['load_norm'],
            'Adverse Weather': row['weather_code'] / 2.0,
            'Peak Travel Window': row['is_peak_hour']
        }
        primary_factor = max(contributions, key=contributions.get)
        
        return {
            'predicted_delay_min': round(pred_delay, 1),
            'delay_probability': round(prob, 2),
            'primary_factor': primary_factor
        }
