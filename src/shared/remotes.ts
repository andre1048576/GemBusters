import { Client, ClientAsyncRemote, createRemotes, remote, Server, ServerAsyncRemote } from "@rbxts/remo";
import {t} from "@rbxts/t"
import { PathTile } from "./tiles/tile";

export const remotes = createRemotes(
    {
        avatar_selected : remote<Client,[currently_selected : boolean]>(),
        avatar_option_selected : remote<Server,[goal : Vector3,action : string]>(t.Vector3),
        pathfind : remote<Server,[ability : string]>().returns<PathTile[]>()
    }
)