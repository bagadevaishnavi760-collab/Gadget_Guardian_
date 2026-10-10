"""Small SQLite persistence layer for prediction records."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator


DATABASE_PATH = os.environ.get(
    "GADGET_GUARDIAN_DATABASE",
    os.path.join(os.path.dirname(__file__), "gadget_guardian.sqlite3"),
)


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.dirname(os.path.abspath(DATABASE_PATH)), exist_ok=True)
    with connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS prediction_records (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                gadget_type TEXT NOT NULL,
                health_score INTEGER NOT NULL,
                health_category TEXT NOT NULL,
                remaining_months REAL NOT NULL,
                ewaste_recommendation TEXT NOT NULL,
                input_json TEXT NOT NULL,
                result_json TEXT NOT NULL
            )
            """
        )


def save_prediction(record_id: str, input_data: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    created_at = datetime.now(timezone.utc).isoformat()
    with connection() as conn:
        conn.execute(
            """
            INSERT INTO prediction_records
              (id, created_at, gadget_type, health_score, health_category,
               remaining_months, ewaste_recommendation, input_json, result_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record_id,
                created_at,
                result["gadget_type"],
                result["health_score"],
                result["health_category"],
                result["remaining_months"],
                result["ewaste_recommendation"],
                json.dumps(input_data),
                json.dumps(result),
            ),
        )
    return {"id": record_id, "date": created_at, "input": input_data, "result": result}


def _record(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "date": row["created_at"],
        "input": json.loads(row["input_json"]),
        "result": json.loads(row["result_json"]),
    }


def list_predictions(
    *, search: str = "", gadget_type: str = "", health_category: str = "",
    recommendation: str = "", sort: str = "created_at", direction: str = "desc",
    page: int = 1, per_page: int = 20,
) -> tuple[list[dict[str, Any]], int]:
    allowed_sort = {
        "created_at": "created_at", "gadget_type": "gadget_type",
        "health_score": "health_score", "remaining_months": "remaining_months",
    }
    sort_column = allowed_sort.get(sort, "created_at")
    order = "ASC" if direction.lower() == "asc" else "DESC"
    filters = []
    params: list[Any] = []
    if search:
        filters.append("(gadget_type LIKE ? OR id LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%"])
    if gadget_type:
        filters.append("gadget_type = ?")
        params.append(gadget_type)
    if health_category:
        filters.append("health_category = ?")
        params.append(health_category)
    if recommendation:
        filters.append("ewaste_recommendation = ?")
        params.append(recommendation)
    where = f" WHERE {' AND '.join(filters)}" if filters else ""
    offset = max(0, page - 1) * per_page
    with connection() as conn:
        total = conn.execute(f"SELECT COUNT(*) FROM prediction_records{where}", params).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM prediction_records{where} ORDER BY {sort_column} {order} LIMIT ? OFFSET ?",
            [*params, per_page, offset],
        ).fetchall()
    return [_record(row) for row in rows], total


def summary() -> dict[str, Any]:
    with connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM prediction_records").fetchone()[0]
        avg = conn.execute("SELECT AVG(health_score) FROM prediction_records").fetchone()[0]
        by_type = conn.execute(
            "SELECT gadget_type AS label, COUNT(*) AS count FROM prediction_records GROUP BY gadget_type ORDER BY count DESC"
        ).fetchall()
        by_category = conn.execute(
            "SELECT health_category AS label, COUNT(*) AS count FROM prediction_records GROUP BY health_category ORDER BY count DESC"
        ).fetchall()
        by_recommendation = conn.execute(
            "SELECT ewaste_recommendation AS label, COUNT(*) AS count FROM prediction_records GROUP BY ewaste_recommendation ORDER BY count DESC"
        ).fetchall()
        recent = conn.execute(
            "SELECT * FROM prediction_records ORDER BY created_at DESC LIMIT 8"
        ).fetchall()
    return {
        "total_analyses": total,
        "total_predictions": total,
        "average_health_score": round(avg, 1) if avg is not None else None,
        "gadget_types": [dict(row) for row in by_type],
        "health_categories": [dict(row) for row in by_category],
        "recommendations": [dict(row) for row in by_recommendation],
        "recent": [_record(row) for row in recent],
    }


def analytics() -> dict[str, Any]:
    with connection() as conn:
        lifespan = conn.execute(
            "SELECT remaining_months AS value, COUNT(*) AS count FROM prediction_records GROUP BY remaining_months ORDER BY remaining_months"
        ).fetchall()
    result = summary()
    result["lifespan"] = [dict(row) for row in lifespan]
    return result
