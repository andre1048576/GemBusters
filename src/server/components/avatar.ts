import { Components, TagComponent } from "@rbxts/component";
import { Linear } from "@rbxts/easing-functions";
import { Workspace } from "@rbxts/services";
import Tween, { PseudoTween } from "@rbxts/tween";
import { PathTile } from "server/tiles/tile";
import { TileConstructor } from "server/tiles/tile_constructor";
import { remotes } from "../../shared/remotes";
import { Direction } from "shared/path";

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
	public player!: Player;
	public GridSize!: number;
	public tileOn?: PathTile;

	public health: number = 7
	public energy: number = 5

	public modify_health(delta : number) {
		this.health = math.clamp(this.health+delta,0,7)
		this.on_health_change()
	}

	public modify_energy(delta : number) {
		this.energy = math.clamp(this.energy+delta,0,5)
		this.on_energy_change()
	}

	public on_health_change!: () => void;
	public on_energy_change!: () => void;
	public create_path!: (dirs : Direction[]) => Part[]
	public attack_tile!: (pos: Vector3) => void;
	public place_boulder!: (pos: Vector3) => void;

	private Move(dirs : Direction[]) {
		const path = this.create_path(dirs) as Part[];

		this.Object.SetAttribute("Position", path[path.size()-1].GetAttribute("Position"));
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
				remotes.avatar_selected.fire(this.player, false,undefined);
				this.Object.MoveFinished.Fire();
			}),
		);
	}

	private Boulder(goal: Vector3) {
		//TODO: place boulder
		this.place_boulder(goal);
		this.Object.MoveFinished.Fire();
		this.modify_energy(-2);
	}

	private Attack(goal: Vector3) {
		this.attack_tile(goal);
		this.Object.MoveFinished.Fire();
		this.modify_energy(-1);
	}

	public selected() {
		remotes.avatar_selected.fire(this.player, true,this.Object);
		this.Object.ClickDetector.MaxActivationDistance = 0;
		let goal: any;
		let action: string;
		this.Trove.addPromise(
			remotes.avatar_option_selected
				.promise(
					(p,_1,_?) => p === this.player,
					(_,m_type,_goal?) => {
						goal = _goal
						action = m_type;
					}
				)
				.andThenCall(() => {
					switch (action) {
						case "Move":
							this.Move(goal as Direction[]);
							break;
						case "Boulder":
							this.Boulder(goal as Vector3);
							break;
						case "Attack":
							this.Attack(goal as Vector3);
							break;
						case "Rest":
							this.Rest();
							break;
						default:
							error("wrong value passed?");
					}
				}),
		).await();
	}
	Rest() {
		this.modify_energy(999);
		this.Object.MoveFinished.Fire();
	}

	public Initialize(): void {
		if (!this.Object.IsDescendantOf(Workspace)) {
			return;
		}
		this.climb_anim.Priority = Enum.AnimationPriority.Action;
		this.Trove.attachToInstance(this.Object);
	}
}
