import { Component, Components, TagComponent } from "@rbxts/component";
import { Players, ReplicatedStorage, UserService } from "@rbxts/services";
import { Board } from "./board";
import { Avatar } from "server/components/avatar";
import { PathTile } from "server/tiles/tile";
import { remotes } from "shared/remotes";
import { Direction } from "shared/path";

export class Match extends TagComponent<MatchClass> {
	public GridSize!: number;
	public GridX!: number;
	public GridY!: number;
	public players: Player[] = [];
	public avatars: Avatar[] = [];
	public board!: Board;

	public Start(): void {
		this.GridSize = this.Object.GetAttribute("TileSize") as number;
		const centerCFrame = this.Object.CFrame.add(Vector3.yAxis).add(
			new Vector3(this.GridSize / 2, 0, this.GridSize / 2),
		);
		const [success1, board] = Components.Instantiate(Board, this.Object.Tiles, "Board").await();
		if (!success1) {
			error("how did that not load??");
		}
		this.Trove.add(board);
		this.board = board;
		this.board.centerCFrame = centerCFrame;
		this.board.GridSize = this.GridSize;

		this.players.forEach((player, index) => {
			let UserId = player.UserId;
			if (UserId === -1) {
				UserId = 281304800;
			} else if (UserId === -2) {
				UserId = 120846695;
			}
			const avatar = ReplicatedStorage.Mini.Clone() as AvatarClass;
			const description = Players.GetHumanoidDescriptionFromUserId(UserId);
			avatar.Humanoid.DisplayName = UserService.GetUserInfosByUserIdsAsync([UserId])[0].DisplayName;
			description.HeadScale = 0.475;
			description.WidthScale = 0.475;
			description.HeightScale = 0.475;
			description.DepthScale = 0.49;
			const destinationX = index;
			const destinationY = index;
			const avatar_spawn_pos = new Vector3(destinationX, 0, destinationY);
			avatar.SetAttribute("Position", avatar_spawn_pos);
			avatar.Parent = this.Object;
			const [success, a] = Components.Instantiate<Avatar>(Avatar, avatar, "Avatar").await();
			if (!success) {
				error("avatar failed to be instantiated!");
			}
			this.board.add_to_board(a, avatar_spawn_pos);
			this.avatars.push(a);
			a.tileOn = this.board.get_tile(avatar_spawn_pos);
			a.player = player;
			a.GridSize = this.GridSize;
			this.Trove.add(avatar);
			avatar.Humanoid.ApplyDescription(description);
		});

		this.avatars.forEach((avatar) => {
			avatar.create_path = (dirs : Direction[]) => {
				return this.board.pathfind_existing_path(avatar.Object.GetAttribute("Position") as Vector3,dirs)
			};
			avatar.place_boulder = (pos) => {
				this.board.add_boulder_to_board(pos);
			};
			avatar.attack_tile = (pos) => {
				this.board.remove_objects_from_tile(pos);
			};
			avatar.on_health_change = () => {
				avatar.Object.SetAttribute("Health",avatar.health)
				remotes.update_attribute.firePlayers(this.players,avatar.player,"Health",avatar.health)
			}
			avatar.on_energy_change = () => {
				avatar.Object.SetAttribute("Energy",avatar.energy)
				remotes.update_attribute.firePlayers(this.players,avatar.player,"Energy",avatar.energy)
			}

		});
		//TODO: TURN THIS INTO TWO EVENTS
		remotes.pathfind.onRequest((p: Player, move_type: string) => {
			const avatar = this.avatars.find((avatar) => avatar.player === p);
			if (!avatar) {
				error("what!?! no avatar found!!!");
			}
			if (move_type === "Move") {
				function is_valid(tile: PathTile) {
					return tile.canTraverse();
				}
				if (avatar.energy === 0) {
					return []
				}
				return this.board.pathfind(avatar, avatar.energy, is_valid);
			} else if (move_type === "Attack") {
				function is_valid(tile: PathTile) {
					return tile.tile_objects.some((v) => v.obstructs());
				}
				return this.board.pathfind(avatar, 1, is_valid);
			} else if (move_type === "Boulder") {
				function is_valid(tile: PathTile) {
					return tile.isEmpty();
				}
				return this.board.pathfind(avatar, 1, is_valid);
			}
			error("invalid type suggested!");
		});

		remotes.get_adjacencies.onRequest((player) => {
			const output : [pos : Vector3,destinations : [Part,Direction][]][] = []
			this.board.node_adjacencies.forEach((adj,pos) => {
				output.push([pos,adj.filter(([p]) => p.canTraverse() || p.avatar?.player === player).map(([p,d]) => [p.Object,d])])
			})
			return output;
		})

		remotes.enter_match.firePlayers(this.players, this.players);

		task.spawn(() => {
			let index = 0;
			let turns = 20;
			while (turns > 0) {
				const avatar = this.avatars[index];
				task.spawn(() => {
					avatar.selected();
				});
				avatar.Object.MoveFinished.Event.Wait();
				index = (index + 1) % this.avatars.size();
				if (index === 0) {
					turns -= 1;
					remotes.update_timer.firePlayers(this.players,turns)
				}
			}
			this.Destroy();
		});
	}

	Destroy(): void {
		print("destroying!!");
		this.Object.RemoveTag("Match")
		remotes.exit_match.firePlayers(this.players);
		super.Destroy();
	}
}
