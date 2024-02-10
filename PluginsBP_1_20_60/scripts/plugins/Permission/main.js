import { Color } from "../../class/MinecraftConst";
import { Plugin } from "../../class/Plugin";
import { Player, system, world } from "@minecraft/server";
import permissions from "./permissions";


export default class Permission extends Plugin {
    static grades = permissions;
    constructor() {
        super();

    }

    start() {
        super.start(`${Color.WHITE}[${Color.MINECOIN_GOLD}Permission${Color.WHITE}]`);
    }

    load() {
        super.load(`${Color.WHITE}[${Color.MINECOIN_GOLD}Permission${Color.WHITE}]`);



    }

    commands() {

        super.commands("perm", {
            commands: [
                {
                    key: "perm:give",
                    params: "<player: string> <perm: string>",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    call: "Permission.give(sender, <player>, <perm>)"
                },
                {
                    key: "perm:get",
                    params: "<player: string>",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    call: "Permission.getCmd(sender, <player>)"
                }
            ],
            registers: [
                Permission
            ]
        })
    }

    static give(sender, name, perm) {

        let player = system.pluginMgr.getPlayerByName(name);
        player.sendMessage(sender.name + " give you the permission: " + perm);
        sender.sendMessage(player.name + " has now the permission: " + perm);

        if (sender.isOp() || Permission.canGivePermission(sender, perm)) {
            Permission.set(player, perm);
        }
    }

    static getCmd(sender, name) {

        let player = system.pluginMgr.getPlayerByName(name);
        if (true) {
            sender.sendMessage(player.name + " permissions is: " + Permission.get(name));
        }
    }

    static canGivePermission(sender, perm = null) {
        if (Permission.get(sender).permissions == null) return false;
        if (perm != null) if (Permission.get(sender).permissions.includes(perm)) return true;
        if (sender.isOp()) return true;
        return false;
    }

    static get(player) {
        if (typeof player == "string") {
            player = system.pluginMgr.getPlayerByName(player);
        }
        let tags = player.getTags();

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if (tag.startsWith("permission:")) {
                return tag.replace("permission:", "");
            }
        }
    }

    static set(player, perm) {
        if (typeof player == "string") {
            player = system.pluginMgr.getPlayerByName(player);
        }

        if (Permission.has(player)) {
            Permission.unset(player);
        }
        if (Permission.includes(perm)) {
            system.run(() => {

                player.addTag("permission:" + perm);
            });
        }
        else {
            player.sendMessage(Color.RED + "Can't set permission'" + perm + "', not registered.");
        }
    }

    static includes(perm) {
        for (let i = 0; i < Permission.grades.length; i++) {
            const p = Permission.grades[i];
            if (p.name == perm) return true;
        }

        return false;
    }

    static unset(player) {
        if (typeof player == "string") {
            player = system.pluginMgr.getPlayerByName(player);
        }

        let tags = player.getTags();

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if (tag.startsWith("permission:")) {
                system.run(() => {
                    player.removeTag(tag);
                });
            }
        }

        //return false;

    }

    static has(player, permission = "") {
        if (typeof player == "string") {
            player = system.pluginMgr.getPlayerByName(player);
        }

        if (permission == "") {
            let tags = player.getTags();

            for (let i = 0; i < tags.length; i++) {
                const tag = tags[i];
                if (tag.startsWith("permission:")) {
                    return true;
                }
            }

            return false;
        }

        if (typeof permission == "object") {
            for (let i = 0; i < permission.length; i++) {
                const perm = permission[i];
                if(player.hasTag("permission:" + perm)) return true;
            }
        }

        return player.hasTag("permission:" + permission);
    }

}
