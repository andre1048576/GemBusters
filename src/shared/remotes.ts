import { Client, ClientAsyncRemote, createRemotes, remote, Server, ServerAsyncRemote } from "@rbxts/remo";
import {t} from "@rbxts/t"

export const remotes = createRemotes(
    {
        get_tiles : remote<Server,[]>().returns<[Part]>(),
        avatar_selected : remote<Client,[avatar : AvatarClass | undefined]>(),
        avatar_option_selected : remote<Server,[goal : Vector3]>(t.Vector3)
    }
)