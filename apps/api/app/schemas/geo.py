from decimal import Decimal

from pydantic import BaseModel, model_validator

WORLD_SOUTH = Decimal("-90")
WORLD_NORTH = Decimal("90")
WORLD_WEST = Decimal("-180")
WORLD_EAST = Decimal("180")


class CartagenaBoundsMixin(BaseModel):
    """Validates coordinates fall within a real-world lat/lng range.

    Per-city bounds (Cartagena, Bogota, Madrid, etc.) are enforced client-side
    against each city's configured bounding box, since the app supports 20+
    cities. This mixin only guards against garbage/out-of-range coordinates.
    """

    lat: Decimal
    lng: Decimal

    @model_validator(mode="after")
    def validate_world_bounds(self) -> "CartagenaBoundsMixin":
        if not (WORLD_SOUTH <= self.lat <= WORLD_NORTH):
            raise ValueError("La latitud debe estar entre -90 y 90 grados.")
        if not (WORLD_WEST <= self.lng <= WORLD_EAST):
            raise ValueError("La longitud debe estar entre -180 y 180 grados.")
        return self
