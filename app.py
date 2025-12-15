# app.py
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# ---- Load trained model ----
MODEL = joblib.load("Models/leachate_model.pkl")  # single XGBRegressor

# ---- Input schemas ----
class Rock(BaseModel):
    EC_rock: float
    Ph_rock: float
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
    Acid: int
    Temp: float
    Event_quantity: float = 1.0

class PredictionRequest(BaseModel):
    rock: Rock
    events: List[Event]

# ---- Prediction endpoint ----
# ---- Prediction endpoint ----
@app.post("/predict")
def predict(req: PredictionRequest):

    rows = []
    cum_water = 0
    cum_acid = 0

    for i, evt in enumerate(req.events, start=1):
        cum_water += evt.Event_quantity
        cum_acid += evt.Event_quantity * evt.Acid

        rows.append({
            **req.rock.dict(),
            "Type_event": evt.Type_event,
            "Acid": evt.Acid,
            "Temp": evt.Temp,
            "Timestep": i,
            "is_rain": 1 if evt.Type_event == "rain" else 0,  # numeric
            "is_acid": 1 if evt.Type_event == "acid" else 0,  # numeric
            "cum_water": cum_water,
            "cum_acid_load": cum_acid
        })

    X = pd.DataFrame(rows)

    # Drop original string column to avoid XGBoost error
    if "Type_event" in X.columns:
        X = X.drop(columns=["Type_event"])

    predictions = []
    for i in range(len(X)):
        val = MODEL.predict(X.iloc[[i]])[0]
        predictions.append({
            "timestep": i + 1,
            "prediction": max(0, float(val)),
            "Explanation": "Prediction mainly driven by cumulative acid exposure and temperature."
        })

    return predictions

