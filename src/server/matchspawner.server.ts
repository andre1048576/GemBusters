import { Component, Components, TagComponent } from "@rbxts/component";
import { Workspace } from "@rbxts/services";
import { Match } from "./components/match";


@Component({
    Tag:"MatchSpawner"
})
export class MatchSpawner extends TagComponent<MatchSpawnerI> {
    public players : Player[] = []
    Start(): void {
        this.Trove.add(this.Object.ClickDetector.MouseClick.Connect(player => {
            if (!this.players.includes(player)) {
                this.players.push(player)
                if (this.players.size() === this.Object.GetAttribute("player_count")) {
                    const [success,matchObj] = Components.Instantiate(Match,Workspace.MatchOrigin,"Match").await();
                    if (!success) {
                        error("did not load match properly")
                    }
                    matchObj.players = this.players;
                }
            }
        }))
    }
}