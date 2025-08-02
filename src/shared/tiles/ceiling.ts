import { Direction } from "shared/path";
import { PathTile } from "./tile";

export class Ceiling extends PathTile {


    public path_direction(Gdirection: Direction): string {
        return "Grounded"
    }
    
}