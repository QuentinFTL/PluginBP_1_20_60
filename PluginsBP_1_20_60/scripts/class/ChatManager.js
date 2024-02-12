import { world, system } from "@minecraft/server";


export class ChatManager {
    static Init() {
        if (system.chatMgr == null) {
            world.sendMessage("Creating manager...");
            system.chatMgr = new ChatManager();
            world.sendMessage("Manager created!");

        }
        else {
            world.sendMessage("Getting existing manager");

        }

        return system.chatMgr;
    }
    constructor(){
        this.beforeChatSendEvents = [];
        this.afterChatSendEvents = [];
        this.chatOverride = null;

    }

    register(event, state = -1) {
        if(state < 0) {
            this.beforeChatSendEvents.push(event);
        }
        else if(state > 0)
        {
            this.afterChatSendEvents.push(event);
        }
        else
        {
            this.chatOverride = event;
        }
    } 

    end(){
        world.beforeEvents.chatSend.subscribe( arg => {
            for (let i = 0; i < this.beforeChatSendEvents.length; i++) {
                const event = this.beforeChatSendEvents[i];
                let rVal = event(arg);

                console.log(rVal);
                if(rVal === true) return;
            }
            if(this.chatOverride != null) {
                arg.cancel = true;
                this.chatOverride(arg);
            }
        })
        

        world.afterEvents.chatSend.subscribe( arg => {
            for (let i = 0; i < this.afterChatSendEvents.length; i++) {
                const event = this.afterChatSendEvents[i];
                let rVal = event(arg);

                console.log(rVal);
                if(rVal === true) return;
            }
        })
    }
}