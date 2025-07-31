import { Linear } from "@rbxts/easing-functions";
import { CollectionService, TweenService, Workspace } from "@rbxts/services";
import Tween, { PseudoTween } from "@rbxts/tween";


const cage = Workspace.FindFirstChild("Cage") as Model;
const original_cage_pos = cage.PrimaryPart!.Position;
let runningTween: PseudoTween | undefined;
let isUp = false;
function afterPull() {
	const shouldBeUp = machines.every((machine) => machine.HasTag("Pulled"));
	if (shouldBeUp === isUp) {
		return;
	}
	isUp = shouldBeUp;
	const origin = cage.PrimaryPart!.Position;
	const goal = shouldBeUp ? original_cage_pos.add(new Vector3(0, 30, 0)) : original_cage_pos;
	runningTween?.Cancel();
	runningTween = Tween(
		math.abs(goal.Y - origin.Y) / 30.0,
		Linear,
		(position) => cage.PivotTo(new CFrame(position)),
		origin,
		goal,
	);
}


const machines: Array<Instance> = CollectionService.GetTagged("Contraption");

for (const machine of machines) {
	const lever = machine.FindFirstChild("Lever", true) as Model;
	const Light = machine.FindFirstChild("Light", true) as BasePart;
	const original_cframe = lever.GetPivot();
	const clickDetector = machine.FindFirstChild("ClickDetector", true) as ClickDetector;
	clickDetector.MouseClick.Connect((player) => {
		if (machine.HasTag("Pulling")) {
			return;
		}
		machine.AddTag("Pulling");
		const goal = machine.HasTag("Pulled") ? 0 : -60;
		Tween(
			1,
			Linear,
			(rotation) => lever.PivotTo(original_cframe.mul(CFrame.Angles(0, 0, math.rad(rotation)))),
			-(60 + goal),
			goal,
		).Wait();
		machine.RemoveTag("Pulling");

		if (!machine.HasTag("Pulled")) {
			machine.AddTag("Pulled");
		} else {
			machine.RemoveTag("Pulled");
		}
		afterPull();
		Light.BrickColor = machine.HasTag("Pulled") ? new BrickColor("Lime green") : BrickColor.Red();
	});
}
