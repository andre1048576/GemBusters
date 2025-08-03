import { Boulder } from "shared/tileobjects/Boulder";
import { HealthCube } from "shared/tileobjects/Healthcube";
import { Spike } from "shared/tileobjects/Spike";

export class TileObjectConstructor {
	public static pathnode_to_class(p: Part) {
		switch (p.Name) {
			case "HealthCube":
				return HealthCube;
			case "Spike":
				return Spike;
			case "Boulder":
				return Boulder;
		}
		error("huh");
	}
}
