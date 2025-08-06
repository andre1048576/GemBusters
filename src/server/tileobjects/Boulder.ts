import { TileObject } from "./TileObject";


export class Boulder extends TileObject {

    public obstructs(): boolean {
        return true;
    }
}