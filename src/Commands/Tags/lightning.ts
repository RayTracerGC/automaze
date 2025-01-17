import { ColorResolvable } from 'discord.js';
import { EmbedData } from '../../Interfaces/BotData';
import { PrefixCommand } from '../../Interfaces/Command';
import {
    getLanguageByChannelId,
    getResourceData,
    resourcesToUnorderedList,
    TagResponseSender,
} from '../../Utils/botUtilities';
import i18next from '../../i18n';
import { createEmbed } from '../../Utils/discordUtilities';

const Lightning: PrefixCommand = {
    name: 'light',
    description: 'Links to relevant lightning.ai stuff!',
    aliases: ['lightning', 'lightningai'],
    async run(client, message) {
        const { botCache, logger } = client;

        const resources = await getResourceData('lightning_ai', botCache, logger);

        const language = getLanguageByChannelId(message.channelId);

        if (resources.length === 0) {
            await message.reply({ content: i18next.t('general.not_available', { lng: language }) });
            return;
        }

        const content: EmbedData[] = [
            {
                title: i18next.t('tags.lightning.embed.title'),
                color: 'b45aff' as ColorResolvable,
                description: [resourcesToUnorderedList(resources, language)],
                footer: i18next.t('tags.lightning.embed.footer', { lng: language }),
            },
        ];

        const embeds = content.map((item) => createEmbed(item, item.color));

        const sender = new TagResponseSender(client);
        sender.setEmbeds(embeds);
        sender.config(message);
        await sender.send();
    },
};

export default Lightning;
