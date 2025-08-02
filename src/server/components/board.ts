import { TagComponent, Components } from "@rbxts/component";
import { board1 } from "shared/boards";
import { Direction } from "shared/path";
import { PathTile } from "../../shared/tiles/tile";
import { TileConstructor } from "shared/tiles/tile_constructor";
import { Avatar } from "./avatar";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { HealthCube } from "shared/tileobjects/Healthcube";
import { Spike } from "shared/tileobjects/Spike";
import { TileObject } from "shared/tileobjects/TileObject";

const BASE_SIZE = 8;

const HEALTH_CUBE_POS = [new Vector3(8,0,0),new Vector3(8,1,2),new Vector3(1,0,1),new Vector3(0,0,9)]

const SPIKE_POS = [new Vector3(2,0,2),new Vector3(0,1,8),new Vector3(1,1,9)]

const construct_health_cube = () => {
	const cube_model = ReplicatedStorage.TileObjects.HealthCube.Clone();
	cube_model.Parent = Workspace;
	const [success,health_cube] = Components.Instantiate<TileObject>(HealthCube,cube_model).await();
	if (!success) {
		error("wtf");
	}
	return health_cube; 
}

const construct_spike = () => {
	const cube_model = ReplicatedStorage.TileObjects.Spike.Clone();
	cube_model.Parent = Workspace;
	const [success,health_cube] = Components.Instantiate<TileObject>(Spike,cube_model).await();
	if (!success) {
		error("wtf");
	}
	return health_cube; 
}

export class Board extends TagComponent<Folder> {
	public pathNodes: PathTile[] = [];

	public Nodes: PathTile[][][] = [];
	public node_adjacencies: Map<Vector3, [PathTile, Direction][]> = new Map();
	public GridY!: number;
	public GridX!: number;
	public GridSize!: number;
	public centerCFrame!: CFrame;
	public paths!: Map<Vector3, Part[]>;

	Start(): void {
		const board = board1.construct();
		this.GridY = board.size();
		this.GridX = board[0].size();

		function instantiate_based_on_name(part: Part) {
			return Components.Instantiate<PathTile>(TileConstructor.pathnode_to_class(part), part, "Path");
		}

		board.forEach((models, c) => {
			let columnNodes: PathTile[][] = [];
			models.forEach((tile, r) => {
				tile.SetAttribute("Position", new Vector3(r, c));
				tile.ScaleTo(this.GridSize / BASE_SIZE);
				tile.PivotTo(
					this.centerCFrame
						.add(new Vector3((r - this.GridX / 2) * this.GridSize, 0, (c - this.GridY / 2) * this.GridSize))
						.mul(CFrame.Angles(0, math.rad(tile.PrimaryPart!.Orientation.Y), 0)),
				);
				tile.Parent = this.Object;
				tile.PrimaryPart!.Color =
					r % 2 === c % 2 ? new BrickColor("Dark green").Color : new BrickColor("Sea green").Color;
				this.Trove.add(tile);
				const p = tile.GetChildren().filter((node) => node.HasTag("PathNode")) as [Part];
				let rowNodes: PathTile[] = [];
				p.forEach((node) => {
					node.SetAttribute("Position", new Vector3(r, (node.GetAttribute("Position") as Vector3).Y, c));
					const [success, pathTile] = instantiate_based_on_name(node).await();
					if (!success) {
						error("what");
					}
					
					pathTile.direction = node.GetAttribute("Direction") as Direction;
					rowNodes[(node.GetAttribute("Position") as Vector3).Y] = pathTile;
					this.pathNodes.push(pathTile);
					pathTile.recalculate_callback = () => {
						this.recalculate_paths();
					};
					pathTile.move_tile = (tile: PathTile, delta: Vector3) => {
						this.move_tile(tile, delta);
					};
					if (HEALTH_CUBE_POS.includes(node.GetAttribute("Position") as Vector3)) {
						const health_cube = construct_health_cube();
						pathTile.add(health_cube);
					} else if (SPIKE_POS.includes(node.GetAttribute("Position") as Vector3)) {
						const spike = construct_spike();
						pathTile.add(spike);
					}

				});
				columnNodes.push(rowNodes);
			});
			this.Nodes.push(columnNodes);
		});
		this.recalculate_paths();
	}

	public add_to_board(avatar: Avatar, avatar_spawn_pos: Vector3) {
		this.Nodes[avatar_spawn_pos.Z][avatar_spawn_pos.X][avatar_spawn_pos.Y].landed(avatar);
		avatar.Object.PivotTo(this.Nodes[avatar_spawn_pos.Z][avatar_spawn_pos.X][avatar_spawn_pos.Y].Object.GetPivot());
	}

	public move_tile(tile: PathTile, delta: Vector3) {
		const current_position = tile.Object.GetAttribute("Position") as Vector3;
		const new_position = current_position.add(delta);
		this.Nodes[current_position.Z][current_position.X].remove(current_position.Y);
		this.Nodes[new_position.Z][new_position.X][new_position.Y] = tile;
		tile.Object.SetAttribute("Position", new_position);
		tile.contents.forEach((element) => {
			element.SetAttribute("Position", new_position);
		});
	}

	public get_tile(pos : Vector3) {
		return this.Nodes[pos.Z][pos.X][pos.Y]
	}

	public recalculate_paths() {
		const set_adjacent = (tile: PathTile) => {
			const pos = tile.Object.GetAttribute("Position") as Vector3;
			let paths: [PathTile, Direction][] = [];
			if (pos.Z + 1 < this.GridY) {
				this.Nodes[pos.Z + 1][pos.X].forEach((other_tile) => {
					if (tile.is_adjacent(other_tile, Direction.Down)) {
						paths.push([other_tile, Direction.Down]);
					}
				});
			}
			if (pos.X + 1 < this.GridX) {
				this.Nodes[pos.Z][pos.X + 1].forEach((other_tile) => {
					if (tile.is_adjacent(other_tile, Direction.Right)) {
						paths.push([other_tile, Direction.Right]);
					}
				});
			}
			if (pos.Z - 1 >= 0) {
				this.Nodes[pos.Z - 1][pos.X].forEach((other_tile) => {
					if (tile.is_adjacent(other_tile, Direction.Up)) {
						paths.push([other_tile, Direction.Up]);
					}
				});
			}
			if (pos.X - 1 >= 0) {
				this.Nodes[pos.Z][pos.X - 1].forEach((other_tile) => {
					if (tile.is_adjacent(other_tile, Direction.Left)) {
						paths.push([other_tile, Direction.Left]);
					}
				});
			}
			this.node_adjacencies.set(pos, paths);
		};
		this.node_adjacencies.clear();
		this.pathNodes.forEach((node) => {
			set_adjacent(node);
		});
	}

	public get_adjacent = (pos: Vector3) => {
		return this.node_adjacencies.get(pos);
	};

	/**
	 * pathfind
	 */
	public pathfind(avatar: AvatarClass) {
		const avatar_pos = avatar.GetAttribute("Position") as Vector3;
		let distance = 5;
		this.paths = new Map();
		let root = this.Nodes[avatar_pos.Z][avatar_pos.X][avatar_pos.Y];
		let checking: [PathTile, number, Part[]][] = [[root, distance, []]];
		let valid: PathTile[] = [root];
		while (!checking.isEmpty()) {
			const [current_tile, distance, path] = checking.shift()!;
			this.get_adjacent(current_tile.Object.GetAttribute("Position") as Vector3)
				?.filter((partTuple) => !valid.includes(partTuple[0]))
				.filter((partTuple) => partTuple[0].canTraverse())
				.forEach((partTuple) => {
					const [next_tile, direction] = partTuple;
					let pathClone = path;
					pathClone = [
						...pathClone,
						...current_tile.get_direction_tiles(direction, false),
						...next_tile.get_direction_tiles(direction, true),
					];
					valid.push(next_tile);
					this.paths.set(next_tile.Object.GetAttribute("Position") as Vector3, pathClone);
					if (distance > 1) {
						checking.push([next_tile, distance - 1, pathClone]);
					}
				});
		}
		valid.shift();
		return valid;
	}
}
