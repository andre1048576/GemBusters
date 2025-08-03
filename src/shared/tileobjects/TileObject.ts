import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";


export class TileObject extends TagComponent<Model> {

    public Initialize(): void {
        this.Trove.attachToInstance(this.Object);
    }

    public steppedIn(Avatar : Avatar) {}

    public steppedOut(Avatar : Avatar) {}

    public obstructs() : boolean {
        return false;
    }
}