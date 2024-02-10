import { Color } from "../../class/MinecraftConst";
import { Plugin } from "../../class/Plugin";
import { Player, system, world } from "@minecraft/server";


export default class CorePlugin extends Plugin {
    constructor() {
        super();

    }

    start() {
        super.start(`${Color.WHITE}[${Color.MINECOIN_GOLD}CorePlugin${Color.WHITE}]`);
    }

    commands() {

        super.commands("core", {
            commands: [
                {
                    key: "plugin",
                    params: "",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    call: "CorePlugin.pl(sender)"
                },
                {
                    key: "help",
                    params: "[page: number] [plugin: string]",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    call: "CorePlugin.help(sender, [page], [plugin])"
                },
                {
                    key: "clear",
                    params: "",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    call: "CorePlugin.clear()"
                }
            ],
            registers: [
                CorePlugin
            ]
        })
    }

    static pl(sender) {
        system.pluginMgr.showPlugins(sender);       
    }

    static help(sender, page, plugin) {
        system.pluginMgr.showHelp(sender, page == "" ? 1 : page, plugin == "" ? null : plugin);       
    }

    static clear() {
        let msg = "";
        for (let i = 0; i < 512; i++) {
            msg += "\n";
            
        }
        world.sendMessage(msg);
    }
}