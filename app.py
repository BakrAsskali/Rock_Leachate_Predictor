import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# ---- CORS Configuration ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load Trained Model ----
# The error indicated this is a MultiOutputRegressor, not a dictionary
MODEL = joblib.load("./Models/leachate_model.pkl")

# ---- Constants ----
# These must match the order in your training notebook EXACTLY
ROCK_FEATURES = [
    'EC_rock', 'Ph_rock', 'Corg_rock (%)', 'Ca_rock', 'K_rock',
    'Mg_rock', 'Na_rock', 'SAR_rock', 'SiO2_rock', 'Al2O3_rock',
    'Fe2O3_rock', 'TiO2_rock', 'MnO_rock', 'CaO_rock', 'MgO_rock',
    'Na2O_rock', 'K2O_rock', 'SO3_rock', 'P2O5_rock'
]


ENV_FEATURES = [
    'Event_quantity', 'Acid', 'Temp', 'Timestep', 
    'is_rain', 'cum_water', 'cum_acid_load'
]

# The model outputs an array of values. We need to know which index corresponds to which target.
# This order MUST match the 'targets' list in your notebook.
TARGET_NAMES = [
    'Volume_leachate', 'EC_leachate', 'Ph_leachate', 'Chloride_leachate',
    'Carbonate_leachate', 'Sulfate_leachate', 'Nitrate_leachate',
    'Phosphate_leachate', 'Ca_leachate', 'Fe_leachate', 'K_leachate',
    'Mg_leachate', 'Mn_leachate', 'Na_leachate'
]
TARGET_MODELS = {name: joblib.load(f"./Models/{name}.pkl") for name in TARGET_NAMES}

# ---- Input Schemas ----
class Rock(BaseModel):
    EC_rock: float
    Ph_rock: float
    Corg_rock_perc: float
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
    Type_event: str
    Acid: float
    Temp: float
    Event_quantity: float = 1.0

class PredictionRequest(BaseModel):
    rock: Rock
    events: List[Event]

# ---- Prediction Endpoint ----
@app.post("/predict")
def predict(req: PredictionRequest, model: Optional[str] = Query("multioutput", description="Choose 'multioutput' or 'lightgbm'")):
    rows = []
    cum_water = 0.0
    cum_acid = 0.0

    # 1️⃣ Prepare input rows
    for i, evt in enumerate(req.events, start=1):
        cum_water += evt.Event_quantity
        cum_acid += evt.Event_quantity * evt.Acid
        is_rain = 1 if evt.Type_event.lower() == "rain" else 0

        row = {
            "EC_rock": req.rock.EC_rock,
            "Ph_rock": req.rock.Ph_rock,
            "Corg_rock (%)": req.rock.Corg_rock_perc,
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
            "Event_quantity": evt.Event_quantity,
            "Acid": evt.Acid,
            "Temp": evt.Temp,
            "Timestep": i,
            "is_rain": is_rain,
            "cum_water": cum_water,
            "cum_acid_load": cum_acid
        }
        rows.append(row)

    X = pd.DataFrame(rows)
    full_feature_order = ROCK_FEATURES + ENV_FEATURES
    for col in full_feature_order:
        if col not in X.columns:
            X[col] = 0.0
    X = X[full_feature_order]

    results = []

    if model.lower() == "multioutput":
        # 2️⃣ Use MultiOutputRegressor model
        raw_predictions = MODEL.predict(X)
        for i in range(len(X)):
            pred_row = raw_predictions[i]
            step_result = {"timestep": i + 1, "Explanation": "Predicted with MultiOutputRegressor."}
            for target_index, target_name in enumerate(TARGET_NAMES):
                step_result[target_name] = max(0.0, float(pred_row[target_index])) if target_index < len(pred_row) else 0.0
            results.append(step_result)

    elif model.lower() == "lightgbm":
        # 2️⃣ Use separate LightGBM models
        all_preds = {target: TARGET_MODELS[target].predict(X) for target in TARGET_NAMES}
        num_rows = len(X)
        for i in range(num_rows):
            step_result = {"timestep": i + 1, "Explanation": "Predicted with LightGBM per target."}
            for target_name in TARGET_NAMES:
                step_result[target_name] = max(0.0, float(all_preds[target_name][i]))
            results.append(step_result)

    else:
        return {"error": "Invalid model type. Choose 'multioutput' or 'lightgbm'."}

    return results