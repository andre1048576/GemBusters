interface Workspace extends Instance {
	Light: Part & {
		PointLight: PointLight;
	};
	Hurt: Part & {
		PointLight: PointLight;
	};
}

interface MatchClass extends Part {
	Tiles: Folder;
}

interface AvatarClass extends Model {
	ClickDetector: ClickDetector;
	GetTileInfo: BindableFunction;
	GetTiles: RemoteFunction;
	Humanoid: Humanoid;
}

interface ReplicatedStorage extends Instance {
	Mini: AvatarClass;
	Tiles : Folder & {
		DoubleDecker : Model;
		Flat : Model;
		Slope : Model & {
			pathnode : Part;
		}
		Solid : Model;
		Wall : Model;
		Ceiling : Model;
	}
}
