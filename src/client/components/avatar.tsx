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

interface MainPageOptionProps {
	onClick: () => any;
	name: string;
}

interface MainPageProps {
	onMoveClick: () => any;
	onBoulderClick: () => any;
	onAttackClick: () => any;
}

function MainPage({ onMoveClick, onAttackClick, onBoulderClick }: MainPageProps) {
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<uilistlayout HorizontalFlex={"SpaceEvenly"} FillDirection={"Horizontal"} />
			<MainPageOption onClick={onMoveClick} name="Move" />
			<MainPageOption onClick={onAttackClick} name="Attack" />
			<MainPageOption onClick={onBoulderClick} name="Boulder" />
		</frame>
	);
}

function MainPageOption({ onClick, name }: MainPageOptionProps) {
	return (
		<textbutton
			BackgroundColor3={new Color3(1, 1, 1)}
			TextScaled={true}
			Size={UDim2.fromScale(0.2, 1)}
			Text={name}
			Event={{
				Activated: onClick,
			}}
		/>
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
	const [visible, setVisible] = useState(false);
	const [visiblePage, setVisiblePage] = useState(Page.Primary);
	function onAvatarPassed(currently_selected: boolean) {
		setVisible(currently_selected);
		setVisiblePage(Page.Primary);
	}
	useEventListener(remotes.avatar_selected, onAvatarPassed);

	function onMoveClick() {
		trove.add(
			task.spawn(() => {
				setVisiblePage(Page.Back);
				const [success, tiles] = remotes.pathfind("Move").await();
				if (!success) {
					error("huh");
				}
				const bindable = new Instance("BindableEvent");
				trove.add(bindable);
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
					part.PivotTo(tile.Object.CFrame.mul(new CFrame(0, -tile.Object.Size.Y / 2, 0)));
					part.Parent = tile.Object;
					part.Anchored = true;
					part.CanCollide = false;
					part.CanQuery = true;
					part.CanTouch = false;
					part.Material = Enum.Material.SmoothPlastic;
					part.Color = Color3.fromRGB(138, 18, 194);
					part.Size = new Vector3(8, 0.005, 8).mul(tile.Object.GetAttribute("HighlightSize") as Vector3);
					part.Transparency = 0.5;
					clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
					clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(138, 18, 194)));
					clickDetector.Parent = part;
					clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
				}
				const [position] = bindable.Event.Wait();
				part_trove.destroy();
				setVisible(false);
				remotes.avatar_option_selected.fire(position, "Move");
			}),
		);
	}

	function onAttackClick() {
		trove.add(
			task.spawn(() => {
				setVisiblePage(Page.Back);
				const [success, tiles] = remotes.pathfind("Attack").await();
				if (!success) {
					error("huh");
				}
				const bindable = new Instance("BindableEvent");
				trove.add(bindable);
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
					part.PivotTo(tile.Object.CFrame.mul(new CFrame(0, -tile.Object.Size.Y / 2, 0)));
					part.Parent = tile.Object;
					part.Anchored = true;
					part.CanCollide = false;
					part.CanQuery = true;
					part.CanTouch = false;
					part.Material = Enum.Material.SmoothPlastic;
					part.Color = Color3.fromRGB(194, 18, 18);
					part.Size = new Vector3(8, 0.005, 8).mul(tile.Object.GetAttribute("HighlightSize") as Vector3);
					part.Transparency = 0.5;
					clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
					clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(194, 18, 18)));
					clickDetector.Parent = part;
					clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
				}
				const [position] = bindable.Event.Wait();
				part_trove.destroy();
				setVisible(false);
				remotes.avatar_option_selected.fire(position, "Attack");
			}),
		);
	}

	function onBoulderClick() {
		trove.add(
			task.spawn(() => {
				setVisiblePage(Page.Back);
				const [success, tiles] = remotes.pathfind("Boulder").await();
				if (!success) {
					error("huh");
				}
				const bindable = new Instance("BindableEvent");
				trove.add(bindable);
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
					part.PivotTo(tile.Object.CFrame.mul(new CFrame(0, -tile.Object.Size.Y / 2, 0)));
					part.Parent = tile.Object;
					part.Anchored = true;
					part.CanCollide = false;
					part.CanQuery = true;
					part.CanTouch = false;
					part.Material = Enum.Material.SmoothPlastic;
					part.Color = Color3.fromRGB(194, 18, 18);
					part.Size = new Vector3(8, 0.005, 8).mul(tile.Object.GetAttribute("HighlightSize") as Vector3);
					part.Transparency = 0.5;
					clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
					clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(194, 18, 18)));
					clickDetector.Parent = part;
					clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
				}
				const [position] = bindable.Event.Wait();
				part_trove.destroy();
				setVisible(false);
				remotes.avatar_option_selected.fire(position, "Boulder");
			}),
		);
	}

	function onBackPageClick() {
		trove.clean();
		setVisiblePage(Page.Primary);
	}

	if (!visible) {
		return <></>;
	}

	function pageRender(page: Page) {
		switch (page) {
			case Page.Primary:
				return (
					<MainPage onMoveClick={onMoveClick} onAttackClick={onAttackClick} onBoulderClick={onBoulderClick} />
				);
			case Page.Back:
				return <BackPage onClick={onBackPageClick} />;
		}
	}

	return (
		<screengui>
			<frame
				Position={UDim2.fromScale(0.5, 0.9)}
				AnchorPoint={new Vector2(0.5, 1)}
				Size={UDim2.fromScale(0.7, 0.2)}
			>
				{pageRender(visiblePage)}
			</frame>
		</screengui>
	);
}
