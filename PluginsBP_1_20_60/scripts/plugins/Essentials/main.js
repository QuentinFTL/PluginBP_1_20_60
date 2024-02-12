import { Color } from "../../class/MinecraftConst";
import { Plugin } from "../../class/Plugin";
import { Player, system, world, TicksPerSecond, TicksPerDay } from "@minecraft/server";
import { ChestFormData } from "../../extensions/forms";


export default class Essentials extends Plugin {
    constructor() {
        super();

    }

    start() {
        super.start(`${Color.WHITE}[${Color.MINECOIN_GOLD}Essentials${Color.WHITE}]`);
    }

    commands() {

        super.commands("essentials", {
            commands: [
                {
                    key: "invsee",
                    params: "<player: string>",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "See a player inventory.",
                    call: "Essentials.seeinv(sender, <player>)"
                },
                {
                    key: "sethome",
                    params: "[home: string]",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "Set a new home.",
                    call: "Essentials.sethome(sender, [home])"
                },
                {
                    key: "home",
                    params: "[home: string]",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "Tp to an existing home.",
                    call: "Essentials.home(sender, [home])"
                }

            ],
            registers: [
                Essentials
            ]
        })
    }

    static getHomes(sender) {
        let tags = sender.getTags();

        let hTags = [];

        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            if(tag.startsWith("home-")) {
                hTags.push(tag);
            }
        }

        return hTags;

    }

    static sethome(sender, home = "") {
        //code
        let cHomes = Essentials.getHomes(sender);
        let exists = null;
        console.log("home: "+ home);

        for (let i = 0; i < cHomes.length; i++) {
            const cHome = cHomes[i];
            console.log("home: "+ cHome.startsWith("home-"+home));

            if(cHome.startsWith("home-"+home)) {
                exists = cHome;
            }
        }

        console.log("cHomes.length: "+ cHomes.length);

        if(cHomes.length > 3) {
            sender.sendMessage(Color.RED + "You can't have more than 3 homes, please do !unset <home> to free a space.");
            return;
        }

        console.log("exists: "+ exists);

        if(exists != null) {
            sender.removeTag(exists);
        }
        system.run(() => {

            sender.addTag("home-"+home+":"+JSON.stringify( {
                x: sender.location.x.toFixed(),
                y: sender.location.y.toFixed(),
                z: sender.location.z.toFixed()
            }));
        });



    }

    static home(sender, home = "") {
        //code
        if(home.includes(":")) {
            sender.sendMessage(Color.RED + "Home label can't contains ':'.");
            return;
        }

        let cHomes = Essentials.getHomes(sender);
        let exists = null;

        for (let i = 0; i < cHomes.length; i++) {
            const cHome = cHomes[i];
            if(cHome.startsWith("home-"+home)) {
                exists = cHome;
            }
        }


        if(exists != null) {
            let json = exists.replace(exists.split(':')[0]+":", "").trim();
            console.log("exists: "+ exists);
            console.log("json: "+ json);

            let location = JSON.parse(json);
            let playerLocation = sender.location;
            sender.sendMessage(Color.RED + "Teleportation in 3 seconds... Don't move or your teleportation will be canceled.");
            system.runTimeout( () => {
                let sPlayerLocation = sender.location;

                if(playerLocation.x != sPlayerLocation.x || playerLocation.y != sPlayerLocation.y || playerLocation.z != sPlayerLocation.z) {
                    sender.sendMessage(Color.RED + "Teleportation cancelled.");
                }
                else
                {
                    sender.teleport({
                        x: parseInt(location.x),
                        y: parseInt(location.y),
                        z: parseInt(location.z)});
                    sender.sendMessage(Color.GREEN + "You have been teleported to home '" + home +"'.");
                }

            }, 3 * TicksPerSecond);
            

        }

    }

    static seeinv(sender, player) {
        sender.sendMessage(Color.AQUA + "You have 3 seconds to leave the chat to see the inventory.");



        system.runTimeout(() => {


            player = system.pluginMgr.getPlayerByName(player);
            console.log("player: " + JSON.stringify(player));


            const form = new ChestFormData();
            form.title = `${player}'s inventory`;

            let container = player.getComponent("inventory").container;


            for (let i = 0; i < (9 * 4); i++) {
                const itemStack = container.getItem(i);
                if (itemStack == undefined) continue;
                console.log("itemStack: " + JSON.stringify(itemStack));

                form.button(i, Essentials.Translate(itemStack.typeId), itemStack.getLore(), itemStack.typeId, itemStack.amount);

            }

            form.show(sender);

        }, TicksPerSecond * 3);

    }
    static Translate(typeId) {
        switch (typeId) {
            case "minecraft:sand":
                return "Sand";

            case "minecraft:stone":
                return "Stone";
            case "minecraft:sandstone":
                return "Sandstone";
            case "minecraft:cobblestone":
                return "Cobblestone";
            case "minecraft:glass":
                return "Glass";
            case "minecraft:grass":
                return "Grass";
            case "minecraft:dirt":
                return "Dirt";

            default:
                return typeId;
        }
    }
}