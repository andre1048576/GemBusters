import { Client, ClientAsyncRemote, createRemotes, remote, Server, ServerAsyncRemote } from "@rbxts/remo";
import {t} from "@rbxts/t"
import type { PathTile } from "../server/tiles/tile";
import { bool } from "@rbxts/react/src/prop-types";
import { Direction } from "./path";

export type MoveOptions = "Attack" | "Move" | "Boulder" | "Rest"

export const remotes = createRemotes(
    {
        avatar_selected : remote<Client,[currently_selected : boolean,avatar : AvatarClass | undefined]>(),
        avatar_option_selected : remote<Server,[action : "Attack",goal : Vector3] | [action : "Boulder",goal : Vector3] | [action : "Move",path : Direction[]] | [action: "Rest"]>(),
        pathfind : remote<Server,[ability : string]>().returns<PathTile[]>(),
        get_adjacencies : remote<Server,[]>().returns<[Vector3,[Part,Direction,Part[]][]][]>(),
        enter_match : remote<Client,[other_players : Player[]]>(),
        exit_match : remote<Client,[]>(),
        update_attribute : remote<Client,[player : Player,data : "Health" | "Gem" | "Energy",new_value : number]>(t.instanceIsA("Player")),
        update_timer : remote<Client,[remaining_turns : number]>(t.number),
    }
)