import { Direction } from "shared/path";
import { PathTile } from "./tile";

export class DoubleDecker extends PathTile {

    public path_direction(Gdirection: Direction): string {
        if ((this.Object.GetAttribute("Position") as Vector3).Y === 1) {
            return "Airborne"
        }
        return "Grounded"
    }
    
}