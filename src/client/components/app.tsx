import React, { Binding, useBinding, useEffect, useState } from "@rbxts/react";
import { Workspace } from "@rbxts/services";
import { lerp, useCamera, useEventListener, useMotion, useThrottleCallback, useThrottleEffect } from "@rbxts/pretty-react-hooks";

interface HoverProps {
	width: Binding<UDim2>;
}

function HoverThing({ width }: HoverProps) {
	return (
		<textlabel Text={""} BackgroundTransparency={0.7} BackgroundColor3={Color3.fromRGB(255, 0, 0)} Size={width} />
	);
}

interface ButtonProps {
	count: number;
	onClick: () => void;
	position?: UDim2;
}

function Button({ count, onClick, position }: ButtonProps) {
	function rotation_conversion(rotation: number): number {
		switch (true) {
			case rotation <= 14:
				return rotation;
			case rotation <= 42:
				return 28 - rotation;
			case rotation <= 70:
				return rotation - 56;
			case rotation <= 98:
				return 84 - rotation;
			default:
				return 0;
		}
	}
	const [hover_width, widthMotor] = useMotion(UDim2.fromScale(0, 1));
	const [_rotation, rotationMotor] = useMotion(0);
	const rotation = _rotation.map((value) => rotation_conversion(value));

	return (
		<textbutton
			Text={`Hello! I am currently at ${count}`}
			TextColor3={new Color3(1, 1, 1)}
			Size={new UDim2(0.1 + math.min(0.9, count / 10), 0, 0.45, 0)}
			Rotation={rotation}
			Position={position}
			Event={{
				MouseButton1Down: (btn) => {
					widthMotor.linear(UDim2.fromScale(1, 1));
					rotationMotor.linear(98, { speed: 98 });
				},
				MouseButton1Up: (btn) => {
					if (hover_width.getValue() === UDim2.fromScale(1, 1)) {
						onClick();
					}
					widthMotor.immediate(UDim2.fromScale(0, 1));
					rotationMotor.immediate(0);
				},
				MouseLeave: (btn) => {
					widthMotor.immediate(UDim2.fromScale(0, 1));
					rotationMotor.immediate(0);
				}
			}}
		>
			<HoverThing width={hover_width}></HoverThing>
		</textbutton>
	);
}

export function App() {
	const [count, setCount] = useState(0);
	const [visible, setVisible] = useState(false);
	const [uiPosition, setUiPosition] = useBinding(new UDim2());

	function handleClick() {
		setCount(count + 1);
	}

	const camera = useCamera()

	const throttled = useThrottleCallback(() => {
		if (!visible) {
			return;
		}
		const wtsp = camera.WorldToScreenPoint(light.Position)[0];
		setUiPosition(UDim2.fromOffset(wtsp?.X, wtsp?.Y));
	},{wait:0});

	useEventListener(camera.GetPropertyChangedSignal("CFrame"), () => {
		throttled.run();
	});

	useEffect(() => {
		if (count === 10) {
			Workspace.Light.PointLight.Brightness = 5;
		}
	}, [count]);

	const light = Workspace.WaitForChild("Light") as BasePart;

	const wtsp = camera.WorldToScreenPoint(light.Position)[0];
	setUiPosition(UDim2.fromOffset(wtsp?.X, wtsp?.Y));

	return (
		<screengui
			ResetOnSpawn={false}
		>
			<frame
				Visible={visible}
				BackgroundTransparency={0.5}
				Size={new UDim2(0.4, 0, 0.4, 0)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				Position={uiPosition}
			>
				<Button count={count} onClick={handleClick} />
				<Button count={count} onClick={handleClick} position={UDim2.fromScale(0, 0.5)} />
			</frame>
			<textbutton
				Size={UDim2.fromScale(0.1, 0.1)}
				AnchorPoint={new Vector2(1, 0.5)}
				Position={UDim2.fromScale(1, 0.5)}
				TextScaled={true}
				Text={visible ? "Hide" : "Show"}
				Event={{
					Activated: () => {
						setVisible(!visible);
					},
				}}
			>
				<uiaspectratioconstraint AspectRatio={2} />
			</textbutton>
		</screengui>
	);
}
