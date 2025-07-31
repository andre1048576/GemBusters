import { ReplicatedStorage } from "@rbxts/services";
import { Direction } from "./path";

export class BoardString {
	private static char_to_tile(c: string): Model {
		switch (c) {
			case "_":
				return ReplicatedStorage.Tiles.Flat.Clone();
			case "F":
				return ReplicatedStorage.Tiles.Solid.Clone();
			case "2":
				return ReplicatedStorage.Tiles.DoubleDecker.Clone();
			case "W":
				return ReplicatedStorage.Tiles.Wall.Clone();
			case "↑":
			case "↓":
			case "→":
			case "←":
				const slope = ReplicatedStorage.Tiles.Slope.Clone();
				let angle!: number;
				if (c === "↑") {
					angle = 0;
					slope.pathnode.SetAttribute("Direction", Direction.Up);
				}
				if (c === "←") {
					angle = math.pi / 2;
					slope.pathnode.SetAttribute("Direction", Direction.Left);
				}
				if (c === "↓") {
					angle = math.pi;
					slope.pathnode.SetAttribute("Direction", Direction.Down);
				}
				if (c === "→") {
					angle = (3 * math.pi) / 2;
					slope.pathnode.SetAttribute("Direction", Direction.Right);
				}
				slope.PivotTo(slope.GetPivot().mul(CFrame.Angles(0, angle, 0)));
				return slope;
			case "C":
				return ReplicatedStorage.Tiles.Ceiling.Clone();
			default:
				error("invalid character in board declaration : c");
		}
	}

	private board: string[] = [];
	constructor(preParsed: string) {
		this.board = preParsed.split("\n");
		this.board.pop();
		this.board.shift();
	}

	/**
	 * construct
	 */
	public construct(): Model[][] {
		let parts: Model[][] = [];

		this.board.forEach((row, index) => {
			let rowArray: Model[] = [];
			[...row].forEach((char, index2) => {
				rowArray.push(BoardString.char_to_tile(char));
			});
			parts.push(rowArray);
		});
		return parts;
	}
}

export const board1: BoardString = new BoardString(`
______
__22←_
__22←_
__↑↑__
______
`);

/*
___↑___
_W_↓_W_
_C_↑_C_
___↓___
*/

/*
W2222222W
C_→222←_C
__C2_2C__
C_→222←_C
W2222222W
*/