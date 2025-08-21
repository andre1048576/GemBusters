import { lerp, useEventListener, useMotion } from "@rbxts/pretty-react-hooks";
import React, { Binding, useBinding, useState } from "@rbxts/react";
import { remotes } from "shared/remotes";
import { Trove } from "@rbxts/trove";
import { config } from "@rbxts/ripple";
import { Direction, opposite_direction } from "shared/path";
import { Workspace } from "@rbxts/services";

enum Page {
	Primary,
	Back,
}

const trove = new Trove();

interface MainPageOptionProps {
	onClick: () => any;
	name: string;
	description: string;
	xCoordinate: number;
	energy_cost: number;
}

interface MainPageProps {
	onMoveClick: () => any;
	onBoulderClick: () => any;
	onAttackClick: () => any;
	onRestClick: () => any;
}

function MainPage({ onMoveClick, onAttackClick, onBoulderClick, onRestClick }: MainPageProps) {
	return (
		<scrollingframe Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1} ScrollingDirection={"X"} ClipsDescendants={false} CanvasSize={UDim2.fromScale(2,1)}>
			<MainPageOption
				onClick={onMoveClick}
				name="Move"
				xCoordinate={0}
				description="Move Equal to your remaining ⚡"
				energy_cost={0}
			/>
			<MainPageOption
				onClick={onAttackClick}
				name="Attack"
				xCoordinate={1}
				description="Smash rocks!"
				energy_cost={1}
			/>
			<MainPageOption
				onClick={onBoulderClick}
				name="Boulder"
				xCoordinate={2}
				description="Deploy a Rock to impede enemies."
				energy_cost={2}
			/>
			<MainPageOption
				onClick={onRestClick}
				name="Rest"
				xCoordinate={3}
				description="Replenish your ⚡, but you take +1 damage from all sources until your next turn."
				energy_cost={0}
			/>
		</scrollingframe>
	);
}

function MainPageOption({ onClick, name, xCoordinate, description, energy_cost }: MainPageOptionProps) {
	const [yPos, yPosMotor] = useMotion(0);
	const lightnings = new Array(energy_cost, "").map((_, i) => (
		<imagelabel
			BackgroundTransparency={1}
			Image={"rbxassetid://79796419979724"}
			Size={UDim2.fromScale(0.15, 0.15)}
			AnchorPoint={new Vector2(0, 1)}
			Position={yPos.map((t) => UDim2.fromScale(i / 8, lerp(-0.1, -0.1 / 3, t)))}
		>
			<uiaspectratioconstraint AspectType={"ScaleWithParentSize"}></uiaspectratioconstraint>
		</imagelabel>
	));

	return (
		<imagebutton
			BackgroundColor3={new Color3(1, 1, 1)}
			AnchorPoint={new Vector2(0.5, 0)}
			Size={yPos.map((t) => UDim2.fromScale(0.2, lerp(1, 3, t)))}
			Position={yPos.map((t) => UDim2.fromScale(0.25-.125 + xCoordinate * 0.25, lerp(0, -2, t)))}
			Event={{
				Activated: onClick,
				MouseEnter: () => yPosMotor.spring(1, config.spring.gentle),
				MouseLeave: () => yPosMotor.spring(0, config.spring.gentle),
			}}
		>
			{lightnings}
			<textlabel
				BackgroundTransparency={1}
				Text={name}
				Size={yPos.map((t) => UDim2.fromScale(1, lerp(1, 1 / 3, t)))}
				TextScaled={true}
			></textlabel>
			<textlabel
				BackgroundTransparency={1}
				Text={description}
				AnchorPoint={new Vector2(0.5, 0)}
				Size={yPos.map((t) => UDim2.fromScale(0.9, lerp(0, 2 / 3 - 0.1, t)))}
				Position={yPos.map((t) => UDim2.fromScale(0.5, lerp(1, 1 / 3, t)))}
				TextScaled={true}
				TextWrapped={true}
			></textlabel>
			<uicorner CornerRadius={new UDim(0.1, 0)} />
			<uistroke ApplyStrokeMode={"Border"} Color={Color3.fromRGB(132, 95, 53)} Thickness={15} />
		</imagebutton>
	);
}

interface BackPageProps {
	onClick: () => any;
	onConfirmClick: () => any;
	canConfirm: Binding<boolean>;
}

function BackPage({ onClick, canConfirm, onConfirmClick }: BackPageProps) {
	const confirm_color = canConfirm.map((v) => (v ? Color3.fromRGB(13, 232, 41) : Color3.fromRGB(237, 13, 13)));
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<textbutton
				BackgroundColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				Size={UDim2.fromScale(0.5, 1)}
				Text={"BACK"}
				Event={{
					Activated: onClick,
				}}
			></textbutton>
			<textbutton
				BackgroundColor3={confirm_color}
				TextScaled={true}
				Position={UDim2.fromScale(0.5, 0)}
				Size={UDim2.fromScale(0.5, 1)}
				Text={"CONFIRM"}
				Active={canConfirm}
				Event={{
					Activated: onConfirmClick,
				}}
			></textbutton>
		</frame>
	);
}

const path: Direction[] = [];

export function AvatarUI() {
	const [visible, _setVisible] = useState(false);
	const [visiblePage, _setVisiblePage] = useState(Page.Primary);
	const [avatar, setAvatar] = useState<AvatarClass | undefined>(undefined);
	const [canConfirm, setCanConfirm] = useBinding(false);

	function setVisible(is_visible: boolean) {
		_setVisible(is_visible);
		if (!is_visible) {
			setVisiblePage(Page.Primary);
		}
	}

	function setVisiblePage(new_page: Page) {
		if (new_page === Page.Primary) {
			setCanConfirm(false);
			task.defer(() => {
				trove.clean();
			});
		}
		_setVisiblePage(new_page);
	}

	function onAvatarPassed(currently_selected: boolean, avatar: AvatarClass | undefined) {
		setVisible(currently_selected);
		setAvatar(avatar);
	}
	useEventListener(remotes.avatar_selected, onAvatarPassed);

	function onMoveClick() {
		trove.add(
			task.spawn(() => {
				setVisiblePage(Page.Back);
				const [success, paths] = remotes.get_adjacencies().await();
				if (!success) {
					error("failed to laod paths!?");
				}
				let avatar_pos = avatar?.GetAttribute("Position") as Vector3;
				const adj_parts = paths.find(([v]) => v === avatar_pos)![1];
				if (adj_parts.size() === 0) {
					return;
				}
				const [adj_part, dir] = adj_parts[0];
				let temporary_tile: Part = paths
					.find(([v]) => v === adj_part.GetAttribute("Position"))![1]
					.find(([, d]) => d === opposite_direction(dir))![0];
				let temporary_worldspace = temporary_tile.Position;
				const bindable = new Instance("BindableEvent");
				trove.add(bindable);
				const tiles: Part[] = [];
				const visible_path: Part[] = [];
				path.clear();
				function onHoveredPartClicked(tile: Part, direction: Direction, steps: Part[]) {
					if (path[path.size() - 1] === opposite_direction(direction)) {
						path.pop();
						temporary_tile = tiles.pop()!;
						const pathSizeToRemove = visible_path[visible_path.size()-1].GetAttribute("PathSize")
						while (!visible_path.isEmpty() && visible_path[visible_path.size()-1].GetAttribute("PathSize") === pathSizeToRemove)
							visible_path.pop()?.Destroy();
						temporary_worldspace = temporary_tile.Position;
						if (path.size() === 0) {
							setCanConfirm(false);
						}
					} else {
						setCanConfirm(true);
						steps.forEach((part) => {
							const worldSpace = part.Position;
							if (worldSpace !== temporary_worldspace) {
								const new_part = new Instance("Part");
								const midpoint = worldSpace.add(temporary_worldspace).div(2);
								const thickness = 0.5;
								new_part.CanCollide = false;
								new_part.CanQuery = false;
								new_part.CanTouch = false;
								new_part.Anchored = true;
								new_part.Material = Enum.Material.SmoothPlastic;
								new_part.Size = new Vector3(
									thickness,
									thickness,
									worldSpace.sub(temporary_worldspace).Magnitude,
								);
								trove.add(new_part);
								new_part.CFrame = CFrame.lookAt(midpoint, worldSpace, Vector3.yAxis);
								temporary_worldspace = worldSpace;
								new_part.Parent = Workspace;
								new_part.SetAttribute("PathSize",path.size());
								visible_path.push(new_part);
						}
						});

						tiles.push(temporary_tile);
						temporary_tile = tile;
						path.push(direction);
					}
					bindable.Fire();
				}
				const part_trove = trove.extend();
				const max_steps = avatar!.GetAttribute("Energy") as number;
				trove.add(
					task.spawn(() => {
						while (true) {
							const tiles = paths.find(([v]) => v === temporary_tile.GetAttribute("Position"))![1];
							for (const [tile, direction, steps] of tiles) {
								if (
									path.size() === max_steps &&
									path[path.size() - 1] !== opposite_direction(direction)
								) {
									continue;
								}
								const part = new Instance("Part");
								part_trove.add(part);
								const clickDetector = new Instance("ClickDetector");
								clickDetector.MaxActivationDistance = 1e5;
								part.PivotTo(tile.CFrame.mul(new CFrame(0, -tile.Size.Y / 2, 0)));
								part.Parent = tile;
								part.Anchored = true;
								part.CanCollide = false;
								part.CanQuery = true;
								part.CanTouch = false;
								part.Material = Enum.Material.SmoothPlastic;
								if (path[path.size() - 1] === opposite_direction(direction)) {
									part.Color = Color3.fromRGB(200, 200, 200);
								} else {
									part.Color = Color3.fromRGB(138, 18, 194);
								}
								part.SetAttribute("OldColor", part.Color);
								part.Size = new Vector3(8, 0.005, 8).mul(tile.GetAttribute("HighlightSize") as Vector3);
								part.Transparency = 0.5;
								clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
								clickDetector.MouseHoverLeave.Connect(
									() => (part.Color = part.GetAttribute("OldColor") as Color3),
								);
								clickDetector.Parent = part;
								clickDetector.MouseClick.Connect(() => onHoveredPartClicked(tile, direction, steps));
							}
							bindable.Event.Wait();
							part_trove.clean();
						}
					}),
				);
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
				remotes.avatar_option_selected.fire("Attack", position);
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
				remotes.avatar_option_selected.fire("Boulder", position);
			}),
		);
	}

	function onRestClick() {
				setVisible(false);
		remotes.avatar_option_selected.fire("Rest");
	}

	function onBackPageClick() {
		setVisiblePage(Page.Primary);
	}

	function onConfirmClick() {
		setVisible(false);
		remotes.avatar_option_selected("Move", path);
	}

	if (!visible) {
		return <></>;
	}

	function pageRender(page: Page) {
		switch (page) {
			case Page.Primary:
				return (
					<MainPage onMoveClick={onMoveClick} onAttackClick={onAttackClick} onBoulderClick={onBoulderClick} onRestClick={onRestClick} />
				);
			case Page.Back:
				return <BackPage onClick={onBackPageClick} canConfirm={canConfirm} onConfirmClick={onConfirmClick} />;
		}
	}

	return (
		<frame
			Position={UDim2.fromScale(0.5, 0.9)}
			AnchorPoint={new Vector2(0.5, 1)}
			Size={UDim2.fromScale(0.7, 0.1)}
			BackgroundTransparency={1}
		>
			{pageRender(visiblePage)}
		</frame>
	);
}
