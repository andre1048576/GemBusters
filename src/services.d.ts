interface Workspace extends Instance {
	Light: Part & {
		PointLight: PointLight;
	};
	Hurt: Part & {
		PointLight: PointLight;
	};
	MatchOrigin: MatchClass;
}

interface MatchClass extends Part {
	Tiles: Folder;
}

interface PathNode extends Part {
	Left: Folder;
	Right: Folder;
	Down: Folder;
	Up: Folder;
}

interface MatchSpawnerI extends Part {
	ClickDetector: ClickDetector;
}

interface AvatarClass extends Model {
	Humanoid: Humanoid;
	MoveFinished: BindableEvent;
}

interface ReplicatedStorage extends Instance {
	Mini: AvatarClass;
	Tiles: Folder & {
		DoubleDecker: Model;
		Flat: Model;
		Slope: Model & {
			pathnode: Part;
		};
		Ladder: Model & {
			pathnode: Part;
		};
		Solid: Model;
		Wall: Model;
		Ceiling: Model;
		Elevator: Model;
	};
	TileObjects: Folder & {
		HealthCube: Model;
		Spike: Model;
		Boulder: Model;
	};
}
