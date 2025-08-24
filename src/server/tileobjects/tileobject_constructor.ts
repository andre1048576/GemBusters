import { Components } from "@rbxts/component";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { Boulder } from "server/tileobjects/Boulder";
import { HealthCube } from "server/tileobjects/Healthcube";
import { Spike } from "server/tileobjects/Spike";
import { TileObject } from "server/tileobjects/TileObject";


export const construct_health_cube = () => {
	const cube_model = ReplicatedStorage.TileObjects.HealthCube.Clone();
	cube_model.Parent = Workspace;
	const [success, health_cube] = Components.Instantiate<TileObject>(HealthCube, cube_model).await();
	if (!success) {
		error("wtf");
	}
	return health_cube;
};

export const construct_spike = () => {
	const cube_model = ReplicatedStorage.TileObjects.Spike.Clone();
	cube_model.Parent = Workspace;
	const [success, health_cube] = Components.Instantiate<TileObject>(Spike, cube_model).await();
	if (!success) {
		error("wtf");
	}
	return health_cube;
};

export const construct_boulder = () => {
	const cube_model = ReplicatedStorage.TileObjects.Boulder.Clone();
	cube_model.Parent = Workspace;
	const [success, health_cube] = Components.Instantiate<TileObject>(Boulder, cube_model).await();
	if (!success) {
		error("wtf");
	}
	return health_cube;
};


export class TileObjectConstructor {

	public static create_object(s : string) : TileObject {
		switch (s) {
			case "HealthCube":
				return construct_health_cube();
			case "Spike":
				return construct_spike();
			case "Boulder":
				return construct_boulder();
		}
		error("huh");
	}
}
