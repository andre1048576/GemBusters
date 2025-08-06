import { Direction } from "shared/path";
import { PathTile } from "./tile";


export class Ladder extends PathTile {


    public path_direction(Gdirection: Direction): string {
        const lDirection = this.global_to_relative_direction(Gdirection);
        if (lDirection === Direction.Up) {
            return "Airborne";
        } else {
            return "Grounded";
        }
    }
    
}