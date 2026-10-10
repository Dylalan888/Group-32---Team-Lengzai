import pandas as pd
import numpy as np

REQUIRED_COLUMNS = [
    'trip_id', 'bus_id', 'route_id', 'timestamp', 'hour', 'day_of_week',
    'traffic_level', 'weather', 'passenger_load_pct',
    'scheduled_travel_time_min', 'observed_travel_time_min'
]

def load_and_validate_data(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset missing required schema columns: {missing}")
    
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    df = df.dropna(subset=['timestamp']).sort_values('timestamp').reset_index(drop=True)
    
    # Derive delay labels from observed vs. scheduled travel time (FR-02)
    df['actual_delay_min'] = df['observed_travel_time_min'] - df['scheduled_travel_time_min']
    
    # Encode categorical features
    df['weather_code'] = df['weather'].map({'Clear': 0, 'Rain': 1, 'Heavy_Rain': 2}).fillna(0)
    df['traffic_norm'] = df['traffic_level'] / 100.0
    df['load_norm'] = df['passenger_load_pct'] / 100.0
    df['is_peak_hour'] = df['hour'].apply(lambda h: 1 if (7 <= h <= 9 or 17 <= h <= 20) else 0)
    
    return df
