import { TagComponent, Component } from "@rbxts/component";
import { board1 } from "shared/boards";
import { Direction, opposite_direction } from "shared/path";

const BASE_SIZE = 5;

export class Board extends TagComponent<Folder> {
	public pathNodes: Part[] = [];

	public Nodes: Part[][][] = [];
	public node_adjacencies: Map<Vector3, [Part, Direction][]> = new Map();
	public GridY!: number;
	public GridX!: number;
	public GridSize!: number;
	public centerCFrame!: CFrame;
	public paths!: Map<Vector3, string>;
	public avatar_positions: [PVInstance, Vector3][] = [];
	Initialize(): void {
		print("hi");
	}

	Start(): void {
		print("start board");
		const board = board1.construct();
		this.GridY = board.size();
		this.GridX = board[0].size();

		board.forEach((models, c) => {
			let columnNodes: Part[][] = [];
			models.forEach((tile, r) => {
				tile.SetAttribute("Position", new Vector3(r, c));
				print("using grid size", this.GridSize);
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
				let rowNodes: Part[] = [];
				p.forEach((node) => {
					node.SetAttribute("Position", new Vector3(r, (node.GetAttribute("Position") as Vector3).Y, c));
					rowNodes[(node.GetAttribute("Position") as Vector3).Y] = node;
				});
				this.pathNodes = [...this.pathNodes, ...p];
				columnNodes.push(rowNodes);
			});
			this.Nodes.push(columnNodes);
		});
		this.recalculate_paths();
	}

	public add_to_board(obj: PVInstance, avatar_spawn_pos: Vector3) {
		this.avatar_positions.push([obj, avatar_spawn_pos]);
		obj.PivotTo(this.Nodes[avatar_spawn_pos.Z][avatar_spawn_pos.X][avatar_spawn_pos.Y].GetPivot());
	}

	public avatar_done_move(obj : PVInstance,avatar_pos : Vector3) {
		print('avatar done move')
		this.avatar_positions.remove(this.avatar_positions.findIndex((v) => v[0] === obj));
		this.avatar_positions.push([obj, avatar_pos]);
	}

	public recalculate_paths() {
		const path_direction = (part: Part, direction: Direction) => {
			const path_type = part.GetAttribute("PathType");
			if (path_type === "Grounded" || path_type === "Airborne") {
				return path_type;
			} else if (path_type === "Slope") {
				if (direction === part.GetAttribute("Direction")) {
					return "Airborne";
				} else if (opposite_direction(direction) === part.GetAttribute("Direction")) {
					return "Grounded";
				} else {
					return "HorizontalSlope" + part.GetAttribute("Direction");
				}
			}
			return "Invalid";
		};

		const is_adjacent = (part: Part, otherPart: Part, direction: Direction) => {
			const part_mov = path_direction(part, direction);
			const other_part_mov = path_direction(otherPart, opposite_direction(direction));
			if (part_mov !== other_part_mov) {
				return false;
			}
			if (part_mov === "Invalid") {
				return false;
			}
			return true;
		};

		const set_adjacent = (node: Part) => {
			const pos = node.GetAttribute("Position") as Vector3;
			let parts: [Part, Direction][] = [];
			if (pos.Z + 1 < this.GridY) {
				this.Nodes[pos.Z + 1][pos.X].forEach((other_node) => {
					if (is_adjacent(node, other_node, Direction.Down)) {
						parts.push([other_node, Direction.Up]);
					}
				});
			}
			if (pos.X + 1 < this.GridX) {
				this.Nodes[pos.Z][pos.X + 1].forEach((other_node) => {
					if (is_adjacent(node, other_node, Direction.Right)) {
						parts.push([other_node, Direction.Left]);
					}
				});
			}
			if (pos.Z - 1 >= 0) {
				this.Nodes[pos.Z - 1][pos.X].forEach((other_node) => {
					if (is_adjacent(node, other_node, Direction.Up)) {
						parts.push([other_node, Direction.Down]);
					}
				});
			}
			if (pos.X - 1 >= 0) {
				this.Nodes[pos.Z][pos.X - 1].forEach((other_node) => {
					if (is_adjacent(node, other_node, Direction.Left)) {
						parts.push([other_node, Direction.Right]);
					}
				});
			}
			this.node_adjacencies.set(pos, parts);
			return parts;
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
		let checking: [Part, number, string][] = [[root, distance, ""]];
		let valid: Part[] = [root];
		while (!checking.isEmpty()) {
			const [current_part, distance, path] = checking.shift()!;
			this.get_adjacent(current_part.GetAttribute("Position") as Vector3)
				?.filter((partTuple) => !valid.includes(partTuple[0]))
				.filter((partTuple) => {
					print(this.avatar_positions, partTuple[0].GetAttribute("Position") as Vector3);
					return !this.avatar_positions
						.map((v) => v[1])
						.includes(partTuple[0].GetAttribute("Position") as Vector3);
				})
				.forEach((partTuple) => {
					const [part, direction] = partTuple;
					let pathClone = path;
					switch (direction) {
						case Direction.Up:
							pathClone += "W";
							break;
						case Direction.Down:
							pathClone += "S";
							break;
						case Direction.Left:
							pathClone += "A";
							break;
						case Direction.Right:
							pathClone += "D";
							break;
					}
					valid.push(part);
					this.paths.set(part.GetAttribute("Position") as Vector3, pathClone);
					if (distance > 1) {
						checking.push([part, distance - 1, pathClone]);
					}
				});
		}
		valid.shift();
		return valid;
	}
}

/*
 */
