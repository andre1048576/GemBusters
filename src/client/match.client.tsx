import React, { StrictMode, useState } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players, VoiceChatService } from "@rbxts/services";
import { MatchRoot } from "./components/match_root";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");



root.render(<StrictMode>{createPortal(<MatchRoot/>, target)}</StrictMode>);
