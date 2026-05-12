from decimal import Decimal

from pydantic import BaseModel, model_validator

CARTAGENA_SOUTH = Decimal("10.34")
CARTAGENA_NORTH = Decimal("10.45")
CARTAGENA_WEST = Decimal("-75.59")
CARTAGENA_EAST = Decimal("-75.47")


class CartagenaBoundsMixin(BaseModel):
    lat: Decimal
    lng: Decimal

    @model_validator(mode="after")
    def validate_cartagena_bounds(self) -> "CartagenaBoundsMixin":
        if not (CARTAGENA_SOUTH <= self.lat <= CARTAGENA_NORTH):
            raise ValueError("La latitud debe estar dentro del area piloto de Cartagena.")
        if not (CARTAGENA_WEST <= self.lng <= CARTAGENA_EAST):
            raise ValueError("La longitud debe estar dentro del area piloto de Cartagena.")
        return self
