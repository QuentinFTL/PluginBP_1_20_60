import { world, system } from "@minecraft/server";
import { PluginManager } from "./class/PluginManager";
import { Color } from "./class/MinecraftConst";
import { Permission } from "./imports";
console.log = console.warn;
PluginManager.Init();

system.chatMgr.register(function(arg) {
    let newMsg = `${Color.WHITE}[${Color.YELLOW}${Permission.get(arg.sender)}${Color.WHITE}] ${arg.sender.name} - ${arg.message}`;

    world.sendMessage(newMsg);
}, 0);