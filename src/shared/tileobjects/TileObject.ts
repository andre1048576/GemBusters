import { TagComponent } from "@rbxts/component";
import type { Avatar } from "server/components/avatar";


export class TileObject extends TagComponent<Model> {

    public steppedIn(Avatar : Avatar) {}

    public steppedOut(Avatar : Avatar) {}
}