import { Color } from "../../class/MinecraftConst";
import { Plugin } from "../../class/Plugin";
import { ItemStack, Player, World, system, world } from "@minecraft/server";

export default class WorldEdit extends Plugin {
    static instance = null;
    constructor() {
        super();
        
        super.add_user_array();
        this.wand = "minecraft:wooden_axe";
        this.itemUseOn = null;
        this.playerBreakBlock = null;

        WorldEdit.instance = this;
    }

    load() {

        super.deps([ 
            ["Permission", true],
            ["CorePlugin", false] 
        ]);

        super.load(`${Color.WHITE}[${Color.MINECOIN_GOLD}WorldEdit${Color.WHITE}]`);

    }

    start() {

        super.start(`${Color.WHITE}[${Color.MINECOIN_GOLD}WorldEdit${Color.WHITE}]`);

        for (let i = 0; i < world.getAllPlayers().length; i++) {
            const player = world.getAllPlayers()[i];
            
            this.toggleOnWand(player);
        }

    }

    commands() {

        super.commands("worldedit", {
            commands: [
                {
                    key: "wand",
                    params: "",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "Summons the selection wand to your hand.",
                    call: "WorldEdit.wand(sender)"
                },
                {
                    key: "toggleeditwand",
                    params: "",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "Either disable or enable the Worldedit functionality of the Worldedit wand (The Minecraft Wooden Axe is set as the default wand).",
                    call: "WorldEdit.toggleeditwand(sender)"
                },
                {
                    key: "set",
                    params: "<pattern: string>",
                    tip: "Please type '{prefix}{key} {params}' to use correctly the commands",
                    help: "Set all blocks from the region to a pattern.",
                    call: "WorldEdit.set(sender, <pattern>)"
                }
                //
            ],
            registers: [
                WorldEdit
            ]
        })
    }

    toggleOnWand(sender) {

        let itemUseOn = world.beforeEvents.itemUseOn.subscribe((arg) => {
            if(!Permission.has(arg.source, ["Admin", "SuperAdmin", "Moderator"])) return;
            if(super.get_user_array("world_edit_wand_active", arg.source.id) == false) return;

            let block = arg.block;
            if (arg.itemStack.typeId != this.wand) {
                return;
            }

            arg.cancel = true;

            if (!this.sameLocation(super.get_user_array("world_edit_second_sel", arg.source.id), block.location)) {
                super.set_user_array("world_edit_second_sel", arg.source.id, block.location);


                let nBlocks = "";
                if (super.get_user_array("world_edit_first_sel", arg.source.id) != null) {
                    let a = super.get_user_array("world_edit_first_sel", arg.source.id);
                    let b = super.get_user_array("world_edit_second_sel", arg.source.id);
                    nBlocks = (this.distance(a.x, b.x) * this.distance(a.y, b.y) * this.distance(a.z, b.z));
                    super.set_user_array("world_edit_block_count", arg.source.id, nBlocks);

                    nBlocks = ` (${nBlocks})`;
                }
                arg.source.sendMessage(`${Color.LIGHT_PURPLE} Second position set to (${block.location.x}, ${block.location.y}, ${block.location.z})${nBlocks}.`);
            }
        });

        let playerBreakBlock = world.beforeEvents.playerBreakBlock.subscribe((arg) => {
            if(!Permission.has(arg.player, ["Admin", "SuperAdmin", "Moderator"])) return;
            if(super.get_user_array("world_edit_wand_active", arg.player.id) == false) return;

            let block = arg.block;
            if (arg.itemStack.typeId != this.wand) {
                return;
            }
            arg.cancel = true;

            if (!this.sameLocation(super.get_user_array("world_edit_first_sel", arg.player.id), block.location)) {
                super.set_user_array("world_edit_first_sel", arg.player.id, block.location);

                let nBlocks = "";
                if (super.get_user_array("world_edit_second_sel", arg.player.id) != null) {
                    let a = super.get_user_array("world_edit_first_sel", arg.player.id);
                    let b = super.get_user_array("world_edit_second_sel", arg.player.id);
                    nBlocks = (this.distance(a.x, b.x) * this.distance(a.y, b.y) * this.distance(a.z, b.z));
                    nBlocks = ` (${nBlocks})`;
                }


                arg.player.sendMessage(`${Color.LIGHT_PURPLE} First position set to (${block.location.x}, ${block.location.y}, ${block.location.z})${nBlocks}.`);
            }
        });

        super.set_user_array("world_edit_second_sel_cb", sender.id, itemUseOn);
        super.set_user_array("world_edit_first_sel_cb", sender.id, playerBreakBlock);

        super.set_user_array("world_edit_wand_active", sender.id, true);


        if (sender != null) {
            sender.sendMessage(`${Color.WHITE}[${Color.MINECOIN_GOLD}WorldEdit${Color.WHITE}]: (${sender.name}) Toggle wand: ${Color.GREEN}true.`);
        }
    }

    toggleOffWand(sender) {

        world.beforeEvents.itemUseOn.unsubscribe(super.get_user_array("world_edit_second_sel_cb", sender.id));
        world.beforeEvents.playerBreakBlock.unsubscribe(super.get_user_array("world_edit_first_sel_cb", sender.id));

        super.set_user_array("world_edit_second_sel_cb", sender.id, null);
        super.set_user_array("world_edit_first_sel_cb", sender.id, null);

        super.set_user_array("world_edit_wand_active", sender.id, false);

        if (sender != null) {
            sender.sendMessage(`${Color.WHITE}[${Color.MINECOIN_GOLD}WorldEdit${Color.WHITE}]: (${sender.name}) Toggle wand: ${Color.RED}false.`);
        }
    }

    set(sender, pattern) {
        if(!Permission.has(sender, ["SuperAdmin", "Admin", "Moderator"])) return;

        let a = super.get_user_array("world_edit_first_sel", sender.id);
        let b = super.get_user_array("world_edit_second_sel", sender.id);

        let _x = [a.x, b.x];
        let _y = [a.y, b.y];
        let _z = [a.z, b.z];

        if (_x[0] < _x[1]) {
            _x = [b.x, a.x];
        }

        if (_y[0] < _y[1]) {
            _y = [b.y, a.y];
        }

        if (_z[0] < _z[1]) {
            _z = [b.z, a.z];
        }

        let count = super.get_user_array("world_edit_block_count", sender.id);
        let cnt = 0;
        if (count < 32768) {

            system.run(() => {
                sender.dimension.fillBlocks(a, b, pattern);
            });
        }
        else if (count < (32768 * 5)) {


            for (let x = _x[1]; x < _x[0]; x++) {
                for (let y = _y[1]; y < _y[0]; y++) {
                    for (let z = _z[1]; z < _z[0]; z++) {
                        
                        //cnt++;
                        
                        //sender.sendMessage(`${count} block lefts.`);
                        system.run(() => {
                            sender.dimension.fillBlocks({ x: x, y: y, z: z }, { x: x, y: y, z: z }, pattern);
                        });
                    }
                }
            }
        }
    }

    sameLocation(a, b) {
        if (a == null || b == null) return false;
        return (a.x == b.x && a.y == b.y && a.z == b.z);
    }

    distance(a, b) {
        let c;
        if (b > a) {
            c = b - a;
        }
        else {
            c = a - b;
        }

        return c + 1;
    }

    //Commands Methods
    static wand(sender) {
        if(!Permission.has(sender, ["SuperAdmin", "Admin", "Moderator"])) return;

        system.run(() => {
            let item = new ItemStack(WorldEdit.instance.wand);
            item.nameTag = "World Edit Wand";
            item.setLore([
                "Right click to select the first location",
                "Left click to select the second location"
            ])
            sender.getComponent("inventory").container.addItem(item);
        })
    }

    static toggleeditwand(sender) {
        if (WorldEdit.instance.get_user_array("world_edit_second_sel_cb", sender.id) == null || WorldEdit.instance.get_user_array("world_edit_first_sel_cb", sender.id) == null) {
            system.run(() => {

                // WorldEdit.instance.toggleOffWand(sender);
                WorldEdit.instance.toggleOnWand(sender);
            });
        }
        else {
            system.run(() => {

                WorldEdit.instance.toggleOffWand(sender);
            });
        }
    }

    static set(sender, pattern) {
        WorldEdit.instance.set(sender, pattern);
    }

}

