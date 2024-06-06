import { ChatInputCommandInteraction, ContextMenuCommandBuilder, InteractionResponse, Message, UserContextMenuCommandInteraction } from "discord.js";
import ExtendedClient from "../Core/extendedClient";

export interface SlashCommand {
    category: string;
    type: string;
    data: any;
    cooldown?: number,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ContextCommand {
    category: string;
    type: string;
    data: ContextMenuCommandBuilder;
    execute: (interaction: UserContextMenuCommandInteraction) => Promise<InteractionResponse<boolean> | undefined | void>;
}

export interface PrefixCommand {
    name: string,
    category: string,
    description: string,
    aliases: string[],
    syntax: string,
    run: (client: ExtendedClient, message: Message, args?: string[], prefix?: string) => Promise<any>;
}