import { Direction } from "shared/path";
import { PathTile } from "./tile";
import { Linear } from "@rbxts/easing-functions";
import { Avatar } from "server/components/avatar";
import Tween from "@rbxts/tween";

export class Elevator extends PathTile {
	public path_direction(Gdirection: Direction): string {
		if (this.Object.HasTag("Raised")) {
			return "Airborne";
		}
		return "Grounded";
	}

	public landed(avatar: Avatar): void {
		super.landed(avatar);
		let goal = new Vector3(0, 8, 0);
		if (this.Object.HasTag("Raised")) {
			this.Object.RemoveTag("Raised");
			goal = goal.mul(-1);
			this.move_tile(this, Vector3.yAxis.mul(-1));
		} else {
			this.Object.AddTag("Raised");
			this.move_tile(this, Vector3.yAxis);
		}
		const old_parent = avatar.Object.Parent!;
		avatar.Object.Parent = this.Object;
		Tween(
			1,
			Linear,
			(dist) => this.Object.PivotTo(CFrame.lookAlong(dist, this.Object.GetPivot().LookVector)),
			this.Object.GetPivot().Position,
			this.Object.GetPivot().Position.add(goal),
		).Wait();
		avatar.Object.Parent = old_parent;
		this.recalculate_callback();
	}
}
