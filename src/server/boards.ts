import { ReplicatedStorage } from "@rbxts/services";
import { Direction, Rotation } from "../shared/path";
import { TileObject } from "./tileobjects/TileObject";
import { TileObjectConstructor } from "./tileobjects/tileobject_constructor";

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
				let slope_angle!: number;
				if (c === "↑") {
					slope_angle = 0;
					slope.pathnode.SetAttribute("Direction", Direction.Up);
				}
				if (c === "←") {
					slope_angle = math.pi / 2;
					slope.pathnode.SetAttribute("Direction", Direction.Left);
				}
				if (c === "↓") {
					slope_angle = math.pi;
					slope.pathnode.SetAttribute("Direction", Direction.Down);
				}
				if (c === "→") {
					slope_angle = (3 * math.pi) / 2;
					slope.pathnode.SetAttribute("Direction", Direction.Right);
				}
				slope.PivotTo(slope.GetPivot().mul(CFrame.Angles(0, slope_angle, 0)));
				return slope;
			case "v":
			case "^":
			case "<":
			case ">":
				const ladder = ReplicatedStorage.Tiles.Ladder.Clone();
				let ladder_angle!: number;
				if (c === "^") {
					ladder_angle = 0;
					ladder.pathnode.SetAttribute("Direction", Direction.Up);
				}
				if (c === "<") {
					ladder_angle = math.pi / 2;
					ladder.pathnode.SetAttribute("Direction", Direction.Left);
				}
				if (c === "v") {
					ladder_angle = math.pi;
					ladder.pathnode.SetAttribute("Direction", Direction.Down);
				}
				if (c === ">") {
					ladder_angle = (3 * math.pi) / 2;
					ladder.pathnode.SetAttribute("Direction", Direction.Right);
				}
				ladder.PivotTo(ladder.GetPivot().mul(CFrame.Angles(0, ladder_angle, 0)));
				return ladder;
			case "C":
				return ReplicatedStorage.Tiles.Ceiling.Clone();
			case "E":
				return ReplicatedStorage.Tiles.Elevator.Clone();
			default:
				error("invalid character in board declaration : c");
		}
	}

	private static rotate_char(c: string, rotation: 1 | 2 | 3): string {
		switch (c) {
			case "^":
				switch (rotation) {
					case 1:
						return ">";
					case 2:
						return "v";
					case 3:
						return "<";
				}
			case ">":
				switch (rotation) {
					case 1:
						return "v";
					case 2:
						return "<";
					case 3:
						return "^";
				}
			case "v":
				switch (rotation) {
					case 1:
						return "<";
					case 2:
						return "^";
					case 3:
						return ">";
				}
			case "<":
				switch (rotation) {
					case 1:
						return "^";
					case 2:
						return ">";
					case 3:
						return "v";
				}
			case "↑":
				switch (rotation) {
					case 1:
						return "→";
					case 2:
						return "↓";
					case 3:
						return "←";
				}
			case "→":
				switch (rotation) {
					case 1:
						return "↓";
					case 2:
						return "←";
					case 3:
						return "↑";
				}
			case "↓":
				switch (rotation) {
					case 1:
						return "←";
					case 2:
						return "↑";
					case 3:
						return "→";
				}
			case "←":
				switch (rotation) {
					case 1:
						return "↑";
					case 2:
						return "→";
					case 3:
						return "↓";
				}
			default:
				return c;
		}
	}

	private board: string[][] = [];
	private objects: [string, Vector3[]][] = [];

	constructor(preParsed: string, objects: [string, Vector3[]][]) {
		this.board = preParsed.split("\n").map((v) => [...v]);
		this.board.pop();
		this.board.shift();
		this.objects = objects;
	}

	/**
	 * construct
	 */
	public construct(): [tiles: Model[][], objects: TileObject[]] {
		let parts: Model[][] = [];

		this.board.forEach((row) => {
			let rowArray: Model[] = [];
			[...row].forEach((char) => {
				const tile_model = BoardString.char_to_tile(char);
				rowArray.push(tile_model);
			});
			parts.push(rowArray);
		});

		let tileObjects: TileObject[] = [];

		this.objects.forEach(([name, positions]) => {
			positions.forEach((position) => {
				const object = TileObjectConstructor.create_object(name);
				object.position = position;
				tileObjects.push(object);
			});
		});

		return [parts, tileObjects];
	}

	public rotate(rotation: Rotation) {
		if (rotation === Rotation.Zero) {
			return this;
		}
		let size = this.board.size();
		let output: string[][] = [];
		for (let index = 0; index < size; index++) {
			output.push([]);
		}
		this.board.forEach((rowArray, rowI) => {
			rowArray.forEach((char, colI) => {
				switch (rotation) {
					case Rotation.One:
						output[colI][size - 1 - rowI] = BoardString.rotate_char(char, rotation);
						break;
					case Rotation.Two:
						output[size - 1 - rowI][size - 1 - colI] = BoardString.rotate_char(char, rotation);
						break;
					case Rotation.Three:
						output[size - 1 - colI][rowI] = BoardString.rotate_char(char, rotation);
						break;
				}
			});
		});
		this.objects.forEach((o) => {
			o[1].forEach((pos, index) => {
				switch (rotation) {
					case 1:
						o[1][index] = new Vector3(size - 1 - pos.Z, pos.Y, pos.X);
						break;
					case 2:
						o[1][index] = new Vector3(size - 1 - pos.X, pos.Y, size - 1 - pos.Z);
						break;
					case 3:
						o[1][index] = new Vector3(pos.Z, pos.Y, size - 1 - pos.X);
						break;
				}
			});
		});
		this.board = output;
		return this;
	}
}

const board1: BoardString = new BoardString(
	`
________F2
____vv__^_
___2FF2___
___2CC2___
__→2FF2←__
__F2CC2F__
__222222__
__↑____↑__
__v_EE_v__
__FFFFFF__
`,
	[
		["Boulder", [new Vector3(1, 0, 1), new Vector3(6, 0, 6)]],
		["HealthCube", [new Vector3(4, 0, 8), new Vector3(6, 1, 6)]],
	],
);

board1.rotate(1);

const board2: BoardString = new BoardString(
	`
__________
__________
__v___FFF_
_FFE__22F_
_FF__>F2F_
_EE__>F2F_
______F2F_
WCC__→22F_
22C__→2←__
22W_______
`,
	[["HealthCube", [new Vector3(9, 0, 0)]]],
);

const GRID_SIZE = 10;

function eligible_boards() {
	const initial_boards = [board1, board2];
	const output: [BoardString, Rotation][] = [];

	initial_boards.forEach((board) => {
		output.push([board, Rotation.Zero]);
		output.push([board, Rotation.One]);
		output.push([board, Rotation.Two]);
		output.push([board, Rotation.Three]);
	});
	return output;
}

function pickRandom<T>(values: Array<T>) {
	const max = values.size();
	return values[math.random(0, max - 1)];
}

export function getBoard() {
	const xSize = 2;
	const ySize = 3;
	let outputTiles: Model[][] = [];
	for (let index = 0; index < GRID_SIZE * ySize; index++) {
		outputTiles[index] = [];
	}
	let outputObjects: TileObject[] = [];
	for (let index = 0; index < xSize * ySize; index++) {
		let currX = index % xSize;
		let currY = index.idiv(xSize);
		const [board, rotation] = pickRandom(eligible_boards());
		board.rotate(rotation);
		const [tiles, objects] = board.construct();
		tiles.forEach((tileRow, row) => {
			tileRow.forEach((tile, column) => {
				outputTiles[row + currY * GRID_SIZE][column + currX * GRID_SIZE] = tile;
			});
		});
		objects.forEach((o) => {
			o.position = o.position?.add(new Vector3(currX * GRID_SIZE, 0, currY * GRID_SIZE));
			outputObjects.push(o);
		});
	}
	return $tuple(outputTiles, outputObjects);
}

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
