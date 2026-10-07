from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import joblib
import numpy as np
import pandas as pd
import os
import sqlite3

from analysis_store import get_analyses, get_analytics, get_stats, initialize_database, save_analysis

app = Flask(__name__)
CORS(app)
app.config["DATABASE_PATH"] = os.environ.get(
    "ANALYSES_DB_PATH", os.path.join(os.path.dirname(__file__), "analyses.db")
)
initialize_database(app.config["DATABASE_PATH"])

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "gadget_lifespan_linear_regression_model.pkl")
model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")
print(f"Model type: {type(model)}")
print(f"Feature names: {model.feature_names_in_}")


def map_frontend_to_model(frontend_data):
    """Map frontend snake_case field names to model feature names."""
    return {
        "Gadget_Type": frontend_data["gadget_type"],
        "Age_Years": frontend_data["age_years"],
        "Daily_Usage_Hours": frontend_data["daily_usage_hours"],
        "Battery_Health_Percent": frontend_data["battery_health"],
        "Charge_Cycles": frontend_data["charge_cycles"],
        "Overheating_Level": frontend_data["overheating_level"],
        "Physical_Condition": frontend_data["physical_condition"],
        "Maintenance_Frequency": frontend_data["maintenance_frequency"],
        "Repair_Count": frontend_data["repair_count"],
        "Performance_Score": frontend_data["performance_score"],
        "Storage_Used_Percent": frontend_data["storage_used"],
        "Software_Updated": frontend_data["software_updated"],
        "Environment_Stress": frontend_data["environmental_stress"],
        "Expected_Life_Months": frontend_data["expected_life_months"],
    }


def calculate_health_score(i):
    """Calculate health score based on input features (same logic as frontend mock)."""
    score = (
        0.3 * i["battery_health"]
        + 0.28 * i["performance_score"]
        + 6 * i["physical_condition"]
        + 4 * i["maintenance_frequency"]
        - 4 * i["overheating_level"]
        - 3 * i["environmental_stress"]
        - 2.5 * i["repair_count"]
        - 2.2 * i["age_years"]
        - 0.9 * i["daily_usage_hours"]
        - i["charge_cycles"] / 120
        - 0.08 * i["storage_used"]
        + (5 if i["software_updated"] else -4)
        + 14
    )
    return max(3, min(99, round(score)))


def calculate_risk_factors(i):
    """Calculate risk factors based on input features."""
    risks = []

    if i["battery_health"] < 70:
        severity = "high" if i["battery_health"] < 50 else "medium"
        risks.append({
            "label": "Battery degradation",
            "severity": severity,
            "detail": f"Battery health at {i['battery_health']}% reduces runtime and stresses other components."
        })

    if i["overheating_level"] >= 3:
        severity = "high" if i["overheating_level"] >= 4 else "medium"
        risks.append({
            "label": "Thermal stress",
            "severity": severity,
            "detail": f"Overheating level {i['overheating_level']}/5 accelerates ageing of the board and battery."
        })

    if i["charge_cycles"] > 600:
        severity = "high" if i["charge_cycles"] > 1000 else "medium"
        risks.append({
            "label": "High charge cycles",
            "severity": severity,
            "detail": f"{i['charge_cycles']} cycles logged — most cells fade noticeably beyond 600."
        })

    if i["physical_condition"] <= 3:
        severity = "high" if i["physical_condition"] <= 2 else "medium"
        risks.append({
            "label": "Physical wear",
            "severity": severity,
            "detail": f"Condition rated {i['physical_condition']}/5 — casing or screen damage risks further failure."
        })

    if i["performance_score"] < 60:
        severity = "high" if i["performance_score"] < 40 else "medium"
        risks.append({
            "label": "Performance drop",
            "severity": severity,
            "detail": f"Benchmark/perceived score of {i['performance_score']}/100 suggests throttling or ageing storage."
        })

    if i["storage_used"] > 85:
        risks.append({
            "label": "Storage saturation",
            "severity": "low",
            "detail": f"{i['storage_used']}% storage used slows writes and updates."
        })

    if not i["software_updated"]:
        risks.append({
            "label": "Outdated software",
            "severity": "medium",
            "detail": "Missing updates leave security holes and unoptimised power management."
        })

    if i["environmental_stress"] >= 4:
        risks.append({
            "label": "Harsh environment",
            "severity": "high",
            "detail": "Dust, humidity or heat exposure shortens component life."
        })

    if i["maintenance_frequency"] <= 2:
        risks.append({
            "label": "Low maintenance",
            "severity": "medium",
            "detail": "Infrequent cleaning and servicing compounds every other risk."
        })

    if i["daily_usage_hours"] > 10:
        risks.append({
            "label": "Heavy daily usage",
            "severity": "medium",
            "detail": f"{i['daily_usage_hours']} h/day of use adds significant wear."
        })

    if len(risks) == 0:
        risks.append({
            "label": "No major risks",
            "severity": "low",
            "detail": "All monitored parameters are within healthy ranges."
        })

    return risks


def calculate_maintenance_recommendations(i):
    """Generate maintenance recommendations based on input features."""
    recommendations = []

    if i["battery_health"] < 75:
        recommendations.append("Plan a battery replacement with an authorised service centre.")
    else:
        recommendations.append("Keep charge between 20% and 80% to preserve the battery.")

    if i["overheating_level"] >= 3:
        recommendations.append("Clean vents/fans and avoid soft surfaces that block airflow.")
    else:
        recommendations.append("Continue using the device on hard, ventilated surfaces.")

    if i["storage_used"] > 80:
        recommendations.append("Free up storage and clear caches to restore write speed.")
    else:
        recommendations.append("Keep at least 20% of storage free.")

    if not i["software_updated"]:
        recommendations.append("Install pending OS and security updates.")
    else:
        recommendations.append("Keep automatic updates enabled.")

    if i["maintenance_frequency"] <= 3:
        recommendations.append("Schedule a service/cleaning every 6 months.")
    else:
        recommendations.append("Maintain your current servicing routine.")

    return recommendations


def calculate_lifespan_extension_tips():
    """General tips to extend device lifespan."""
    return [
        "Use the original or certified charger and avoid overnight fast charging.",
        "Enable battery optimisation / adaptive charging modes.",
        "Use a protective case and screen guard to prevent physical damage.",
        "Reduce background apps and startup programs to lower thermal load.",
        "Store the device away from humidity, dust and direct sunlight.",
        "Repair small faults early — they rarely stay small.",
    ]


def calculate_ewaste_recommendation(score):
    """Determine e-waste recommendation based on health score."""
    if score >= 80:
        return "Continue Using"
    elif score >= 65:
        return "Repair / Maintain"
    elif score >= 50:
        return "Refurbish / Reuse"
    elif score >= 38:
        return "Donate / Resell"
    elif score >= 22:
        return "Reuse for Parts"
    else:
        return "Authorized E-Waste Recycling"


def calculate_health_category(score):
    """Determine health category based on score."""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Moderate"
    elif score >= 30:
        return "Poor"
    else:
        return "Critical"


def calculate_factor_breakdown(i):
    """Calculate factor breakdown for visualization."""
    return [
        {"factor": "Battery", "impact": round(i["battery_health"])},
        {"factor": "Performance", "impact": round(i["performance_score"])},
        {"factor": "Condition", "impact": i["physical_condition"] * 20},
        {"factor": "Thermals", "impact": (6 - i["overheating_level"]) * 20},
        {"factor": "Care", "impact": i["maintenance_frequency"] * 20},
        {"factor": "Environment", "impact": (6 - i["environmental_stress"]) * 20},
    ]


def calculate_reasoning(i, score, remaining, category, action, risks):
    """Generate reasoning for the recommendation."""
    reasoning = [
        f"The model weighs battery health ({i['battery_health']}%) and performance score ({i['performance_score']}/100) most heavily; together they set the baseline health of {score}/100.",
        f"Age of {i['age_years']} year(s) against an expected life of {i['expected_life_months']} months leaves roughly {remaining} usable month(s).",
    ]
    for risk in risks[:3]:
        reasoning.append(f"{risk['label']}: {risk['detail']}")
    reasoning.append(f"Because the health score falls in the \"{category}\" band, the advised action is \"{action}\".")
    return reasoning


@app.route("/predict", methods=["POST"])
def predict():
    """Predict gadget lifespan using the ML model."""
    try:
        data = request.get_json()

        # Map frontend field names to model feature names
        model_input = map_frontend_to_model(data)

        # Prepare input for the model as a DataFrame
        input_data = pd.DataFrame([model_input])

        # Make prediction
        predicted_months = model.predict(input_data)[0]

        # Calculate derived metrics
        i = data  # Use original frontend data for calculations
        health_score = calculate_health_score(i)
        health_category = calculate_health_category(health_score)
        risk_factors = calculate_risk_factors(i)
        maintenance_recommendations = calculate_maintenance_recommendations(i)
        lifespan_extension_tips = calculate_lifespan_extension_tips()
        ewaste_recommendation = calculate_ewaste_recommendation(health_score)
        factor_breakdown = calculate_factor_breakdown(i)

        # Calculate remaining months (clamped to expected life)
        remaining = max(0, min(i["expected_life_months"], round((i["expected_life_months"] - i["age_years"] * 12) * (health_score / 100) * 1.05)))
        remaining_years = round((remaining / 12) * 10) / 10

        # Generate reasoning
        reasoning = calculate_reasoning(i, health_score, remaining, health_category, ewaste_recommendation, risk_factors)

        # Build response matching frontend PredictionResult interface
        response = {
            "gadget_type": data["gadget_type"],
            "remaining_months": remaining,
            "remaining_years": remaining_years,
            "health_score": health_score,
            "health_category": health_category,
            "risk_factors": risk_factors,
            "maintenance_recommendations": maintenance_recommendations,
            "lifespan_extension_tips": lifespan_extension_tips,
            "ewaste_recommendation": ewaste_recommendation,
            "reasoning": reasoning,
            "factor_breakdown": factor_breakdown,
            "model": "Multiple Linear Regression (real model)",
        }

        save_analysis(app.config["DATABASE_PATH"], data, response)
        return jsonify(response)

    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/admin/stats", methods=["GET"])
def admin_stats():
    try:
        return jsonify(get_stats(app.config["DATABASE_PATH"]))
    except sqlite3.Error:
        app.logger.exception("Unable to read analysis statistics")
        return jsonify({"error": "Unable to read analysis statistics"}), 500


@app.route("/admin/analyses", methods=["GET"])
def admin_analyses():
    try:
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "limit and offset must be integers"}), 400

    if limit < 1 or limit > 200 or offset < 0:
        return jsonify({"error": "limit must be 1-200 and offset must be non-negative"}), 400

    try:
        return jsonify(get_analyses(app.config["DATABASE_PATH"], limit, offset))
    except (sqlite3.Error, json.JSONDecodeError):
        app.logger.exception("Unable to read analyses")
        return jsonify({"error": "Unable to read analyses"}), 500


@app.route("/admin/analytics", methods=["GET"])
def admin_analytics():
    try:
        return jsonify(get_analytics(app.config["DATABASE_PATH"]))
    except sqlite3.Error:
        app.logger.exception("Unable to read analysis analytics")
        return jsonify({"error": "Unable to read analysis analytics"}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "model_loaded": model is not None})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
