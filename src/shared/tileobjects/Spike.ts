import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";
import { TileObject } from "./TileObject";


export class Spike extends TileObject {

    public steppedIn(Avatar : Avatar) {
        const humanoid = Avatar.Object.FindFirstChildOfClass("Humanoid")!
        humanoid.Health = math.clamp(humanoid.Health-10,10,100);
    }
}