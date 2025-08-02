import { useEventListener, useMotion } from "@rbxts/pretty-react-hooks";
import React, { useState } from "@rbxts/react";
import { remotes } from "shared/remotes";
import { Trove } from "@rbxts/trove";
import { PathTile } from "shared/tiles/tile";

enum Page {
	Primary,
	Back,
}

const trove = new Trove();

interface MainPageProps {
	onClick: () => any;
}

function MainPage({ onClick }: MainPageProps) {
	return (
		<textbutton
			BackgroundColor3={new Color3(1, 1, 1)}
			TextScaled={true}
			Size={UDim2.fromScale(.2, 1)}
			Text={"move"}
			Event={{
				Activated: onClick,
			}}
		></textbutton>
	);
}

interface BackPageProps {
	onClick: () => any;
}

function BackPage({ onClick }: BackPageProps) {
	return (
		<textbutton
			BackgroundColor3={new Color3(1, 1, 1)}
			TextScaled={true}
			Size={UDim2.fromScale(1, 1)}
			Text={"BACK"}
			Event={{
				Activated: onClick,
			}}
		></textbutton>
	);
}

export function AvatarUI() {
	const [avatar, setAvatar] = useState<AvatarClass | undefined>(undefined);
	const [visible, setVisible] = useState(false);
	const [visiblePage, setVisiblePage] = useState(Page.Primary);
	function onAvatarPassed(PAvatar: AvatarClass | undefined) {
		setAvatar(PAvatar);
		setVisible(PAvatar !== undefined);
		setVisiblePage(Page.Primary);
	}

	function onMainPageClick() {
		trove.add(
			task.spawn(() => {
				setVisiblePage(Page.Back);
				const tiles: [PathTile] = avatar?.GetTiles.InvokeServer();

				const bindable = new Instance("BindableEvent");

				function onHoveredPartClicked(part: Part) {
					const position = part.Parent?.GetAttribute("Position") as Vector3;
					bindable.Fire(position);
				}
				const part_trove = trove.extend();
				for (const tile of tiles) {
					const part = new Instance("Part");
					part_trove.add(part);
					const clickDetector = new Instance("ClickDetector");
					clickDetector.MaxActivationDistance = 1e5;
					part.PivotTo((tile.Object.CFrame.mul(new CFrame(0, -tile.Object.Size.Y/2, 0))));
					part.Parent = tile.Object;
					part.Anchored = true;
					part.CanCollide = false;
					part.CanQuery = true;
					part.CanTouch = false;
					part.Material = Enum.Material.SmoothPlastic;
					part.Color = Color3.fromRGB(138,18,194);
					part.Size = new Vector3(8, 0, 8).mul(tile.Object.GetAttribute("HighlightSize") as Vector3);
					part.Transparency = 0.5;
					clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
					clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(138,18,194)));
					clickDetector.Parent = part;
					clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
				}
				const [position] = bindable.Event.Wait();
				part_trove.destroy();
				setVisible(false);
				remotes.avatar_option_selected.fire(position);
			}),
		);
	}

	function onBackPageClick() {
		trove.clean();
		setVisiblePage(Page.Primary);
	}

	useEventListener(remotes.avatar_selected, onAvatarPassed);
	if (!visible) {
		return <></>;
	}

	function pageRender(page: Page) {
		switch (page) {
			case Page.Primary:
				return <MainPage onClick={onMainPageClick} />;
			case Page.Back:
				return <BackPage onClick={onBackPageClick} />;
		}
	}

	return (
		/*<billboardgui
			Adornee={avatar!.PrimaryPart}
			Size={UDim2.fromScale(8, 8)}
			AlwaysOnTop={true}
			StudsOffset={Vector3.xAxis.mul(5)}
			Active={true}
			ResetOnSpawn={false}
		>
			{pageRender(visiblePage)}
		</billboardgui>*/
		<screengui>
			<frame
			Position={UDim2.fromScale(.5,.9)}
			AnchorPoint={new Vector2(.5,1)}
			Size={UDim2.fromScale(.7,.2)}>
				{pageRender(visiblePage)}
			</frame>
		</screengui>
	);
}
