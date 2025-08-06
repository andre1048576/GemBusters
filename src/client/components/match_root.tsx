import React, { useState } from "@rbxts/react";
import { AvatarUI } from "./avatar_options";
import { useEventListener } from "@rbxts/pretty-react-hooks";
import { remote } from "@rbxts/remo";
import { remotes } from "shared/remotes";
import { PlayerList } from "./player_list";
import { TurnTimer } from "./turn_timer";

export function MatchRoot() {
	const [InMatch, setInMatch] = useState(false);
	const [players, setPlayers] = useState<Player[]>([]);

	useEventListener(remotes.enter_match, (p) => {
		setInMatch(true);
		setPlayers(p);
	});
	useEventListener(remotes.exit_match, () => {
		setInMatch(false);
		setPlayers([]);
	});



	if (!InMatch) {
		return;
	}

	return (
		<screengui>
			<PlayerList players={players}></PlayerList>
            <TurnTimer></TurnTimer>
			<AvatarUI></AvatarUI>
		</screengui>
	);
}
