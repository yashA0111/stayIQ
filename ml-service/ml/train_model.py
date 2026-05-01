"""
StayIQ — Model Training Pipeline
Trains Logistic Regression (baseline) + XGBoost (primary) on the
Kaggle Hotel Booking Demand dataset for cancellation prediction.
Evaluates both models, saves the best along with scaler and feature metadata.
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "..", "hotel_bookings.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, "feature_names.json")
LABEL_ENCODERS_PATH = os.path.join(BASE_DIR, "label_encoders.pkl")


# ── Columns to drop (leakage + noise) ────────────────────────────────────
LEAKAGE_COLS = ["reservation_status", "reservation_status_date"]
DROP_COLS = LEAKAGE_COLS + ["arrival_date_year", "arrival_date_month",
                             "arrival_date_week_number", "arrival_date_day_of_month",
                             "company"]

# ── Categorical columns that need encoding ────────────────────────────────
CATEGORICAL_COLS = [
    "hotel", "meal", "country", "market_segment",
    "distribution_channel", "deposit_type", "customer_type",
    "reserved_room_type", "assigned_room_type",
]

TARGET_COL = "is_canceled"


def load_and_clean_data(path: str) -> pd.DataFrame:
    """Load the hotel bookings CSV and clean known data quality issues."""
    print("=" * 60)
    print("STAYIQ — MODEL TRAINING PIPELINE")
    print("=" * 60)

    df = pd.read_csv(path)
    print(f"\n[OK] Dataset loaded: {df.shape[0]:,} rows, {df.shape[1]} columns")

    # ── Handle known data issues ──────────────────────────────────────
    # String "NULL" in agent and company
    df["agent"] = pd.to_numeric(df["agent"].replace("NULL", np.nan), errors="coerce").fillna(0).astype(int)
    df["company"] = pd.to_numeric(df["company"].replace("NULL", np.nan), errors="coerce").fillna(0).astype(int)

    # Missing values
    df["country"] = df["country"].fillna("Unknown")
    df["children"] = df["children"].fillna(0).astype(int)

    # Negative ADR — clip to 0
    df["adr"] = df["adr"].clip(lower=0)

    print(f"[OK] Data cleaning complete")
    return df


def engineer_features(df: pd.DataFrame):
    """Feature engineering: encode categoricals, create derived features, drop leakage."""

    # ── Drop leakage and noise columns ────────────────────────────────
    cols_to_drop = [c for c in DROP_COLS if c in df.columns]
    df = df.drop(columns=cols_to_drop)
    print(f"[OK] Dropped {len(cols_to_drop)} columns (leakage/noise): {cols_to_drop}")

    # ── Removed derived features to match frontend exactly ──
    print(f"[OK] Using base features matching frontend")

    # ── Encode categorical columns ────────────────────────────────────
    label_encoders = {}
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
            print(f"  [OK] Encoded '{col}': {len(le.classes_)} categories")

    # ── Separate features and target ──────────────────────────────────
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    print(f"\n[OK] Final features: {X.shape[1]}")
    print(f"[OK] Target distribution:")
    print(f"  - Not canceled (0): {(y == 0).sum():,} ({(y == 0).mean():.1%})")
    print(f"  - Canceled    (1): {(y == 1).sum():,} ({(y == 1).mean():.1%})")

    return X, y, label_encoders


def train_and_evaluate(X: pd.DataFrame, y: pd.Series):
    """Train LR baseline + XGBoost, evaluate both, return best model."""

    feature_names = list(X.columns)

    # ── Train/test split ──────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n[OK] Train/test split: {X_train.shape[0]:,} train, {X_test.shape[0]:,} test")

    # ── Scale features ────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    results = {}

    # ── Logistic Regression (baseline) ────────────────────────────────
    print("\n" + "-" * 50)
    print("BASELINE: Logistic Regression")
    print("-" * 50)
    lr = LogisticRegression(
        max_iter=1000,
        random_state=42,
        class_weight="balanced",
    )
    lr.fit(X_train_scaled, y_train)

    lr_probs = lr.predict_proba(X_test_scaled)[:, 1]
    lr_preds = lr.predict(X_test_scaled)

    lr_auc = roc_auc_score(y_test, lr_probs)
    lr_prec = precision_score(y_test, lr_preds)
    lr_recall = recall_score(y_test, lr_preds)
    lr_f1 = f1_score(y_test, lr_preds)

    print(f"  ROC-AUC:   {lr_auc:.4f}")
    print(f"  Precision: {lr_prec:.4f}")
    print(f"  Recall:    {lr_recall:.4f}")
    print(f"  F1-Score:  {lr_f1:.4f}")
    results["lr"] = {"model": lr, "auc": lr_auc, "name": "Logistic Regression"}

    # ── XGBoost (primary model) ───────────────────────────────────────
    print("\n" + "-" * 50)
    print("PRIMARY: XGBoost")
    print("-" * 50)

    # Handle class imbalance with scale_pos_weight
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = neg_count / pos_count
    print(f"  Class ratio: {neg_count:,} neg / {pos_count:,} pos")
    print(f"  scale_pos_weight: {scale_pos_weight:.2f}")

    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="auc",
        use_label_encoder=False,
    )
    xgb.fit(X_train_scaled, y_train, verbose=False)

    xgb_probs = xgb.predict_proba(X_test_scaled)[:, 1]
    xgb_preds = xgb.predict(X_test_scaled)

    xgb_auc = roc_auc_score(y_test, xgb_probs)
    xgb_prec = precision_score(y_test, xgb_preds)
    xgb_recall = recall_score(y_test, xgb_preds)
    xgb_f1 = f1_score(y_test, xgb_preds)

    print(f"  ROC-AUC:   {xgb_auc:.4f}")
    print(f"  Precision: {xgb_prec:.4f}")
    print(f"  Recall:    {xgb_recall:.4f}")
    print(f"  F1-Score:  {xgb_f1:.4f}")
    results["xgb"] = {"model": xgb, "auc": xgb_auc, "name": "XGBoost"}

    # ── Select best model ─────────────────────────────────────────────
    best_key = max(results, key=lambda k: results[k]["auc"])
    best = results[best_key]

    print(f"\n{'=' * 50}")
    print(f"BEST MODEL: {best['name']} (ROC-AUC: {best['auc']:.4f})")
    print(f"{'=' * 50}")

    # Detailed report for best model
    if best_key == "xgb":
        best_preds = xgb_preds
        cm = confusion_matrix(y_test, xgb_preds)
    else:
        best_preds = lr_preds
        cm = confusion_matrix(y_test, lr_preds)

    print(f"\nConfusion Matrix:")
    print(f"  TN={cm[0][0]:,}  FP={cm[0][1]:,}")
    print(f"  FN={cm[1][0]:,}  TP={cm[1][1]:,}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, best_preds,
                                target_names=["Not Canceled", "Canceled"]))

    return best["model"], scaler, feature_names


def save_artifacts(model, scaler, feature_names, label_encoders):
    """Save trained model, scaler, feature names, and label encoders to disk."""
    joblib.dump(model, MODEL_PATH)
    print(f"[OK] Model saved to {MODEL_PATH}")

    joblib.dump(scaler, SCALER_PATH)
    print(f"[OK] Scaler saved to {SCALER_PATH}")

    with open(FEATURE_NAMES_PATH, "w") as f:
        json.dump(feature_names, f, indent=2)
    print(f"[OK] Feature names saved to {FEATURE_NAMES_PATH}")

    joblib.dump(label_encoders, LABEL_ENCODERS_PATH)
    print(f"[OK] Label encoders saved to {LABEL_ENCODERS_PATH}")


if __name__ == "__main__":
    df = load_and_clean_data(DATA_PATH)
    X, y, label_encoders = engineer_features(df)
    model, scaler, feature_names = train_and_evaluate(X, y)
    save_artifacts(model, scaler, feature_names, label_encoders)
    print(f"\n{'=' * 60}")
    print("[OK] TRAINING PIPELINE COMPLETE")
    print(f"{'=' * 60}")
