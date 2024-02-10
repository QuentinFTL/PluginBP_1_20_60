import { system, world } from "@minecraft/server";
import { CommandManager } from "./CommandManager.js";
import { Color } from "./MinecraftConst.js";
import plugins from "../plugins.js";


export let dynamicProperties = {};

export class PluginManager {

    static Init() {
        if (system.pluginMgr == null) {
            system.pluginMgr = new PluginManager();
        }

        system.pluginMgr.__init()

        return system.pluginMgr;
    }

    constructor() {
        this.plugins = [];
        this.plugins_num = -1;
        this.commandManager = CommandManager.Init();
    }

    __init() {
        if (this.plugins_num == -1) {
            this.plugins_num = Object.keys(plugins).length;
        }

        for (let i = 0; i < Object.keys(plugins).length; i++) {
            const key = Object.keys(plugins)[i];
            const element = plugins[key];

            if (element.enabled != false) {
                this.loadPlugin(element);
            }
            else {
                this.plugins_num--;
                if (this.plugins_num == 0) {
                    this.runPlugins();
                }
            }
        }
    }

    runPlugins() {
        this.registerCommands();
        this.startPlugins();


        this.commandManager.end();
    }

    registerCommands() {
        for (let i = 0; i < this.plugins.length; i++) {
            const plugin = this.plugins[i];
            plugin.obj.commands();
        }
    }

    startPlugins() {
        for (let i = 0; i < this.plugins.length; i++) {
            const plugin = this.plugins[i];
            plugin.obj.start();
        }
    }

    getPlayerByName(name) {
        let players = world.getAllPlayers();

        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            //console.warn(JSON.stringify(player));
            if (player.name == name) {
                return player;
            }
        }


        return null;
    }

    removePlugin(plugin) {
        for (let i = 0; i < this.plugins.length; i++) {
            const element = this.plugins[i];
            if (element.name.trim() == plugin.trim()) {
                this.plugins.splice(i, 1);
                world.sendMessage(Color.RED + "Unloading plugin '" + element.name + "'");
            }
        }
    }

    enablePlugin(plugin) {
        let fount = false;

        for (let i = 0; i < this.plugins.length; i++) {
            const element = this.plugins[i];
            console.warn(element.name + ": " + plugin);
            if (element.name.trim().toLowerCase() == plugin.trim().toLowerCase()) {
                this.plugins[i].enabled = true;
                fount = true;

                this.plugins[i].obj.onEnable();
                world.sendMessage(Color.GREEN + "Enabled plugin '" + element.name + "'");
            }
        }

        return fount;
    }

    disablePlugin(plugin) {
        let fount = false;
        for (let i = 0; i < this.plugins.length; i++) {
            const element = this.plugins[i];
            console.warn(element.name + ": " + plugin);

            if (element.name.trim().toLowerCase() == plugin.trim().toLowerCase()) {
                this.plugins[i].enabled = false;

                this.plugins[i].obj.onDisable();
                fount = true;
                world.sendMessage(Color.RED + "Disabled plugin '" + element.name + "'");
            }
        }

        return fount;
    }

    disableDependencies(plugin) {
        let _plugins = [];
        for (let i = 0; i < this.plugins.length; i++) {
            const element = this.plugins[i];
            if (element.name.trim().toLowerCase() != plugin.trim().toLowerCase()) {
                _plugins.push([element.name, element.obj.dependencies]);
            }
        }

        for (let i = 0; i < _plugins.length; i++) {
            const element = _plugins[i];
            const pluginName = element[0];
            const pluginDeps = element[1];
            if (pluginDeps != undefined) {

                for (let i = 0; i < pluginDeps.length; i++) {
                    const dependency = pluginDeps[i][0];
                    console.warn("dependency: " + dependency + ": " + plugin + ": " + pluginName);
                    if (dependency.toLowerCase() == plugin.toLowerCase()) {
                        this.disablePlugin(pluginName);
                        //world.sendMessage(Color.RED + dependency + " is missing, be sure this plugin is installed on imports.js !");
                    }
                }
            }
        }

    }

    enableDependencies(plugin) {
        let dependencies = [];

        for (let i = 0; i < this.plugins.length; i++) {
            const element = this.plugins[i];
            if (element.name.trim().toLowerCase() == plugin.trim().toLowerCase()) {
                dependencies = element.obj.dependencies;
                break;
            }
        }
        if (dependencies != undefined) {
            for (let i = 0; i < dependencies.length; i++) {
                const dependency = dependencies[i][0];
                console.warn("dependency: " + dependency);
                if (!this.enablePlugin(dependency)) {
                    this.disablePlugin(plugin);
                    world.sendMessage(Color.RED + dependency + " is missing, be sure this plugin is installed on imports.js !");
                }
            }

        }
    }

    loadPlugin(plugin) {
        let mgr = this;


        let v;
        eval("v = new " + plugin.name + "()");

        mgr.plugins.push({ enabled: true, name: plugin.name, path: plugin.path, obj: v });
        v.load();

        this.plugins_num--;
        if (this.plugins_num == 0) {
            this.runPlugins();
        }
    }

    showPlugins(sender) {
        let msg = "";
        let count = 0;
        for (let i = 0; i < this.plugins.length; i++) {
            const plugin = this.plugins[i];
            if (i == this.plugins.length - 1) {
                msg += `${(plugin.enabled ? Color.GREEN : Color.RED) + plugin.name}`;

            }
            else {
                msg += `${(plugin.enabled ? Color.GREEN : Color.RED) + plugin.name}, `;
            }

            if (plugin.enabled) {
                count++;
            }


        }
        msg = `${Color.WHITE}[${Color.GREEN}Plugins${Color.WHITE}] (${Color.YELLOW}${count}${Color.WHITE}): ${msg}`;

        sender.sendMessage(msg);
    }

    showHelp(sender, page_ = null, plugin_ = null) {
        let elements_by_page = 7;
        let page = 1;
        let plugin = plugin_;

        if (page_ != null) {

            try {
                page = parseInt(page_);
            }
            catch {

            }
        }

        let maxPage = (Object.keys(this.commandManager.active_commands).length / elements_by_page).toFixed(0);
        if (Object.keys(this.commandManager.active_commands).length - (elements_by_page * maxPage) > 0) {
            maxPage = parseInt(maxPage) + 1;
        }

        //check page opt later

        //check page...

        //this.commands[cmd.command].help

        //0 -> 6
        //7 -> 13
        //14 -> 20
        //console.warn("page", page, typeof page_opt);
        if (page <= 0) {
            sender.sendMessage(`${Color.RED}Page ${page} is less than 1.`);

            return;
        }
        if (page > maxPage) {
            sender.sendMessage(`${Color.RED}Page ${page} is higher than ${maxPage}.`);

            return;
        }
        let msg = (`${Color.WHITE}[${Color.MINECOIN_GOLD}HELP${Color.WHITE}]: Page (${page}/${maxPage})`);

        let count = (elements_by_page * page);



        for (let i = 0; i < Object.keys(this.commandManager.active_commands).sort().length; i++) {
            const key = Object.keys(this.commandManager.active_commands).sort()[i];
            const element = this.commandManager.active_commands[key];

            if (plugin == null) {

                if (
                    i >= (elements_by_page * (page - 1)) && i < elements_by_page * (page)
                ) {
                    //Add msg
                    msg += `\n${Color.GOLD + key + Color.WHITE}: ${this.commandManager.active_commands[key].help ?? this.commandManager.active_commands[key].tip}`;
                }
            }
            else {
                if (element.plugin == plugin) {
                    count--;
                    if (count < elements_by_page) {
                        if (count > -elements_by_page) {
                            msg += `\n${Color.GOLD + key + Color.WHITE}: ${this.commandManager.active_commands[key].help ?? this.commandManager.active_commands[key].tip}`;
                        }

                    }
                }
            }




        }
        sender.sendMessage(msg);




    }
}