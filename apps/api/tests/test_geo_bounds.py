from datetime import datetime, timezone
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.report import ReportCreate


def test_report_accepts_cartagena_coordinates() -> None:
    report = ReportCreate(
        title="Reporte dentro de Cartagena",
        description="Descripcion valida para el reporte local.",
        incident_category="Hurto",
        occurred_at=datetime.now(timezone.utc),
        lat=Decimal("10.4236"),
        lng=Decimal("-75.5478"),
        city="Cartagena",
    )

    assert report.city == "Cartagena"


def test_report_rejects_coordinates_outside_cartagena() -> None:
    with pytest.raises(ValidationError):
        ReportCreate(
            title="Reporte fuera",
            description="Descripcion valida para el reporte local.",
            incident_category="Hurto",
            occurred_at=datetime.now(timezone.utc),
            lat=Decimal("4.7110"),
            lng=Decimal("-74.0721"),
            city="Bogota",
        )


def test_report_rejects_coordinates_outside_cartagena_urban_pilot() -> None:
    with pytest.raises(ValidationError):
        ReportCreate(
            title="Reporte fuera del piloto urbano",
            description="Descripcion valida para el reporte local.",
            incident_category="Hurto",
            occurred_at=datetime.now(timezone.utc),
            lat=Decimal("10.5300"),
            lng=Decimal("-75.4800"),
            city="Cartagena",
        )
