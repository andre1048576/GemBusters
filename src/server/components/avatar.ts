import { Components, TagComponent } from "@rbxts/component";
import { Linear } from "@rbxts/easing-functions";
import { Workspace } from "@rbxts/services";
import Tween, { PseudoTween } from "@rbxts/tween";
import { PathTile } from "shared/tiles/tile";
import { TileConstructor } from "shared/tiles/tile_constructor";
import { remotes } from "../../shared/remotes";

export class Avatar extends TagComponent<AvatarClass> {
	private animator = this.Object.FindFirstChild("Animator", true) as Animator;
	private walk_track = this.Object.FindFirstChild("Walk", true) as Animation;
	private walk_anim = this.animator.LoadAnimation(this.walk_track);
	private climb_track = this.Object.FindFirstChild("Climb", true) as Animation;
	private climb_anim = this.animator.LoadAnimation(this.climb_track);

	private move_model(model: AvatarClass, end_part: Part, current_part: Part | undefined) {
		const SPEED = this.GridSize * 3;
		const end_point = end_part.GetPivot().Position;
		const delta = end_point.sub(model.GetPivot().Position);
		const distance = delta.Magnitude;
		if (distance < 0.1) {
			return;
		}

		let lookDelta = delta;
		const is_climb = end_part.HasTag("Climb") && current_part?.HasTag("Climb");
		if (is_climb) {
			this.climb_anim.Play(0);
			lookDelta = model.GetPivot().LookVector;
			if (current_part!.Position.Y > end_part.Position.Y) {
				lookDelta = lookDelta.mul(-1);
			}
		}
		this.walking_tween = Tween(
			distance / SPEED,
			Linear,
			(dist) => {
				model.PivotTo(CFrame.lookAlong(dist, lookDelta));
			},
			model.GetPivot().Position,
			end_point,
		);
		this.walking_tween.Wait();
		this.climb_anim.Stop(0);
	}

	public walking_tween: PseudoTween | undefined;
	public current_player!: Player;
	public GridSize!: number;
	public tileOn?: PathTile;

	private Move(goal: Vector3) {
		const path = this.Object.GetTileInfo.Invoke(goal) as Part[];
		task.wait(0);

		this.Object.SetAttribute("Position", goal);
		this.walk_anim.Play();
		this.Trove.add(
			task.spawn(() => {
				this.tileOn?.left(this);
				path.forEach((v, i) => {
					this.tileOn?.steppedOut(this);
					this.tileOn = undefined;
					this.move_model(this.Object, v, path[i - 1]);
					if (v.HasTag("PathNode")) {
						const tile = Components.Get<PathTile>(TileConstructor.pathnode_to_class(v), v);
						this.tileOn = tile;
						tile!.steppedIn(this);
					}
				});
				this.Object.ClickDetector.MaxActivationDistance = 1e5;
				this.walk_anim.Stop();
				this.tileOn!.landed(this);
				remotes.avatar_selected.fire(this.current_player, undefined);
				this.Object.MoveFinished.Fire();
			}),
		);
	}

	public selected() {
		remotes.avatar_selected.fire(this.current_player, this.Object);
		this.Object.ClickDetector.MaxActivationDistance = 0;
		let goal: Vector3;
		this.Trove.addPromise(
			remotes.avatar_option_selected
				.promise(
					(p) => p === this.current_player,
					(_, n) => (goal = n),
				)
				.andThenCall(() => this.Move(goal)),
		).await();
	}

	public Initialize(): void {
		if (!this.Object.IsDescendantOf(Workspace)) {
			return;
		}
		this.climb_anim.Priority = Enum.AnimationPriority.Action;
		this.Trove.add(this.Object);
		this.Trove.add(
			this.Object.ClickDetector.MouseClick.Connect((player) => {
				if (this.current_player !== player) {
					return;
				}
				//this.selected();
			}),
		);
	}
}
