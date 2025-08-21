export enum Direction {
	Up,
	Down,
	Left,
	Right,
}

export enum Rotation {
	Zero,
	One,
	Two,
	Three,
}

export function direction_to_name(d: Direction): string {
	switch (d) {
		case Direction.Up:
			return "Up";
		case Direction.Down:
			return "Down";
		case Direction.Left:
			return "Left";
		case Direction.Right:
			return "Right";
	}
}

export function rotate_direction(d: Direction, rotation: Rotation) {
	switch (rotation) {
		case Rotation.Zero:
			return d;
		case Rotation.One:
			switch (d) {
				case Direction.Up:
					return Direction.Right;
				case Direction.Down:
					return Direction.Left;
				case Direction.Left:
					return Direction.Down;
				case Direction.Right:
					return Direction.Up;
			}
		case Rotation.Two:
			return opposite_direction(d);
		case Rotation.Three:
			switch (d) {
				case Direction.Up:
					return Direction.Left;
				case Direction.Down:
					return Direction.Right;
				case Direction.Left:
					return Direction.Up;
				case Direction.Right:
					return Direction.Down;
			}
	}
}

export function opposite_direction(direction: Direction) {
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
}
