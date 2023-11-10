const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const delay = require('node:timers/promises').setTimeout;

module.exports = {
    category: 'Utilities',
    cooldown: 15,
    type: 'slash',
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send something to a guild channel')
        .addStringOption(option =>
            option
                .setName('options')
                .setDescription('Choose an option to send')
                .setRequired(true)
                .addChoices(
                    { name: 'text', value: 'text' },
                    { name: 'reply', value: 'reply' },
                    { name: 'emoji', value: 'emoji' },
                    { name: 'embed', value: 'embed' },
                    { name: 'sticker', value: 'sticker' },
                )
        )
        .addStringOption(option => option
            .setName('guild_id')
            .setDescription('Guild ID (Defaults to guild in config)')
        )
        .addStringOption(option => option
            .setName('channel_id')
            .setDescription('Channel ID (Defaults to bot-spam)')
        )
        .addStringOption(option => option
            .setName('message_id')
            .setDescription('Message ID')
        )
        .addStringOption(option => option
            .setName('text')
            .setDescription('Text to send')
        )
        .addStringOption(option => option
            .setName('icon_id')
            .setDescription('Emoji or sticker ID')
        )
    ,
    async execute(interaction) {
        //await interaction.deferReply({ ephemeral: true });

        const client = interaction.client;

        if (!client.botAdminIds || !client.botAdminIds.includes(interaction.user.id)) {
            return await editReply.reply({ content: 'You can\'t use this command', ephemeral: true });
        }

        const guildId = interaction.options.getString('guild_id') ?? client.discordIDs.Guild;
        const channelId = interaction.options.getString('channel_id') ?? client.discordIDs.Channel.BotSpam;
        const messageId = interaction.options.getString('message_id');
        const text = interaction.options.getString('text');
        const iconId = interaction.options.getString('icon_id');

        const selectedOption = interaction.options.getString('options');

        const botResponse = { ephemeral: true };

        try {
            const guild = client.guilds.cache.get(guildId);

            let channel = guild.channels.cache.get(channelId);

            if (!channel) {
                console.log('Channel not found in cache. Fetching...');
                channel = await guild.channels.fetch(channelId);
            }

            let message;

            // 300 ms per letter
            const typingDuration = 300;

            switch (selectedOption) {
                case 'text':
                    if (!text) {
                        botResponse.content = 'Empty text...Skipped';
                        return interaction.reply(botResponse);
                    };

                    botResponse.content = [
                        '### Text sent:',
                        `> Guild: ${guildId} (${guild.name})`,
                        `> Channel: ${channelId} (${channel.name})`,
                        `> Text: ${text}`
                    ].join('\n');

                    await channel.sendTyping();
                    await delay(text.length * typingDuration);
                    await channel.send(text);
                    await interaction.reply(botResponse);
                    break;
                case 'reply':
                    if (!text || !messageId) {
                        botResponse.content = 'Empty text or message id...Skipped';
                        return interaction.reply(botResponse);
                    }

                    message = await channel.messages.cache.get(messageId);

                    if (!message) {
                        console.log('Message not found in cache. Fetching...');
                        message = await channel.messages.fetch(messageId);
                    }

                    botResponse.content = [
                        '### Reply sent:',
                        `> Guild: ${guildId} (${guild.name})`,
                        `> Channel: ${channelId} (${channel.name})`,
                        `> Message ID: ${messageId}`,
                        `> Text: ${text}`
                    ].join('\n');

                    await channel.sendTyping();
                    await delay(text.length * typingDuration);
                    await message.reply(text);
                    await interaction.reply(botResponse);
                    break;
                case 'embed':
                    let modal = new ModalBuilder()
                        .setCustomId('embed_modal')
                        .setTitle('Send an embed to a guild channel');

                    const embedTitle = new TextInputBuilder()
                        .setCustomId('embed_title')
                        .setLabel('Title')
                        .setPlaceholder('(Optional) Embed title')
                        .setRequired(false)
                        .setStyle(TextInputStyle.Short);

                    const embedColor = new TextInputBuilder()
                        .setCustomId('embed_color')
                        .setLabel('Color')
                        .setPlaceholder('Blurple')
                        .setRequired(false)
                        .setStyle(TextInputStyle.Short);

                    const embedDescription = new TextInputBuilder()
                        .setCustomId('embed_description')
                        .setLabel('Description')
                        .setPlaceholder('Enter the text to be sent')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph);

                    const embedData = {};

                    modal.addComponents([
                        new ActionRowBuilder().addComponents(embedTitle),
                        new ActionRowBuilder().addComponents(embedColor),
                        new ActionRowBuilder().addComponents(embedDescription),
                    ]);

                    await interaction.showModal(modal);

                    const filter = i => i.customId === 'embed_modal';

                    interaction.awaitModalSubmit({ filter: filter, time: 30_000 })
                        .then(modalInteraction => {
                            if (modalInteraction.fields.getTextInputValue('embed_title')) {
                                embedData.title = modalInteraction.fields.getTextInputValue('embed_title');
                            }

                            embedData.description = [
                                modalInteraction.fields.getTextInputValue('embed_description')
                            ];

                            botResponse.embeds = client.botUtils.createEmbeds(
                                [embedData],
                                [modalInteraction.fields.getTextInputValue('embed_color') ?? 'Blurple']
                            );

                            channel.send(botResponse).then(() => {
                                botResponse.content = 'Embed sent';
                                botResponse.embeds = [];
                                modalInteraction.reply(botResponse);
                            })
                        });
                    break;
                case 'emoji':
                    if (!iconId || !messageId) {
                        botResponse.content = 'Emoji or message ID not provided';
                        return interaction.reply(botResponse);
                    }
                    
                    message = await channel.messages.cache.get(messageId);

                    if (!message) {
                        console.log('Message not found in cache. Fetching...');
                        message = await channel.messages.fetch(messageId);
                    }
                    await message.react(iconId);

                    botResponse.content = [
                        '### Reply sent:',
                        `> Guild: ${guildId} (${guild.name})`,
                        `> Channel: ${channelId} (${channel.name})`,
                        `> Message ID: ${messageId}`,
                        `> Emoji: ${iconId}`
                    ].join('\n');

                    await interaction.reply(botResponse);
                    break;
                case 'sticker':
                    if (!iconId) {
                        botResponse.content = 'Sticker ID not provided';
                        return interaction.reply(botResponse);
                    }
                    let sticker = guild.stickers.cache.get(iconId);

                    if (!sticker) {
                        console.log('Sticker not found in cache...Fetching');
                        sticker = await guild.stickers.fetch(iconId);
                    }
                    await channel.send({ stickers:[sticker] });
                    botResponse.content = [
                        '**Sticker Sent**:',
                        `Guild: ${guildId}`,
                        `Channel: ${channelId}`,
                        '\nSticker:',
                        `> ID: ${sticker.id}`,
                        `> Name: ${sticker.name}`
                    ].join('\n');
                    await interaction.reply(botResponse);
                    break;
            }
        }
        catch (error) {
            console.error(error);
            botResponse.content = '**Errored:**\n';
            botResponse.content += '\`\`\`yaml\n';
            botResponse.content += error;
            botResponse.content += '\`\`\`';
            await interaction.reply(botResponse);
        }
    }
};