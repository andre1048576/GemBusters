import { Direction } from "shared/path";
import { PathTile } from "./tile";
import type { Avatar } from "server/components/avatar";


export class Slope extends PathTile {


    public path_direction(Gdirection: Direction): string {
        const lDirection = this.global_to_relative_direction(Gdirection);
        if (lDirection === Direction.Up) {
            return "Airborne";
        } else if (lDirection === Direction.Down) {
            return "Grounded";
        } else {
            return "HorizontalSlope" + this.Object.GetAttribute("Direction");
        }
    }
    
}