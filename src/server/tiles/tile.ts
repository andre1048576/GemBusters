import { TagComponent } from "@rbxts/component";
import { Direction, direction_to_name, opposite_direction } from "shared/path";
import type { Avatar } from "server/components/avatar";
import { TileObject } from "server/tileobjects/TileObject";

export class PathTile extends TagComponent<Part> {
	public direction!: Direction;

	public avatar?: Avatar;

	public tile_objects: TileObject[] = [];

	public recalculate_callback!: () => void;
	public move_tile!: (tile: PathTile, delta: Vector3) => void;

	Initialize(): void {}

	public global_to_relative_direction(direction: Direction) {
		switch (this.direction) {
			case Direction.Up:
				return direction;
			case Direction.Down:
				switch (direction) {
					case Direction.Up:
						return Direction.Down;
					case Direction.Down:
						return Direction.Up;
					case Direction.Left:
						return Direction.Right;
					case Direction.Right:
						return Direction.Left;
				}
			case Direction.Left:
				switch (direction) {
					case Direction.Up:
						return Direction.Right;
					case Direction.Down:
						return Direction.Left;
					case Direction.Left:
						return Direction.Up;
					case Direction.Right:
						return Direction.Down;
				}
			case Direction.Right:
				switch (direction) {
					case Direction.Up:
						return Direction.Left;
					case Direction.Down:
						return Direction.Right;
					case Direction.Left:
						return Direction.Down;
					case Direction.Right:
						return Direction.Up;
				}
		}
	}

	public is_adjacent(otherTile: PathTile, Gdirection: Direction): boolean {
		const part_mov = this.path_direction(Gdirection);
		const other_part_mov = otherTile.path_direction(opposite_direction(Gdirection));
		if (part_mov !== other_part_mov) {
			return false;
		}
		if (part_mov === "Invalid") {
			return false;
		}
		return true;
	}

	public get_direction_tiles(Gdirection: Direction, reverse: boolean = false): Part[] {
		let lDirection = this.global_to_relative_direction(Gdirection);
		if (reverse) {
			lDirection = opposite_direction(lDirection);
		}
		let path = this.Object.FindFirstChild(direction_to_name(lDirection))!.GetChildren() as Part[];
		if (!reverse) {
			let _path: Part[] = [];
			path.forEach((element) => {
				_path.unshift(element);
			});
			path = _path;
		} else {
			path.push(this.Object);
		}
		return path;
	}

	public path_direction(Gdirection: Direction): string {
		error("why was this called!!");
	}

	public steppedIn(avatar: Avatar) {
		this.tile_objects.forEach((element) => {
			element.steppedIn(avatar);
		});
	}

	public steppedOut(avatar: Avatar) {
		this.tile_objects.forEach((element) => {
			element.steppedOut(avatar);
		});
	}

	public landed(avatar: Avatar) {
		this.avatar = avatar;
	}

	public left(avatar: Avatar) {
		this.avatar = undefined;
	}

	public add(tileObject: TileObject) {
		tileObject.Object.Parent = this.Object;
		tileObject.Object.PivotTo(this.Object.GetPivot());
		this.tile_objects.push(tileObject);
	}

	public remove() {
		this.tile_objects.forEach((element) => {
			element.Object.Destroy();
		});
		this.tile_objects.clear();
	}

	public canTraverse(): boolean {
		if (this.tile_objects.some((v) => v.obstructs())) {
			return false;
		}
		return !this.avatar;
	}

	public isEmpty() {
		if (this.avatar) {
			return false;
		}
		return this.tile_objects.isEmpty();
	}
}
