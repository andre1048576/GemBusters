export enum Direction {
	Up,
	Down,
	Left,
	Right,
}


export function letter_to_dir(c : string) {
	switch (c) {
		case "W":
			return Direction.Up;
		case "A":
			return Direction.Left;
		case "S":
			return Direction.Down;
		case "D":
			return Direction.Right;
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
