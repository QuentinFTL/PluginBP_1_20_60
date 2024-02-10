import { Player, system, world } from "@minecraft/server"; 
import { Color } from "./MinecraftConst";

export class Plugin {
    constructor() {
        this.name = this.constructor.name;
    }

    add_user_array() {
        this.uArray = {};
    }

    set_user_array(name, user, value) {
        this.uArray[name + user] = value;
    }

    get_user_array(name, user) {
        return this.uArray[name + user] ?? null;
    }

    load(pluginPrefix = "") {
        if(pluginPrefix != "") {
            world.sendMessage(pluginPrefix + ": Loading plugin...");
        }
        else
        {
            world.sendMessage("Loading plugin...");
        }
    }

    start(pluginPrefix = "") {
        if(pluginPrefix != "") {
            world.sendMessage(pluginPrefix + ": Plugin Started !");
        }
        else
        {
            world.sendMessage("Plugin Started !");
        }
    }

    stop() {

    }

    reload() {

    }

    pause() {

    }

    commands(plugin, json_) {

        system.pluginMgr.commandManager.addJson(json_, plugin);
    }

    deps(deps_) {
        let misses = [];
        let shouldStop = false;
        for (let i = 0; i < deps_.length; i++) {
            const dependency = {
                name: deps_[i][0],
                stop: deps_[i][1]
            };

            if(globalThis[dependency.name] === undefined) {
                misses.push((dependency.stop ? Color.RED : Color.YELLOW) + dependency.name);

                if(dependency.stop == true) {
                    shouldStop = true;
                }
            }

            
        }
        if(misses.length > 0) {
            this.missingDependencies(shouldStop, misses);
        }
    }

    missingDependencies(shouldStop, deps) {
        if(typeof deps == "object") {
            let deps_ = "";

            for (let i = 0; i < deps.length; i++) {
                const dep = deps[i];
                deps_ += "\n    - "+dep;
            }


            world.sendMessage(Color.RED + this.name + " need "+deps.length+" missing dependenc"+(deps.length > 1 ? "ies": "y")+": "+ deps_);

            if(shouldStop) {
                system.pluginMgr.removePlugin(this.name);
            }
        }
        else
        {
            this.missingDependencies(shouldStop, [deps]);
        }
    }
}