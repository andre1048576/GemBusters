export enum Direction {
	Up,
	Down,
	Left,
	Right,
}


export function direction_to_name(d : Direction) : string {
	switch(d) {
		case Direction.Up: return "Up"
		case Direction.Down: return "Down"
		case Direction.Left: return "Left"
		case Direction.Right: return "Right"
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
