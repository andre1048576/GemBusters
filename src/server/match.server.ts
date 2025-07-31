import { Component, Components, TagComponent } from "@rbxts/component";
import { Players, ReplicatedStorage, UserService } from "@rbxts/services";
import { Direction, opposite_direction } from "shared/path";

import { Board } from "./components/board";
import { Avatar } from "server/components/avatar";

@Component({
	Tag: "Match",
})
export class Match extends TagComponent<MatchClass> {
	public GridSize!: number;
	public GridX!: number;
	public GridY!: number;
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
		print('give board grid size');
		const avatar = ReplicatedStorage.Mini.Clone() as AvatarClass;
		const description = Players.GetHumanoidDescriptionFromUserId(129152130);
		avatar.Humanoid.DisplayName = UserService.GetUserInfosByUserIdsAsync([129152130])[0].DisplayName;
		description.HeadScale = 0.475;
		description.WidthScale = 0.475;
		description.HeightScale = 0.475;
		description.DepthScale = 0.49;
		const destinationX = 0;
		const destinationY = 3;
		const avatar_spawn_pos = new Vector3(destinationX, 0, destinationY)
		avatar.SetAttribute("Position", avatar_spawn_pos);
		this.board.add_to_board(avatar,avatar_spawn_pos)
		avatar.Parent = this.Object;

		const [success, a] = Components.Instantiate<Avatar>(Avatar, avatar, "Avatar").await();
		if (!success) {
			error("avatar failed to be instantiated!");
		}
		this.avatars[129152130] = a;
		a.GridSize = this.GridSize;
		this.Trove.add(a);

		avatar.Humanoid.ApplyDescription(description);

		avatar.GetTileInfo.OnInvoke = (goal: Vector3) => {
			const path = this.board.paths.get(goal);
			return path;
		};
		avatar.GetTiles.OnServerInvoke = () => {
			return this.board.pathfind(avatar);
		};
	}
}
