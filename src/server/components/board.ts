import { TagComponent, Components } from "@rbxts/component";
import { Direction } from "shared/path";
import { PathTile } from "../tiles/tile";
import { TileConstructor } from "server/tiles/tile_constructor";
import { Avatar } from "./avatar";
import { getBoard } from "server/boards";
import { construct_boulder } from "server/tiles/tileobject_constructor";

const BASE_SIZE = 8;


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
		const [board,objects] = getBoard();
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
				});
				columnNodes.push(rowNodes);
			});
			this.Nodes.push(columnNodes);
		});

		objects.forEach((tileObject) => {
			const pos = tileObject.position!
			this.Nodes[pos.Z][pos.X][pos.Y].add(tileObject);
		})

		this.recalculate_paths();
	}

	public add_boulder_to_board(pos: Vector3) {
		const boulder = construct_boulder();
		this.Nodes[pos.Z][pos.X][pos.Y].add(boulder);
	}

	public remove_objects_from_tile(pos: Vector3) {
		this.Nodes[pos.Z][pos.X][pos.Y].remove();
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
		tile.avatar?.Object.SetAttribute("Position", new_position);
	}

	public get_tile(pos: Vector3) {
		return this.Nodes[pos.Z][pos.X][pos.Y];
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

	public pathfind_existing_path(start : Vector3,steps : Direction[]) : Part[] {
		let path : Part[] = []
		let current = this.Nodes[start.Z][start.X][start.Y];
		steps.forEach(direction => {
			const [next_tile] = this.get_adjacent(current.Object.GetAttribute("Position") as Vector3)?.find(([_,d]) => d === direction)!
			path = [
				...path,
				...current.get_direction_tiles(direction,false),
				...next_tile.get_direction_tiles(direction,true)
			]
			current = next_tile;
		});
		return path;
	}
	/**
	 * pathfind
	 */
	public pathfind(avatar: Avatar, distance: number, validator: (arg0: PathTile) => boolean) {
		const avatar_pos = avatar.Object.GetAttribute("Position") as Vector3;
		this.paths = new Map();
		let root = this.Nodes[avatar_pos.Z][avatar_pos.X][avatar_pos.Y];
		let checking: [PathTile, number, Part[]][] = [[root, distance, []]];
		let valid: PathTile[] = [root];
		while (!checking.isEmpty()) {
			const [current_tile, distance, path] = checking.shift()!;
			this.get_adjacent(current_tile.Object.GetAttribute("Position") as Vector3)
				?.filter((partTuple) => !valid.includes(partTuple[0]))
				.filter((partTuple) => validator(partTuple[0]))
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
