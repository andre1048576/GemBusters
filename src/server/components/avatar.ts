import { TagComponent, Component } from "@rbxts/component";
import { Workspace } from "@rbxts/services";
import Tween, { PseudoTween } from "@rbxts/tween";
import { Linear } from "@rbxts/easing-functions";
import { Direction, letter_to_dir, opposite_direction } from "../../shared/path";
import { remotes } from "../../shared/remotes";


export class Avatar extends TagComponent<AvatarClass> {
	private move_model(model: AvatarClass, direction: Direction, distance: number) {
		if (distance < 0) {
			this.move_model(model, opposite_direction(direction), -distance);
			return;
		} else if (distance === 0) {
			return;
		}
		const SPEED = this.GridSize * 3;
		function direction_to_v3(direction: Direction, distance: number): Vector3 {
			switch (direction) {
				case Direction.Up:
					return Vector3.zAxis.mul(distance);
				case Direction.Down:
					return Vector3.zAxis.mul(-distance);
				case Direction.Left:
					return Vector3.xAxis.mul(distance);
				case Direction.Right:
					return Vector3.xAxis.mul(-distance);
			}
		}
		const delta = direction_to_v3(direction, distance);

		const rcParams: RaycastParams = new RaycastParams();
		rcParams.FilterType = Enum.RaycastFilterType.Exclude;
		rcParams.FilterDescendantsInstances = model.GetChildren();
		rcParams.CollisionGroup = "Player";

		this.walking_tween = Tween(
			distance / SPEED,
			Linear,
			(dist) => {
				const origin = dist.mul(new Vector3(1, 0, 1)).add(new Vector3(0, model.PrimaryPart!.Position.Y + 1, 0));
				const raycastResult = Workspace.Raycast(origin, Vector3.yAxis.mul(-10), rcParams);
				const goal = dist
					.mul(new Vector3(1, 0, 1))
					.add(raycastResult?.Position!.mul(Vector3.yAxis)!)
				model.PivotTo(new CFrame(goal, goal.add(delta)));
			},
			model.GetPivot().Position,
			model.GetPivot().Position.add(delta),
		);
		this.walking_tween.Wait();
	}

	public walking_tween: PseudoTween | undefined;
	private current_player?: Player;
	public GridSize! : number;
	private Move(goal: Vector3) {
		const path = this.Object.GetTileInfo.Invoke(goal) as string;
		const animator = this.Object.FindFirstChild("Animator", true) as Animator;
		const walk_track = this.Object.FindFirstChild("Walk", true) as Animation;
		const anim = animator.LoadAnimation(walk_track);
		anim.Play();
		this.Trove.add(
			task.spawn(() => {
				for (const c of [...path]) {
					this.move_model(this.Object, letter_to_dir(c)!, this.GridSize);
				}
				this.Object.ClickDetector.MaxActivationDistance = 1e5;
				anim.Stop();
				remotes.avatar_selected.fire(this.current_player!, undefined);
				this.current_player = undefined;
				this.Object.SetAttribute("Position", goal);
			}),
		);
	}

	public Initialize(): void {
		if (!this.Object.IsDescendantOf(Workspace)) {
			return;
		}
		this.Trove.add(this.Object);
		this.Trove.add(
			this.Object.ClickDetector.MouseClick.Connect((player) => {
				if (this.current_player) {
					return;
				}
				this.current_player = player;
				remotes.avatar_selected.fire(player, this.Object);
				this.Object.ClickDetector.MaxActivationDistance = 0;
				let goal: Vector3;
				this.Trove.addPromise(
					remotes.avatar_option_selected
						.promise(
							(p) => p === player,
							(_, n) => (goal = n),
						)
						.andThenCall(() => this.Move(goal)),
				);
			}),
		);
	}
	Stop(): void {
		this.walking_tween?.Cancel();
	}
}
