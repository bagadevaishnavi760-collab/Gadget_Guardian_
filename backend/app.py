from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import secrets
import uuid

from database import analytics, init_db, list_predictions, save_prediction, summary

app = Flask(__name__)
allowed_origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "").split(",") if origin.strip()]
CORS(app, origins=allowed_origins or "*")

# Load the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "gadget_lifespan_linear_regression_model.pkl")
model = joblib.load(MODEL_PATH)
init_db()

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


REQUIRED_FIELDS = {
    "gadget_type", "age_years", "daily_usage_hours", "battery_health",
    "charge_cycles", "overheating_level", "physical_condition",
    "maintenance_frequency", "repair_count", "performance_score",
    "storage_used", "software_updated", "environmental_stress",
    "expected_life_months",
}
GADGET_TYPES = {"Laptop", "Smartphone", "Tablet", "Smartwatch"}


def validate_input(data):
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")
    missing = REQUIRED_FIELDS - data.keys()
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(sorted(missing))}.")
    if data["gadget_type"] not in GADGET_TYPES:
        raise ValueError("Unsupported gadget type.")
    numeric_ranges = {
        "age_years": (0, 25), "daily_usage_hours": (0, 24), "battery_health": (0, 100),
        "charge_cycles": (0, 5000), "overheating_level": (1, 5),
        "physical_condition": (1, 5), "maintenance_frequency": (1, 5),
        "repair_count": (0, 50), "performance_score": (0, 100),
        "storage_used": (0, 100), "environmental_stress": (1, 5),
        "expected_life_months": (6, 240),
    }
    for field, (minimum, maximum) in numeric_ranges.items():
        value = data[field]
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not minimum <= value <= maximum:
            raise ValueError(f"{field} must be between {minimum} and {maximum}.")
    if not isinstance(data["software_updated"], bool):
        raise ValueError("software_updated must be a boolean.")


def admin_required():
    configured_token = os.environ.get("ADMIN_API_TOKEN")
    if not configured_token:
        return jsonify({"error": "Admin API is not configured. Set ADMIN_API_TOKEN on the backend."}), 503
    supplied = request.headers.get("X-Admin-Token", "")
    if not secrets.compare_digest(supplied, configured_token):
        return jsonify({"error": "Admin authentication required."}), 401
    return None


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
        data = request.get_json(silent=True)
        validate_input(data)

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

        # Use the persisted model output as the lifespan prediction.
        remaining = max(0, min(i["expected_life_months"], round(float(predicted_months), 1)))
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

        record = save_prediction(str(uuid.uuid4()), data, response)
        response["record_id"] = record["id"]
        response["created_at"] = record["date"]
        return jsonify(response)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Prediction service failed."}), 500


@app.route("/admin/summary", methods=["GET"])
def admin_summary():
    auth_error = admin_required()
    if auth_error:
        return auth_error
    return jsonify(summary())


@app.route("/admin/analytics", methods=["GET"])
def admin_analytics():
    auth_error = admin_required()
    if auth_error:
        return auth_error
    return jsonify(analytics())


@app.route("/admin/records", methods=["GET"])
def admin_records():
    auth_error = admin_required()
    if auth_error:
        return auth_error
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("per_page", 20))))
    except ValueError:
        return jsonify({"error": "page and per_page must be integers."}), 400
    records, total = list_predictions(
        search=request.args.get("search", ""),
        gadget_type=request.args.get("gadget_type", ""),
        health_category=request.args.get("health_category", ""),
        recommendation=request.args.get("recommendation", ""),
        sort=request.args.get("sort", "created_at"),
        direction=request.args.get("direction", "desc"),
        page=page,
        per_page=per_page,
    )
    return jsonify({"records": records, "total": total, "page": page, "per_page": per_page})


@app.route("/admin/model-metrics", methods=["GET"])
def admin_model_metrics():
    auth_error = admin_required()
    if auth_error:
        return auth_error
    metrics_path = os.path.join(os.path.dirname(__file__), "model_metrics.json")
    if not os.path.exists(metrics_path):
        return jsonify({"configured": False, "message": "Verified evaluation metrics have not been configured."})
    import json
    with open(metrics_path, encoding="utf-8") as metrics_file:
        return jsonify({"configured": True, "metrics": json.load(metrics_file)})


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "model_loaded": model is not None})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=os.environ.get("FLASK_DEBUG", "").lower() == "true",
    )
