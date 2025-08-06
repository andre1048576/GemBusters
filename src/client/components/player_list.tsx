import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { Binding, useBinding } from "@rbxts/react";
import { Players } from "@rbxts/services";
import { remotes } from "shared/remotes";

interface PlayerListProps {
	players: Player[];
}

interface PictureCounterProps {
	player_num: number;
	icon: string;
	value: Binding<number>;
}

function PictureCounter({ player_num, icon, value }: PictureCounterProps) {
	const textValue = value.map((value) => `${value}`);
	return (
		<frame Size={UDim2.fromScale(0, 1)} AutomaticSize={"X"} BackgroundTransparency={1}>
			<uilistlayout FillDirection={"Horizontal"}></uilistlayout>
			<imagelabel
				BackgroundTransparency={1}
				Image={icon}
				Size={UDim2.fromScale(.9, .9)}
				AnchorPoint={new Vector2(1, 0.5)}
				Position={UDim2.fromScale(1, 0.5)}
			>
				<uiaspectratioconstraint AspectType={"FitWithinMaxSize"}></uiaspectratioconstraint>
			</imagelabel>
			<textlabel
				Text={textValue}
				Size={UDim2.fromScale(0, 1)}
				TextScaled={true}
				AutomaticSize={"X"}
				BackgroundTransparency={1}
			></textlabel>
		</frame>
	);
}

const image_colors = [new Color3(0.49,0.42,0.89),new Color3(0.85,0.41,0.41),new Color3(0.46,0.84,0.41),new Color3(0.85,0.85,0.4)]

export function PlayerList({ players }: PlayerListProps) {
	const playerListing = players.map((player, i) => {
		const [gems, setGems] = useBinding(0);
		const [health, setHealth] = useBinding(7);
		const [energy, setEnergy] = useBinding(5);

		useEventListener(remotes.update_attribute, (p, data, new_value) => {
			if (p !== player) {
				return;
			}
			switch (data) {
				case "Health":
					setHealth(new_value);
					break;
				case "Gem":
					setGems(new_value);
					break;
				case "Energy":
					setEnergy(new_value);
					break;
			}
		});

		const [headshot, _] = Players.GetUserThumbnailAsync(
			player.UserId,
			Enum.ThumbnailType.HeadShot,
			Enum.ThumbnailSize.Size180x180,
		);
		return (
			<frame
				Size={UDim2.fromScale(0, 0.2)}
				AnchorPoint={new Vector2(1, 0)}
				Position={UDim2.fromScale(1, i / 4)}
				BackgroundTransparency={1}
				AutomaticSize={"X"}
			>
				<imagelabel
                    ImageColor3={image_colors[i]}
					Image={"rbxassetid://94742358659359"}
                    BackgroundTransparency={1}
					AnchorPoint={new Vector2(1, 0)}
					Position={UDim2.fromScale(1.1, 0)}
					Size={UDim2.fromScale(1.35, 1)}
				></imagelabel>
				<frame Size={UDim2.fromScale(0, 1)} BackgroundTransparency={1} AutomaticSize={"X"}>
					<uilistlayout
						FillDirection={"Horizontal"}
						HorizontalAlignment={"Right"}
						Padding={new UDim(0.05, 0)}
					></uilistlayout>

					<PictureCounter player_num={i} icon="rbxassetid://129910638291009" value={gems} />
					<PictureCounter player_num={i} icon="rbxassetid://96636423443336" value={health} />
					<PictureCounter player_num={i} icon="rbxassetid://79796419979724" value={energy} />
					<imagelabel
						BackgroundTransparency={1}
						Image={headshot}
						Size={UDim2.fromScale(1, 1)}
						LayoutOrder={-1}
					>
						<uiaspectratioconstraint AspectType={"FitWithinMaxSize"}></uiaspectratioconstraint>
					</imagelabel>
				</frame>
			</frame>
		);
	});
	return (
		<frame
			BackgroundTransparency={1}
			AnchorPoint={new Vector2(1, 0)}
			Position={UDim2.fromScale(0.95, 0)}
			Size={UDim2.fromScale(0.2, 0.3)}
		>
			{playerListing}
		</frame>
	);
}
