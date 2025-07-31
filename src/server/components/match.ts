import { Component, Components, TagComponent } from "@rbxts/component";
import { Players, ReplicatedStorage, UserService } from "@rbxts/services";
import { Board } from "./board";
import { Avatar } from "server/components/avatar";


export class Match extends TagComponent<MatchClass> {
	public GridSize!: number;
	public GridX!: number;
	public GridY!: number;
	public players: Player[] = [];
	public avatars: Avatar[] = [];
	public board!: Board;


	public Start(): void {
		this.GridSize = this.Object.GetAttribute("TileSize") as number;
		const centerCFrame = this.Object.CFrame.add(Vector3.yAxis);
		const [success1, board] = Components.Instantiate(Board, this.Object.Tiles, "Board").await();
		if (!success1) {
			error("how did that not load??");
		}
		this.Trove.add(board);
		this.board = board;
		this.board.centerCFrame = centerCFrame;
		this.board.GridSize = this.GridSize;
		
		this.players.forEach((player,index) => {
			let UserId = player.UserId
			if (UserId === -1) {
				UserId = 281304800
			} else if (UserId === -2) {
				UserId = 120846695
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
			const avatar_spawn_pos = new Vector3(destinationX, 0, destinationY)
			avatar.SetAttribute("Position", avatar_spawn_pos);
			this.board.add_to_board(avatar,avatar_spawn_pos)
			avatar.Parent = this.Object;
			const [success, a] = Components.Instantiate<Avatar>(Avatar, avatar, "Avatar").await();
			if (!success) {
				error("avatar failed to be instantiated!");
			}
			this.avatars.push(a);
			a.current_player = player;
			a.GridSize = this.GridSize;
			this.Trove.add(a);
			avatar.Humanoid.ApplyDescription(description);
		});
		

		
		this.avatars.forEach(avatar => {
			avatar.Object.GetTileInfo.OnInvoke = (goal: Vector3) => {
			const path = this.board.paths.get(goal);
			return path;
			};
			avatar.Object.GetTiles.OnServerInvoke = () => {
				return this.board.pathfind(avatar.Object);
			};
			avatar.Object.MoveFinished.Event.Connect(() => {
				const new_pos = avatar.Object.GetAttribute("Position") as Vector3
				this.board.avatar_done_move(avatar.Object,new_pos);
			})
		});
		this.Trove.add(task.spawn(() => {
			let index = 0;
			print('hi');
			while (true) {
				//tell the first avatar it can be selected
				const avatar = this.avatars[index]
				avatar.selected();
				avatar.Object.MoveFinished.Event.Wait();
				index= (index+1)%this.avatars.size();
			}
		}))
		
	}
}
