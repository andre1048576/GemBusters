import React, { StrictMode, useState } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players, VoiceChatService } from "@rbxts/services";
import { AvatarUI } from "./components/avatar";
import { remotes } from "shared/remotes";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");



root.render(<StrictMode>{createPortal(<AvatarUI/>, target)}</StrictMode>);
