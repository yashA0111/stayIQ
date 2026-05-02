import os
import json
import joblib
import pandas as pd
import numpy as np
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS
from waitress import serve

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml", "scaler.pkl")
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, "ml", "feature_names.json")
LABEL_ENCODERS_PATH = os.path.join(BASE_DIR, "ml", "label_encoders.pkl")

# Global variables for ML artifacts
model = None
scaler = None
feature_names = None
label_encoders = None
explainer = None

def load_ml_artifacts():
    global model, scaler, feature_names, label_encoders, explainer
    print("Loading ML artifacts...")
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(FEATURE_NAMES_PATH, "r") as f:
            feature_names = json.load(f)
        label_encoders = joblib.load(LABEL_ENCODERS_PATH)
        
        # Initialize SHAP explainer
        explainer = shap.TreeExplainer(model)
        print("ML artifacts loaded successfully.")
    except Exception as e:
        print(f"Warning: Could not load ML artifacts. Have you trained the model yet? Error: {e}")

def prepare_data(data_dict):
    """Convert input dictionary to a scaled DataFrame for prediction."""
    # Ensure all features exist, use 0 or "Unknown" as defaults if missing
    df_data = {}
    for col in feature_names:
        val = data_dict.get(col)
        if val is None:
            if col in label_encoders:
                val = "Unknown"
            else:
                val = 0
        df_data[col] = [val]
    
    df = pd.DataFrame(df_data)
    
    # Encode categorical features
    for col, le in label_encoders.items():
        if col in df.columns:
            # Handle unseen labels by setting them to the most frequent or a default
            # Simple approach: if label not in classes_, default to first class
            known_classes = list(le.classes_)
            df[col] = df[col].apply(lambda x: x if x in known_classes else known_classes[0])
            df[col] = le.transform(df[col].astype(str))
    for col in df.columns:
       if col not in label_encoders:
            df[col]=pd.to_numeric(df[col], errors='coerce').fillna(0) 
    # Scale features
    df_scaled = scaler.transform(df)
    return df_scaled, df

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "message": "StayIQ ML API is running successfully!",
        "endpoints": ["/api/predict", "/api/predict_batch", "/health"]
    })

@app.route("/health", methods=["GET"])
def health():
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500
    return jsonify({"status": "healthy", "message": "ML Model and artifacts loaded successfully"})

@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        X_scaled, X_raw = prepare_data(data)
        
        # Predict probability
        prob = model.predict_proba(X_scaled)[0][1]
        
        # Determine Risk Level and Color
        risk = "HIGH" if prob >= 0.7 else "MEDIUM" if prob >= 0.4 else "LOW"
        risk_color = "#ef4444" if risk == "HIGH" else "#f59e0b" if risk == "MEDIUM" else "#10b981"
        confidence = float(max(prob, 1 - prob))
        
        # Calculate SHAP values for explainability
        shap_values = explainer.shap_values(X_scaled)
        
        # Extract base value. For XGBoost binary classification, expected_value can be an array or scalar.
        try:
            if isinstance(explainer.expected_value, np.ndarray):
                base_val = float(explainer.expected_value[0])
            else:
                base_val = float(explainer.expected_value)
        except:
            base_val = 0.5
        
        # Format top features (feature importance for this specific prediction)
        # shap_values[0] because we only have 1 instance
        impacts = np.abs(shap_values[0])
        top_indices = np.argsort(impacts)[::-1][:5] # top 5 features
        
        top_features = []
        for idx in top_indices:
            feature_name = feature_names[idx]
            impact_val = float(shap_values[0][idx])
            top_features.append({
                "feature": feature_name,
                "impact": impact_val,
                "abs_impact": abs(impact_val),
                "direction": "up" if impact_val > 0 else "down"
            })
            
        return jsonify({
            "probability": float(prob),
            "risk": risk,
            "risk_color": risk_color,
            "confidence": confidence,
            "top_features": top_features,
            "shap_base_value": base_val,
            "input_features": data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/predict_batch", methods=["POST"])
def predict_batch():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        rows = request.json
        predictions = []
        
        # For a real implementation, we'd batch-process the entire DataFrame.
        # But for MVP simplicity and to mimic the mock behavior:
        high = 0
        medium = 0
        low = 0
        total_prob = 0
        
        for i, row_data in enumerate(rows):
            X_scaled, _ = prepare_data(row_data)
            prob = float(model.predict_proba(X_scaled)[0][1])
            risk = "HIGH" if prob >= 0.7 else "MEDIUM" if prob >= 0.4 else "LOW"
            
            if risk == "HIGH": high += 1
            elif risk == "MEDIUM": medium += 1
            else: low += 1
            
            total_prob += prob
            
            risk_color = "#ef4444" if risk == "HIGH" else "#f59e0b" if risk == "MEDIUM" else "#10b981"
            
            predictions.append({
                "row_index": i,
                "probability": round(prob, 4),
                "risk": risk,
                "risk_color": risk_color
            })
            
        avg_prob = total_prob / len(rows) if rows else 0
        
        # Mocking global feature importance for the batch
        feature_importance = [
            {"feature": "deposit_type", "importance": 0.28},
            {"feature": "lead_time", "importance": 0.19},
            {"feature": "previous_cancellations", "importance": 0.14},
            {"feature": "adr", "importance": 0.09},
        ]
        
        return jsonify({
            "summary": {
                "total_rows": len(rows),
                "high_risk_count": high,
                "medium_risk_count": medium,
                "low_risk_count": low,
                "high_risk_percentage": round((high / len(rows)) * 100, 1) if rows else 0,
                "average_probability": round(avg_prob, 4)
            },
            "predictions": predictions,
            "feature_importance": feature_importance,
            "risk_distribution": [
                {"name": "Low Risk", "value": low, "color": "#10b981"},
                {"name": "Medium Risk", "value": medium, "color": "#f59e0b"},
                {"name": "High Risk", "value": high, "color": "#ef4444"},
            ]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    load_ml_artifacts()
    print("Starting Flask API on http://localhost:5000")
    serve(app, host="0.0.0.0", port=5000)
