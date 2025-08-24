import { lerp, useEventListener, useMotion } from "@rbxts/pretty-react-hooks";
import React, { Binding, useBinding, useState } from "@rbxts/react";
import { MoveOptions, remotes } from "shared/remotes";
import { Trove } from "@rbxts/trove";
import { config } from "@rbxts/ripple";
import { Direction, opposite_direction } from "shared/path";
import { Workspace } from "@rbxts/services";
import { BaseOptions } from "./avatar_option";

export enum Page {
	Primary,
	Back,
}

const trove = new Trove();

interface MainPageProps {
	avatar: AvatarClass;
	setChoice: (selection: any, canConfirm: boolean) => void;
	showBackPage: (moveType : MoveOptions) => void;
}

function MainPage({ avatar, setChoice, showBackPage }: MainPageProps) {
	const [firstPage, setFirstPage] = useState(false);
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<BaseOptions trove={trove} avatar={avatar} setChoice={setChoice} showBackPage={showBackPage} />
			<textbutton
				Text={firstPage ? "Base Options" : "Special Options"}
				Size={UDim2.fromScale(1, 1 / 2)}
				Position={new UDim2(0, 0, 2 / 3, 15)}
				Event={{
					Activated: () => {
						setFirstPage(!firstPage);
					},
				}}
			/>
		</frame>
	);
}

interface BackPageProps {
	onClick: () => any;
	onConfirmClick: () => any;
	canConfirm: Binding<boolean>;
}

function BackPage({ onClick, canConfirm, onConfirmClick }: BackPageProps) {
	const confirm_color = canConfirm.map((v) => (v ? Color3.fromRGB(13, 232, 41) : Color3.fromRGB(237, 13, 13)));
	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<textbutton
				BackgroundColor3={new Color3(1, 1, 1)}
				TextScaled={true}
				Size={UDim2.fromScale(0.5, 1)}
				Text={"BACK"}
				Event={{
					Activated: onClick,
				}}
			></textbutton>
			<textbutton
				BackgroundColor3={confirm_color}
				TextScaled={true}
				Position={UDim2.fromScale(0.5, 0)}
				Size={UDim2.fromScale(0.5, 1)}
				Text={"CONFIRM"}
				Active={canConfirm}
				Event={{
					Activated: onConfirmClick,
				}}
			></textbutton>
		</frame>
	);
}

let output: any;
let move_type: MoveOptions;

export function AvatarUI() {
	const [visible, _setVisible] = useState(false);
	const [visiblePage, _setVisiblePage] = useState(Page.Primary);
	const [avatar, setAvatar] = useState<AvatarClass | undefined>(undefined);
	const [canConfirm, setCanConfirm] = useBinding(false);

	function setVisible(is_visible: boolean) {
		_setVisible(is_visible);
		if (!is_visible) {
			setVisiblePage(Page.Primary);
		}
	}

	function setVisiblePage(new_page: Page) {
		if (new_page === Page.Primary) {
			setCanConfirm(false);
			task.defer(() => {
				trove.clean();
			});
		}
		_setVisiblePage(new_page);
	}

	function onAvatarPassed(currently_selected: boolean, avatar: AvatarClass | undefined) {
		setVisible(currently_selected);
		setAvatar(avatar);
	}
	useEventListener(remotes.avatar_selected, onAvatarPassed);

	function onBackPageClick() {
		setVisiblePage(Page.Primary);
	}

	function onConfirmClick() {
		setVisible(false);
		switch (move_type) {
			case "Attack":
				remotes.avatar_option_selected(move_type,output);
				break;
			case "Move":
				remotes.avatar_option_selected(move_type,output);
				break;
			case "Rest":
				remotes.avatar_option_selected(move_type);
				break;
			case "Boulder":
				remotes.avatar_option_selected(move_type,output);
		}
	}

	if (!visible) {
		return <></>;
	}

	function onChoice(selection: any, CanConfirm: boolean) {
		setCanConfirm(CanConfirm);
		output = selection;
	}

	function pageRender(page: Page) {
		switch (page) {
			case Page.Primary:
				return (
					<MainPage
						avatar={avatar!}
						setChoice={onChoice}
						showBackPage={(moveType: MoveOptions) => {
							move_type = moveType;
							setVisiblePage(Page.Back);
						}}
					/>
				);
			case Page.Back:
				return <BackPage onClick={onBackPageClick} canConfirm={canConfirm} onConfirmClick={onConfirmClick} />;
		}
	}

	return (
		<frame
			Position={UDim2.fromScale(0.5, 0.9)}
			AnchorPoint={new Vector2(0.5, 1)}
			Size={UDim2.fromScale(0.7, 0.15)}
			BackgroundTransparency={1}
		>
			{pageRender(visiblePage)}
		</frame>
	);
}
