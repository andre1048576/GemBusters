import { Direction } from "shared/path";
import { PathTile } from "./tile";

export class Flat extends PathTile {


    public path_direction(Gdirection: Direction): string {
        return "Grounded"
    }
    
}