# app.py
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# ---- Load trained model ----
MODEL = joblib.load("Models/leachate_model.pkl")  # trained on numeric features

# ---- Input schemas ----
class Rock(BaseModel):
    EC_rock: float
    Ph_rock: float
    Corg_rock_perc: float  # renamed to match training 'Corg_rock (%)'
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
    Acid: int
    Temp: float
    Event_quantity: float = 1.0

class PredictionRequest(BaseModel):
    rock: Rock
    events: List[Event]

# ---- Prediction endpoint ----
@app.post("/predict")
def predict(req: PredictionRequest):

    rows = []
    cum_water = 0
    cum_acid = 0

    for i, evt in enumerate(req.events, start=1):
        cum_water += evt.Event_quantity
        cum_acid += evt.Event_quantity * evt.Acid

        # match training feature names exactly
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
            "is_rain": 1 if evt.Type_event == "rain" else 0,
            "cum_water": cum_water,
            "cum_acid_load": cum_acid
        }
        rows.append(row)

    X = pd.DataFrame(rows)

    # Ensure columns are in the same order as training
    feature_order = [
        'EC_rock', 'Ph_rock', 'Corg_rock (%)', 'Ca_rock', 'K_rock', 'Mg_rock', 'Na_rock',
        'SAR_rock', 'SiO2_rock', 'Al2O3_rock', 'Fe2O3_rock', 'TiO2_rock', 'MnO_rock',
        'CaO_rock', 'MgO_rock', 'Na2O_rock', 'K2O_rock', 'SO3_rock', 'P2O5_rock',
        'Event_quantity', 'Acid', 'Temp', 'Timestep', 'is_rain', 'cum_water', 'cum_acid_load'
    ]
    X = X[feature_order]

    # Predict
    predictions = []
    for i in range(len(X)):
        val = MODEL.predict(X.iloc[[i]])[0]
        predictions.append({
            "timestep": i + 1,
            "prediction": max(0, float(val)),
            "Explanation": "Prediction mainly driven by cumulative acid exposure and temperature."
        })

    return predictions
