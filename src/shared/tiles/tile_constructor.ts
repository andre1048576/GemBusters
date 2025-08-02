import { Ceiling } from "./ceiling";
import { DoubleDecker } from "./double_decker";
import { Elevator } from "./elevator";
import { Flat } from "./flat";
import { Ladder } from "./ladder";
import { Slope } from "./slope";
import { Solid } from "./solid";

export class TileConstructor {
	public static pathnode_to_class(p: Part) {
		switch (p.Parent?.Name) {
			case "Slope":
				return Slope;
			case "DoubleDecker":
				return DoubleDecker;
			case "Ceiling":
				return Ceiling;
			case "Flat":
				return Flat;
			case "Solid":
				return Solid;
			case "Ladder":
				return Ladder;
			case "Elevator":
				return Elevator;
			default:
				break;
		}
		error("huh");
	}
}
