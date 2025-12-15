# app.py
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# ---- CORS Middleware ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load trained models ----
# Assuming the pickle contains the dictionary: {'Volume_leachate': model, 'Ph_leachate': model, ...}
MODELS = joblib.load("Models/leachate_model.pkl")

# ---- Constants from Notebook ----
ROCK_FEATURES = [
    'EC_rock', 'Ph_rock', 'Corg_rock (%)', 'Ca_rock', 'K_rock',
    'Mg_rock', 'Na_rock', 'SAR_rock', 'SiO2_rock', 'Al2O3_rock',
    'Fe2O3_rock', 'TiO2_rock', 'MnO_rock', 'CaO_rock', 'MgO_rock',
    'Na2O_rock', 'K2O_rock', 'SO3_rock', 'P2O5_rock'
]

TARGETS = [
    'Volume_leachate', 'EC_leachate', 'Ph_leachate', 'Chloride_leachate',
    'Carbonate_leachate', 'Sulfate_leachate', 'Nitrate_leachate',
    'Phosphate_leachate', 'Ca_leachate', 'Fe_leachate', 'K_leachate',
    'Mg_leachate', 'Mn_leachate', 'Na_leachate'
]

# ---- Input schemas ----
class Rock(BaseModel):
    # Mapping Pydantic fields to exact Notebook column names
    EC_rock: float
    Ph_rock: float
    Corg_rock_perc: float  # Will map to 'Corg_rock (%)'
    Ca_rock: float
    K_rock: float
    Mg_rock: float
    Na_rock: float
    SAR_rock: float
    SiO2_rock: float
    Al2O3_rock: float
    Fe2O3_rock: float
    TiO2_rock: float
    MnO_rock: float
    CaO_rock: float
    MgO_rock: float
    Na2O_rock: float
    K2O_rock: float
    SO3_rock: float
    P2O5_rock: float

class Event(BaseModel):
    Type_event: str  # "rain" or "acid"
    Acid: float      # Notebook treats Acid as numeric (load/concentration)
    Temp: float
    Event_quantity: float = 1.0

class PredictionRequest(BaseModel):
    rock: Rock
    events: List[Event]

# ---- Prediction endpoint ----
@app.post("/predict")
def predict(req: PredictionRequest):
    rows = []
    
    # Initialize cumulative trackers (Engineering Features)
    cum_water = 0.0
    cum_acid = 0.0

    for i, evt in enumerate(req.events, start=1):
        # 1. Calculate Cumulative Features (Logic from 'engineer_features' in notebook)
        cum_water += evt.Event_quantity
        cum_acid += evt.Event_quantity * evt.Acid
        
        # 2. Map 'rain'/'acid' to is_rain (Logic from 'load_and_clean')
        is_rain = 1 if evt.Type_event == "rain" else 0

        # 3. Build Row Dictionary
        row = {
            # Rock Features
            "EC_rock": req.rock.EC_rock,
            "Ph_rock": req.rock.Ph_rock,
            "Corg_rock (%)": req.rock.Corg_rock_perc, # Renamed variable
            "Ca_rock": req.rock.Ca_rock,
            "K_rock": req.rock.K_rock,
            "Mg_rock": req.rock.Mg_rock,
            "Na_rock": req.rock.Na_rock,
            "SAR_rock": req.rock.SAR_rock,
            "SiO2_rock": req.rock.SiO2_rock,
            "Al2O3_rock": req.rock.Al2O3_rock,
            "Fe2O3_rock": req.rock.Fe2O3_rock,
            "TiO2_rock": req.rock.TiO2_rock,
            "MnO_rock": req.rock.MnO_rock,
            "CaO_rock": req.rock.CaO_rock,
            "MgO_rock": req.rock.MgO_rock,
            "Na2O_rock": req.rock.Na2O_rock,
            "K2O_rock": req.rock.K2O_rock,
            "SO3_rock": req.rock.SO3_rock,
            "P2O5_rock": req.rock.P2O5_rock,
            
            # Environmental Features
            "Event_quantity": evt.Event_quantity,
            "Acid": evt.Acid,
            "Temp": evt.Temp,
            "Timestep": i,
            
            # Engineered Features
            "is_rain": is_rain,
            "cum_water": cum_water,
            "cum_acid_load": cum_acid
        }
        rows.append(row)

    # Convert to DataFrame
    X = pd.DataFrame(rows)

    # 4. Reorder columns to match training Feature list
    # Based on notebook logic: Rock + Env + Engineered
    feature_order = ROCK_FEATURES + [
        'Event_quantity', 'Acid', 'Temp', 'Timestep', 
        'is_rain', 'cum_water', 'cum_acid_load'
    ]
    
    # Ensure all columns exist (fill 0 if missing, though they shouldn't be)
    for col in feature_order:
        if col not in X.columns:
            X[col] = 0
            
    X = X[feature_order]

    # 5. Generate Predictions for ALL Targets
    results = []
    
    # We iterate row by row to structure the response by timestep
    for i in range(len(X)):
        row_np = X.iloc[[i]] # Keep as DataFrame for XGBoost feature names
        
        step_result = {
            "timestep": i + 1,
            "Explanation": "Based on cumulative water and acid load."
        }
        
        # Iterate over every target defined in the notebook
        for target in TARGETS:
            if target in MODELS:
                # Predict
                val = MODELS[target].predict(row_np)[0]
                # Enforce non-negative physics (concentration cannot be < 0)
                step_result[target] = max(0.0, float(val))
            else:
                # If model missing (e.g., all training data was 0), return 0
                step_result[target] = 0.0
        
        results.append(step_result)

    return results
