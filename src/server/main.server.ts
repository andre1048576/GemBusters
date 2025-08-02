import { DataStoreService, Players, Workspace } from "@rbxts/services";
import { Linear } from "@rbxts/easing-functions";
import Tween from "@rbxts/tween";
import { DocumentStore } from "@rbxts/document-service";

type DataSchema = {
	hasBeenKicked: boolean;
};

const documentStore = new DocumentStore({
	lockSessions: true,
	bindToClose: true,
	default: {
		hasBeenKicked: false,
	},
	check: () => {
		return true;
	},
	dataStore: DataStoreService.GetDataStore("PlayerData"),
	migrations: new Array(),
});

function PlayerAdded(player: Player) {
	const [document, created] = documentStore.GetDocument(tostring(player.UserId));
	const result = document.Open();
	if (!document.IsOpen()) {
		document.GetOpenedSignal().Wait();
	}
	const leaderstats = new Instance("Folder");
	leaderstats.Name = "leaderstats";
	leaderstats.Parent = player;
	const hasBeenKicked = new Instance("BoolValue");
	hasBeenKicked.Name = "Has Been Kicked";
	hasBeenKicked.Parent = leaderstats;
	hasBeenKicked.Value = document.GetCache().hasBeenKicked;
}

Players.PlayerAdded.Connect(PlayerAdded);

const Light = Workspace.Light.PointLight;

const greenHSV = Color3.fromHSV(0.333, 1, 1);
const redHSV = Color3.fromHSV(0, 1, 1);
const blueHSV = Color3.fromHSV(0.666, 1, 1);

task.spawn(() => {
	while (true) {
		Tween(1 / 3, Linear, (color) => (Light.Color = color), redHSV, greenHSV).Wait();
		Tween(1 / 3, Linear, (color) => (Light.Color = color), greenHSV, blueHSV).Wait();
		Tween(1 / 3, Linear, (color) => (Light.Color = color), blueHSV, redHSV).Wait();
	}
});

Workspace.Hurt.Touched.Connect((part) => {
	const player = Players.GetPlayerFromCharacter(part.Parent);
	if (!player) {
		return;
	}
	const [document, _] = documentStore.GetDocument(tostring(player.UserId));
	const data = table.clone(document.GetCache());
	data.hasBeenKicked = true;
	document.SetCache(data);
	player.Kick("You are weak!");
});