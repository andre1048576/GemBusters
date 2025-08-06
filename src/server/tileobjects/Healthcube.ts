import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";
import { TileObject } from "./TileObject";


export class HealthCube extends TileObject {

    private cube! : Part

    Start(): void {
        this.cube = this.Object.FindFirstChild("HealthCube") as Part;
    }

    public steppedIn(Avatar : Avatar) {
        Avatar.modify_health(1)
        this.cube.Transparency = 1;
    }

    public steppedOut(Avatar : Avatar) {
        task.delay(.4,() => {
        this.cube.Transparency = 0.5;
        })
    }
}