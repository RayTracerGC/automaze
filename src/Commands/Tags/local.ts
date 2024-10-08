import { EmbedData } from '../../Interfaces/BotData';
import { PrefixCommand } from '../../Interfaces/Command';
import { TagResponseSender } from '../../Utils/botUtilities';

function getLastArrayIndex(array: Array<any>): number {
    return array.length - 1;
}

function editEmbedDescription(embed: EmbedData): void {
    if (!embed.description) return;
    const lastArrayIndex = getLastArrayIndex(embed.description);
    const lastDescription = embed.description[lastArrayIndex];
    embed.description[lastArrayIndex] = lastDescription
        .replace('$antasma', '[Antasma](https://discordapp.com/users/1037338320960761998)')
        .replace('$fazemasta', '[Faze Masta](https://discordapp.com/users/622856015444049937)');
}

const Local: PrefixCommand = {
    name: 'local',
    category: 'Tags',
    description: 'Links to all working local forks',
    aliases: ['applio', 'mangio', 'studio', 'links'],
    syntax: `local [member]`,
    async run(client, message) {
        const { botData } = client;
        const content = botData.embeds.local.en;

        if (!content.embeds) {
            client.logger.error(`Missing embed data for -${this.name}`);
            return;
        }

        editEmbedDescription(content.embeds[0]);

        const sender = new TagResponseSender(client);
        sender.setEmbeds(content.embeds);
        sender.config(message);
        await sender.send();
    },
};

export default Local;
