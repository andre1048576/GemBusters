import { useEventListener } from "@rbxts/pretty-react-hooks";
import React, { useBinding } from "@rbxts/react";
import { remotes } from "shared/remotes";

export function TurnTimer() {
    const [turns,setTurns] = useBinding(20);

    useEventListener(remotes.update_timer,(turns_left) => {
        setTurns(turns_left)
    })

    const turnsText = turns.map((n) => `${n}`)

	return (
		<frame AnchorPoint={new Vector2(0.5, 0)} AutomaticSize={"X"} Position={UDim2.fromScale(0.5, 0)} Size={UDim2.fromScale(0, 0.1)} BackgroundColor3={new Color3(1,1,1)}>
			<uilistlayout FillDirection={"Horizontal"} HorizontalAlignment={"Center"} />
            <imagelabel Size={UDim2.fromScale(1,1)} BackgroundTransparency={1} Image={"rbxassetid://117197623492937"} SizeConstraint={"RelativeYY"}>
            </imagelabel>
            <textlabel Text={turnsText} Size={UDim2.fromScale(1,1)} TextScaled={true} BackgroundTransparency={1} SizeConstraint={"RelativeYY"}>
            </textlabel>
		</frame>
	);
}
