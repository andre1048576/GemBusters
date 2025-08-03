import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";
import { TileObject } from "./TileObject";


export class Boulder extends TileObject {

    public obstructs(): boolean {
        return true;
    }
}