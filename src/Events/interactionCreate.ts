import { AutocompleteInteraction, channelMention, Collection, CommandInteraction } from 'discord.js';
import IEventData from '../Interfaces/Events';
import ExtendedClient from '../Core/extendedClient';

const interactionCreateEvent: IEventData = {
    name: 'interactionCreate',
    once: false,
    async run(client: ExtendedClient, interaction: CommandInteraction) {
        // don't allow commands in these channels
        const disallowedChannelIds = [client.discordIDs.Channel.Weights];

        if (disallowedChannelIds.includes(interaction.channelId)) {
            await interaction.reply({
                content: `This command is not available here. Visit ${channelMention(client.discordIDs.Channel.BotSpam)} if you wish to use this command.`,
                ephemeral: true,
            });
            return;
        }

        if (interaction.isChatInputCommand()) {
            const command = client.slashCommands.get(interaction.commandName);

            if (!command) {
                client.logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            client.logger.info(`Executing slash command`, {
                more: {
                    channelId: interaction.channelId,
                    commandName: command.data.name,
                    guildId: interaction.guildId,
                    type: command.type,
                },
            });

            // handle cooldowns if command exists
            const { cooldowns } = client;

            if (!cooldowns.slashCommands.has(command.data.name)) {
                cooldowns.slashCommands.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.slashCommands.get(command.data.name);
            // duration in seconds
            const defaultCooldownDuration = 3;
            // convert to milliseconds
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({
                        content: `Please wait, you are on a cooldown for \`/${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>`,
                        ephemeral: true,
                    });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            } catch (error: any) {
                client.logger.error(`Failed to execute command ${command.data.name}`, error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: `There was an error while executing this command!\n\`\`\`\n${error.toString()}\n\`\`\``,
                        ephemeral: true,
                    });
                } else {
                    await interaction.reply({
                        content: `There was an error while executing this command!\n\`\`\`\n${error.toString()}\n\`\`\``,
                        ephemeral: true,
                    });
                }
            }
        } else if (interaction.isAutocomplete()) {
            const command = client.slashCommands.get((interaction as AutocompleteInteraction).commandName);

            if (!command) {
                client.logger.error(
                    `No command matching ${(interaction as AutocompleteInteraction).commandName} was found.`
                );
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                client.logger.error(error);
            }
        } else if (interaction.isUserContextMenuCommand()) {
            const command = client.contextMenuCommands.get(interaction.commandName);

            if (!command) {
                client.logger.error(`No context command matching ${interaction.commandName} was found.`);
                return;
            }

            client.logger.info(`Executing context command`, {
                more: {
                    channelId: interaction.channelId,
                    commandName: command.data.name,
                    guildId: interaction.guildId,
                    type: command.type,
                },
            });

            try {
                await command.execute(interaction);
            } catch (error) {
                client.logger.error(error);
            }
        }
    },
};

export default interactionCreateEvent;
