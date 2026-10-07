import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone


INPUT_COLUMNS = (
    "gadget_type",
    "age_years",
    "daily_usage_hours",
    "battery_health",
    "charge_cycles",
    "overheating_level",
    "physical_condition",
    "maintenance_frequency",
    "repair_count",
    "performance_score",
    "storage_used",
    "software_updated",
    "environmental_stress",
    "expected_life_months",
)


@contextmanager
def get_connection(database_path):
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database(database_path):
    with get_connection(database_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                gadget_type TEXT NOT NULL,
                age_years REAL NOT NULL,
                daily_usage_hours REAL NOT NULL,
                battery_health REAL NOT NULL,
                charge_cycles INTEGER NOT NULL,
                overheating_level INTEGER NOT NULL,
                physical_condition INTEGER NOT NULL,
                maintenance_frequency INTEGER NOT NULL,
                repair_count INTEGER NOT NULL,
                performance_score REAL NOT NULL,
                storage_used REAL NOT NULL,
                software_updated INTEGER NOT NULL,
                environmental_stress INTEGER NOT NULL,
                expected_life_months INTEGER NOT NULL,
                remaining_months REAL NOT NULL,
                remaining_years REAL NOT NULL,
                health_score REAL NOT NULL,
                health_category TEXT NOT NULL,
                ewaste_recommendation TEXT NOT NULL,
                model TEXT NOT NULL,
                result_json TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_analyses_gadget_type ON analyses(gadget_type)"
        )


def save_analysis(database_path, input_data, result):
    columns = ", ".join(INPUT_COLUMNS)
    placeholders = ", ".join("?" for _ in INPUT_COLUMNS)
    values = [input_data[column] for column in INPUT_COLUMNS]
    values[INPUT_COLUMNS.index("software_updated")] = int(values[INPUT_COLUMNS.index("software_updated")])

    with get_connection(database_path) as connection:
        cursor = connection.execute(
            f"""
            INSERT INTO analyses (
                created_at, {columns}, remaining_months, remaining_years,
                health_score, health_category, ewaste_recommendation, model, result_json
            ) VALUES (?, {placeholders}, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now(timezone.utc).isoformat(),
                *values,
                result["remaining_months"],
                result["remaining_years"],
                result["health_score"],
                result["health_category"],
                result["ewaste_recommendation"],
                result["model"],
                json.dumps(result),
            ),
        )
        return cursor.lastrowid


def get_counts(connection, column):
    rows = connection.execute(
        f"SELECT {column} AS name, COUNT(*) AS count FROM analyses GROUP BY {column} ORDER BY {column}"
    ).fetchall()
    return {row["name"]: row["count"] for row in rows}


def get_stats(database_path):
    with get_connection(database_path) as connection:
        summary = connection.execute(
            "SELECT COUNT(*) AS total, AVG(health_score) AS average_health_score FROM analyses"
        ).fetchone()
        return {
            "total_analyses": summary["total"],
            "average_health_score": (
                round(summary["average_health_score"], 2)
                if summary["average_health_score"] is not None
                else None
            ),
            "gadget_type_counts": get_counts(connection, "gadget_type"),
            "health_category_counts": get_counts(connection, "health_category"),
            "ewaste_recommendation_counts": get_counts(connection, "ewaste_recommendation"),
        }


def get_analytics(database_path):
    with get_connection(database_path) as connection:
        remaining_values = [
            row["remaining_months"]
            for row in connection.execute(
                "SELECT remaining_months FROM analyses ORDER BY remaining_months"
            )
        ]
        if remaining_values:
            count = len(remaining_values)
            middle = count // 2
            median = (
                remaining_values[middle]
                if count % 2
                else (remaining_values[middle - 1] + remaining_values[middle]) / 2
            )
            lifespan = {
                "count": count,
                "average_months": round(sum(remaining_values) / count, 2),
                "median_months": round(median, 2),
                "min_months": remaining_values[0],
                "max_months": remaining_values[-1],
            }
        else:
            lifespan = {
                "count": 0,
                "average_months": None,
                "median_months": None,
                "min_months": None,
                "max_months": None,
            }

        return {
            "gadget_type_counts": get_counts(connection, "gadget_type"),
            "health_category_counts": get_counts(connection, "health_category"),
            "ewaste_recommendation_counts": get_counts(connection, "ewaste_recommendation"),
            "remaining_lifespan": lifespan,
        }


def get_analyses(database_path, limit, offset):
    with get_connection(database_path) as connection:
        total = connection.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
        rows = connection.execute(
            "SELECT * FROM analyses ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset)
        ).fetchall()

    analyses = []
    for row in rows:
        analysis = dict(row)
        analysis["software_updated"] = bool(analysis["software_updated"])
        analysis["input"] = {column: analysis.pop(column) for column in INPUT_COLUMNS}
        analysis["result"] = json.loads(analysis.pop("result_json"))
        analyses.append(analysis)
    return {"analyses": analyses, "total": total, "limit": limit, "offset": offset}