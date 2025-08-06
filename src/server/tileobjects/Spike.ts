import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";
import { TileObject } from "./TileObject";


export class Spike extends TileObject {

    public steppedIn(Avatar : Avatar) {
        Avatar.modify_health(-1)
    }
}