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


def test_report_accepts_coordinates_in_other_supported_cities() -> None:
    # The app supports 20+ cities beyond the original Cartagena pilot; per-city
    # bounds are enforced client-side, so the API only needs to reject garbage
    # coordinates, not coordinates outside Cartagena specifically.
    report = ReportCreate(
        title="Reporte en Bogota",
        description="Descripcion valida para el reporte local.",
        incident_category="Hurto",
        occurred_at=datetime.now(timezone.utc),
        lat=Decimal("4.7110"),
        lng=Decimal("-74.0721"),
        city="Bogota",
    )

    assert report.city == "Bogota"


def test_report_rejects_coordinates_outside_world_bounds() -> None:
    with pytest.raises(ValidationError):
        ReportCreate(
            title="Reporte con coordenadas invalidas",
            description="Descripcion valida para el reporte local.",
            incident_category="Hurto",
            occurred_at=datetime.now(timezone.utc),
            lat=Decimal("95.0000"),
            lng=Decimal("-75.4800"),
            city="Cartagena",
        )
