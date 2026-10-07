import json
import os
import sqlite3
import sys
import tempfile
import types
import unittest
from contextlib import closing
from unittest.mock import patch

class FakeModel:
    feature_names_in_ = []

    def __init__(self):
        self.input_data = None

    def predict(self, input_data):
        self.input_data = input_data
        return [42]


joblib_stub = types.ModuleType("joblib")
joblib_stub.load = lambda _model_path: FakeModel()
cors_stub = types.ModuleType("flask_cors")
cors_stub.CORS = lambda flask_app: flask_app
pandas_stub = types.ModuleType("pandas")
pandas_stub.DataFrame = lambda rows: rows
numpy_stub = types.ModuleType("numpy")
with patch.dict(
    sys.modules,
    {
        "joblib": joblib_stub,
        "flask_cors": cors_stub,
        "pandas": pandas_stub,
        "numpy": numpy_stub,
    },
):
    import app as backend_module

app = backend_module.app
initialize_database = backend_module.initialize_database


class AnalysisApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.database_path = os.path.join(self.temp_dir.name, "test_analyses.db")
        app.config["DATABASE_PATH"] = self.database_path
        initialize_database(self.database_path)
        self.client = app.test_client()
        self.input_data = {
            "gadget_type": "Laptop",
            "age_years": 3,
            "daily_usage_hours": 6,
            "battery_health": 78,
            "charge_cycles": 420,
            "overheating_level": 2,
            "physical_condition": 4,
            "maintenance_frequency": 3,
            "repair_count": 1,
            "performance_score": 72,
            "storage_used": 65,
            "software_updated": True,
            "environmental_stress": 2,
            "expected_life_months": 72,
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def post_prediction(self, data=None):
        self.model = FakeModel()
        with patch.object(backend_module, "model", self.model):
            return self.client.post("/predict", json=data or self.input_data)

    def test_database_creation_is_idempotent(self):
        initialize_database(self.database_path)
        with closing(sqlite3.connect(self.database_path)) as connection:
            tables = connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'analyses'"
            ).fetchall()
        self.assertEqual(tables, [("analyses",)])

    def test_prediction_response_and_database_insertion(self):
        response = self.post_prediction()

        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(
            set(result),
            {
                "gadget_type",
                "remaining_months",
                "remaining_years",
                "health_score",
                "health_category",
                "risk_factors",
                "maintenance_recommendations",
                "lifespan_extension_tips",
                "ewaste_recommendation",
                "reasoning",
                "factor_breakdown",
                "model",
            },
        )
        self.assertEqual(result["model"], "Multiple Linear Regression (real model)")
        self.assertEqual(result["gadget_type"], self.input_data["gadget_type"])
        self.assertEqual(self.model.input_data[0]["Gadget_Type"], "Laptop")
        with closing(sqlite3.connect(self.database_path)) as connection:
            row = connection.execute(
                "SELECT gadget_type, battery_health, software_updated, health_score, result_json FROM analyses"
            ).fetchone()
        self.assertEqual(row[0:3], ("Laptop", 78.0, 1))
        self.assertEqual(row[3], result["health_score"])
        self.assertEqual(json.loads(row[4]), result)

    def test_admin_endpoints_return_database_data(self):
        self.post_prediction()
        second_input = {**self.input_data, "gadget_type": "Smartphone"}
        self.post_prediction(second_input)

        stats_response = self.client.get("/admin/stats")
        analyses_response = self.client.get("/admin/analyses")
        analytics_response = self.client.get("/admin/analytics")

        self.assertEqual(stats_response.status_code, 200)
        stats = stats_response.get_json()
        self.assertEqual(stats["total_analyses"], 2)
        self.assertIsInstance(stats["average_health_score"], (int, float))
        self.assertEqual(stats["gadget_type_counts"], {"Laptop": 1, "Smartphone": 1})
        self.assertEqual(sum(stats["health_category_counts"].values()), 2)
        self.assertEqual(sum(stats["ewaste_recommendation_counts"].values()), 2)

        analyses = analyses_response.get_json()
        self.assertEqual(analyses_response.status_code, 200)
        self.assertEqual(analyses["total"], 2)
        self.assertEqual(len(analyses["analyses"]), 2)
        self.assertEqual(analyses["analyses"][0]["input"]["gadget_type"], "Smartphone")

        analytics = analytics_response.get_json()
        self.assertEqual(analytics_response.status_code, 200)
        lifespan = analytics["remaining_lifespan"]
        self.assertEqual(lifespan["count"], 2)
        self.assertIsNotNone(lifespan["average_months"])
        self.assertIsNotNone(lifespan["median_months"])
        self.assertEqual(lifespan["min_months"], lifespan["max_months"])

    def test_analyses_reject_invalid_pagination(self):
        response = self.client.get("/admin/analyses?limit=500")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())


if __name__ == "__main__":
    unittest.main()