"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalUtilities_1 = require("../../Utils/generalUtilities");
const settingsService_1 = __importDefault(require("../../Services/settingsService"));
const db_1 = __importDefault(require("../../db"));
var ColorThemes;
(function (ColorThemes) {
    ColorThemes["Default"] = "default";
    ColorThemes["Spooky"] = "spooky";
    ColorThemes["Christmas"] = "xmas";
})(ColorThemes || (ColorThemes = {}));
const Configure = {
    category: 'Utilities',
    cooldown: 15,
    data: new discord_js_1.SlashCommandBuilder()
        .setName('configure')
        .setDescription('Configure bot settings')
        .addSubcommand((subcommand) => subcommand
        .setName('comission')
        .setDescription('Configure bot behavior in paid model requests')
        .addBooleanOption((option) => option
        .setName('bot_responses')
        .setDescription('Whether the bot should send messages')
        .setRequired(true))
        .addBooleanOption((option) => option
        .setName('delete_messages')
        .setDescription('Whether the bot should delete messages from users that doesnt have appropriate roles')
        .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName('theme')
        .setDescription('Configure color theme')
        .addStringOption((option) => option
        .setName('name')
        .setDescription('Theme name')
        .addChoices({ name: 'Default', value: ColorThemes.Default }, { name: 'Spooky', value: ColorThemes.Spooky }, { name: 'Christmas', value: ColorThemes.Christmas })
        .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName('status')
        .setDescription('Configure bot status')
        .addStringOption((option) => option
        .setName('statuses')
        .setDescription('Choose a status')
        .setRequired(true)
        .addChoices({ name: 'Online', value: 'online' }, { name: 'Idle', value: 'idle' }, { name: 'Do Not Disturb', value: 'dnd' }, { name: 'Invisible', value: 'invisible' })))
        .addSubcommand((subcommand) => subcommand
        .setName('activity')
        .setDescription('Configure bot activity')
        .addStringOption((option) => option
        .setName('activity_type')
        .setDescription('Choose an activity')
        .setRequired(true)
        .addChoices({ name: 'Watching', value: 'watching' }, { name: 'Listening', value: 'listening' }, { name: 'Reset', value: 'reset' }))
        .addStringOption((option) => option.setName('activity_name').setDescription('Choose a name for the activity')))
        .addSubcommand((subcommand) => subcommand
        .setName('general')
        .setDescription('General bot configs')
        .addBooleanOption((option) => option.setName('bot_reactions').setDescription('Whether the bot should add reactions'))
        .addBooleanOption((option) => option
        .setName('send_logs')
        .setDescription('Whether the bot should send logs to development server'))
        .addBooleanOption((option) => option
        .setName('automated_replies')
        .setDescription('Whether the bot should send replies to detected questions')))
        .addSubcommand((subcommand) => subcommand
        .setName('cooldown_immune')
        .setDescription('Makes a user immune to cooldowns')
        .addStringOption((option) => option.setName('user_id').setDescription('The target user').setRequired(true))
        .addBooleanOption((option) => option
        .setName('immune')
        .setDescription('Whether this user is immune to cooldowns')
        .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName('automated_messages')
        .setDescription('Send automate messages')
        .addBooleanOption((option) => option
        .setName('send_messages')
        .setDescription('If the bot should send automated messages')
        .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName('debug_guild')
        .setDescription('Guild to send debug logs')
        .addStringOption((option) => option.setName('guild_id').setDescription('The guild ID'))
        .addStringOption((option) => option.setName('channel_id').setDescription('Channel to send the logs')))
        .addSubcommand((subcommand) => subcommand
        .setName('logs')
        .setDescription('Configure logs')
        .addStringOption((option) => option
        .setName('category')
        .setDescription('Which log to configure')
        .setRequired(true)
        .addChoices({ name: 'Emojis', value: 'emojis' }, { name: 'Stickers', value: 'stickers' }, { name: 'Models', value: 'models' }, { name: 'ModelRequests', value: 'modelRequests' }))
        .addBooleanOption((option) => option.setName('enabled').setDescription('Enable or disable this log'))),
    async execute(interaction) {
        const client = interaction.client;
        const { botConfigs } = client;
        if (interaction.options.getSubcommand() === 'comission') {
            await configureCommision(interaction, botConfigs);
        }
        else if (interaction.options.getSubcommand() === 'theme') {
            await configureTheme(interaction, db_1.default);
        }
        else if (interaction.options.getSubcommand() === 'status') {
            await configureStatus(interaction);
        }
        else if (interaction.options.getSubcommand() === 'activity') {
            await configureActivity(interaction);
        }
        else if (interaction.options.getSubcommand() === 'general') {
            await configureGeneral(interaction);
        }
        else if (interaction.options.getSubcommand() === 'cooldown_immune') {
            await configureCooldownImmunity(interaction);
        }
        else if (interaction.options.getSubcommand() === 'automated_messages') {
            await configureAutomatedMessages(interaction);
        }
        else if (interaction.options.getSubcommand() === 'debug_guild') {
            await configureDebugGuild(interaction);
        }
        else if (interaction.options.getSubcommand() === 'logs') {
            await configureLogs(interaction);
        }
    },
};
exports.default = Configure;
async function configureCommision(interaction, configs) {
    const sendMessages = interaction.options.getBoolean('bot_responses') ?? false;
    const deleteMessages = interaction.options.getBoolean('delete_messages') ?? false;
    configs.commissions.sendMessages = sendMessages;
    configs.commissions.deleteMessages = deleteMessages;
    const responseLines = [
        (0, discord_js_1.heading)('Bot Configured', discord_js_1.HeadingLevel.Three),
        (0, discord_js_1.codeBlock)('js', JSON.stringify({ sendMessages, deleteMessages }, null, 4)),
    ];
    await interaction.reply({ content: responseLines.join('\n'), ephemeral: true });
}
async function configureTheme(interaction, knex) {
    const service = new settingsService_1.default(knex);
    const selectedTheme = interaction.options.getString('name', true);
    const affectedRows = await service.update('main_settings', { theme: selectedTheme });
    const updatedSettings = await service.find('main_settings');
    if (affectedRows !== 1 || !updatedSettings) {
        await interaction.reply({ content: 'Failed to update theme', ephemeral: true });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder().setTitle('Configure').setColor(discord_js_1.Colors.Purple).addFields({
        name: 'Theme',
        value: updatedSettings.theme,
        inline: true,
    });
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
async function configureStatus(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const selectedStatus = interaction.options.getString('statuses') ?? 'online';
    interaction.client.user.setStatus(selectedStatus);
    await (0, generalUtilities_1.delay)(5000);
    await interaction.editReply({ content: `Status: ${selectedStatus} ` });
}
async function configureActivity(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const activityTypeInput = interaction.options.getString('activity_type');
    const activityName = interaction.options.getString('activity_name') ?? 'AI HUB';
    let activityType = undefined;
    if (activityTypeInput === 'reset') {
        interaction.client.user.setPresence({});
        await (0, generalUtilities_1.delay)(3000);
        await interaction.editReply({ content: 'Activity reseted' });
    }
    else {
        switch (activityTypeInput) {
            case 'watching':
                activityType = discord_js_1.ActivityType.Watching;
                break;
            case 'listening':
                activityType = discord_js_1.ActivityType.Listening;
                break;
        }
        interaction.client.user.setActivity({
            name: activityName,
            type: activityType,
        });
        await (0, generalUtilities_1.delay)(3000);
        await interaction.editReply({ content: 'Activity updated!' });
    }
}
async function configureGeneral(interaction) {
    const botReactions = interaction.options.getBoolean('bot_reactions');
    const sendLogs = interaction.options.getBoolean('send_logs');
    const automatedReplies = interaction.options.getBoolean('automated_replies');
    const client = interaction.client;
    if (botReactions != null) {
        client.botConfigs.general.reactions = botReactions;
    }
    if (sendLogs != null) {
        client.botConfigs.general.sendLogs = sendLogs;
    }
    if (automatedReplies != null) {
        client.botConfigs.general.automatedReplies = automatedReplies;
    }
    const responseListing = (0, discord_js_1.unorderedList)([
        `Reactions: ${(0, discord_js_1.inlineCode)(String(client.botConfigs.general.reactions))}`,
        `Send logs: ${(0, discord_js_1.inlineCode)(String(client.botConfigs.general.sendLogs))}`,
        `Automated replies: ${(0, discord_js_1.inlineCode)(String(client.botConfigs.general.automatedReplies))}`,
    ]);
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('General configs')
        .setDescription(responseListing)
        .setColor(discord_js_1.Colors.Aqua)
        .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
async function configureCooldownImmunity(interaction) {
    const userId = interaction.options.getString('user_id');
    if (!userId)
        return;
    const cooldownImmunity = interaction.options.getBoolean('immune') ?? false;
    const client = interaction.client;
    if (cooldownImmunity) {
        client.botData.cooldownImmuneUsers.set(userId, cooldownImmunity);
        client.cooldowns.reactions.delete(userId);
        client.cooldowns.banana.delete(userId);
        client.cooldowns.slashCommands.delete(userId);
    }
    else {
        client.botData.cooldownImmuneUsers.delete(userId);
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('Cooldown Immunity')
        .setDescription((0, discord_js_1.unorderedList)([
        `User: ${(0, discord_js_1.userMention)(userId)}`,
        `Immunity: ${(0, discord_js_1.inlineCode)(String(cooldownImmunity))}`,
    ]))
        .setColor(discord_js_1.Colors.DarkAqua);
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
async function configureAutomatedMessages(interaction) {
    //const sendMessages = interaction.options.getBoolean('send_messages') ?? false;
    const botResponse = { ephemeral: true };
    //const client = interaction.client as ExtendedClient;
    /* if (sendMessages) {
        if (client.scheduler.isRunning) {
            botResponse.content = 'Scheduler is already running.';
        } else {
            botResponse.content = 'Scheduler started.';
            client.scheduler.start();
        }
    } else {
        botResponse.content = 'Scheduler stopped.';
        client.scheduler.stop();
    } */
    botResponse.content = 'Unavailable';
    await interaction.reply(botResponse);
}
async function configureDebugGuild(interaction) {
    const guildId = interaction.options.getString('guild_id');
    const channelId = interaction.options.getString('channel_id');
    const client = interaction.client;
    client.botConfigs.debugGuild.id = guildId ?? '';
    client.botConfigs.debugGuild.channelId = channelId ?? '';
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('Debug Guild')
        .setColor(discord_js_1.Colors.DarkBlue)
        .setDescription((0, discord_js_1.unorderedList)([
        `${(0, discord_js_1.bold)('Guild ID')}: ${(0, discord_js_1.inlineCode)(client.botConfigs.debugGuild.id)}`,
        `${(0, discord_js_1.bold)('Channel ID')}: ${(0, discord_js_1.inlineCode)(client.botConfigs.debugGuild.channelId)}`,
    ]));
    await interaction.reply({ embeds: [embed] });
}
async function configureLogs(interaction) {
    const logsCategory = interaction.options.getString('category');
    const logEnabled = interaction.options.getBoolean('enabled');
    const client = interaction.client;
    if (logEnabled != null) {
        client.botConfigs.logs[logsCategory] = logEnabled;
    }
    const embedDescription = [];
    for (const key in client.botConfigs.logs) {
        embedDescription.push(`- ${key}: \`${client.botConfigs.logs[key]}\``);
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('Logs configuration')
        .setDescription(embedDescription.join('\n'))
        .setColor(discord_js_1.Colors.DarkButNotBlack);
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
    });
}
