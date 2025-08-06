import { Direction } from "shared/path";
import { PathTile } from "./tile";

export class Solid extends PathTile {


    public path_direction(Gdirection: Direction): string {
        return "Airborne"
    }
    
}