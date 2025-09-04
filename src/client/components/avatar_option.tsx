import { useMotion, lerp } from "@rbxts/pretty-react-hooks";
import React from "@rbxts/react";
import { config } from "@rbxts/ripple";
import { Trove } from "@rbxts/trove";
import { Workspace } from "@rbxts/services";
import { opposite_direction, Direction } from "shared/path";
import { MoveOptions, remotes } from "shared/remotes";

interface MainPageOptionProps {
	onClick: () => any;
	name: string;
	description: string;
	xCoordinate: number;
	energy_cost: number;
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
			Position={yPos.map((t) => UDim2.fromScale(0.25 / 2 + xCoordinate * 0.25, lerp(0, -2, t)))}
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

function onMoveClick(trove: Trove, avatar: AvatarClass, set_choice: (selection: any, canConfirm: boolean) => void) {
	trove.add(
		task.spawn(() => {
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
			const path: Direction[] = [];
			function onHoveredPartClicked(tile: Part, direction: Direction, steps: Part[]) {
				if (path[path.size() - 1] === opposite_direction(direction)) {
					path.pop();
					temporary_tile = tiles.pop()!;
					const pathSizeToRemove = visible_path[visible_path.size() - 1].GetAttribute("PathSize");
					while (
						!visible_path.isEmpty() &&
						visible_path[visible_path.size() - 1].GetAttribute("PathSize") === pathSizeToRemove
					)
						visible_path.pop()?.Destroy();
					temporary_worldspace = temporary_tile.Position;
					if (path.size() === 0) {
						set_choice(undefined, false);
					}
				} else {
					steps.forEach((part) => {
						const worldSpace = part.Position;
						if (worldSpace !== temporary_worldspace) {
							const new_part = new Instance("Part");
							const midpoint = worldSpace.add(temporary_worldspace).div(2);
							new_part.Color = new Color3(0,0,1)
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
							new_part.SetAttribute("PathSize", path.size());
							visible_path.push(new_part);
						}
					});

					tiles.push(temporary_tile);
					temporary_tile = tile;
					path.push(direction);
					set_choice(path, true);
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
							if (path.size() === max_steps && path[path.size() - 1] !== opposite_direction(direction)) {
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

function onAttackClick(trove: Trove, avatar: AvatarClass, set_choice: (selection: any, canConfirm: boolean) => void) {
	trove.add(
		task.spawn(() => {
			const [success, tiles] = remotes.pathfind("Attack").await();
			print(tiles);
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
			trove.add(
				task.spawn(() => {
					while (true) {
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
							part.Size = new Vector3(8, 0.005, 8).mul(
								tile.Object.GetAttribute("HighlightSize") as Vector3,
							);
							part.Transparency = 0.5;
							clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
							clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(194, 18, 18)));
							clickDetector.Parent = part;
							clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
						}
						const [position] = bindable.Event.Wait();
						part_trove.destroy();
						set_choice(position, true);
					}
				}),
			);
		}),
	);
}

function onBoulderClick(trove: Trove, avatar: AvatarClass,set_choice: (selection: any, canConfirm: boolean) => void) {
	trove.add(
		task.spawn(() => {
			const part_trove = trove.extend();
			const [success, tiles] = remotes.pathfind("Boulder").await();
			if (!success) {
				error("huh");
			}
			const bindable = new Instance("BindableEvent");
			part_trove.add(bindable);
			function onHoveredPartClicked(part: Part) {
				const position = part.Parent?.GetAttribute("Position") as Vector3;
				bindable.Fire(position);
			}
			trove.add(
				task.spawn(() => {
					while (true) {
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
							part.Size = new Vector3(8, 0.005, 8).mul(
								tile.Object.GetAttribute("HighlightSize") as Vector3,
							);
							part.Transparency = 0.5;
							clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
							clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(194, 18, 18)));
							clickDetector.Parent = part;
							clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
						}
						const [position] = bindable.Event.Wait();
						part_trove.destroy();
						set_choice(position, true);
					}
				}),
			);
		}),
	);
}

function onJumpClick(trove: Trove, avatar: AvatarClass, set_choice: (selection: any, canConfirm: boolean) => void) {
	trove.add(
		task.spawn(() => {
			const part_trove = trove.extend();
			const [success, tiles] = remotes.pathfind("Jump").await();
			if (!success) {
				error("huh");
			}
			const bindable = new Instance("BindableEvent");
			part_trove.add(bindable);
			function onHoveredPartClicked(part: Part) {
				const position = part.Parent?.GetAttribute("Position") as Vector3;
				bindable.Fire(position);
			}
			trove.add(
				task.spawn(() => {
					while (true) {
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
							part.Size = new Vector3(8, 0.005, 8).mul(
								tile.Object.GetAttribute("HighlightSize") as Vector3,
							);
							part.Transparency = 0.5;
							clickDetector.MouseHoverEnter.Connect(() => (part.BrickColor = BrickColor.Green()));
							clickDetector.MouseHoverLeave.Connect(() => (part.Color = Color3.fromRGB(194, 18, 18)));
							clickDetector.Parent = part;
							clickDetector.MouseClick.Connect(() => onHoveredPartClicked(part));
						}
						const [position] = bindable.Event.Wait();
						part_trove.destroy();
						set_choice(position, true);
					}
				}),
			);
		}),
	);
}

function onRestClick(trove: Trove, avatar: AvatarClass, set_choice: (selection: any, canConfirm: boolean) => void) {
	set_choice(undefined, true);
}

interface BaseOptionsProps {
	trove: Trove;
	avatar: AvatarClass;
	setChoice: (selection: any, canConfirm: boolean) => void;
	showBackPage: (move_type: MoveOptions) => void;
}

const base_options = [
	{
		name: "Move",
		onClick: onMoveClick,
		energyCost: 0,
		description: "Move Equal to your remaining ⚡",
	},
	{
		name: "Attack",
		onClick: onAttackClick,
		energyCost: 1,
		description: "Deal 2 damage to a nearby obstacle or player.",
	},
	{
		name: "Jump",
		onClick: onJumpClick,
		energyCost: 1,
		description: "Jumpety",
	},
	{
		name: "Rest",
		onClick: onRestClick,
		energyCost: 0,
		description: "Replenish your ⚡, but you take +1 damage from all sources until your next turn.",
	},
];

export function BaseOptions({ trove, avatar, setChoice, showBackPage }: BaseOptionsProps) {
	return (
		<frame Size={UDim2.fromScale(1, 2 / 3)} BackgroundTransparency={1}>
			{base_options.map((data,i) => (
				<MainPageOption
					onClick={() => {
						showBackPage(data.name as MoveOptions);
						data.onClick(trove,avatar,setChoice);
					}}
					name={data.name}
					xCoordinate={i}
					description={data.description}
					energy_cost={data.energyCost}
				/>
			))}
		</frame>
	);
}

const avatar_options = [
	{
		name: "Boulder",
		onClick: onBoulderClick,
		energyCost: 2,
		description: "Rock and stone.",
	},
]

export function AvatarOptions({ trove, avatar, setChoice, showBackPage }: BaseOptionsProps) {
	return (
		<frame Size={UDim2.fromScale(1, 2 / 3)} BackgroundTransparency={1}>
			{avatar_options.map((data,i) => (
				<MainPageOption
					onClick={() => {
						showBackPage(data.name as MoveOptions);
						data.onClick(trove,avatar,setChoice);
					}}
					name={data.name}
					xCoordinate={i}
					description={data.description}
					energy_cost={data.energyCost}
				/>
			))}
		</frame>
	);
}
