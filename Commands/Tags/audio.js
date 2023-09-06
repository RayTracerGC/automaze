const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: 'audio',
    category: 'Tags',
    description: 'Guides on how to isolate audio for making datasets',
    aliases: ['dataset'],
    syntax: `audio [member]`,
    /**
     * 
     * @param {Client} client 
     * @param {Message} message 
     * @param {string[]} args 
     * @param {String} prefix 
     */
    run: async(client, message, args, prefix) => {
        const embedDescription = [];
        embedDescription.push(`## • Perfecting Audio Isolation on Low-End Rigs: A Practical Guide\nhttps://docs.google.com/document/d/1HmkG9cmL8SLX7-vJcPT1-1KgUQtCrwXB8CicYmG4LW8/edit?usp=sharing`);
        embedDescription.push(`## • Guide: Gathering and Isolating Audio\nhttps://docs.google.com/document/d/1wTJ_wutDqEtsA99BJOXDDGax25pPIDE84O5E2Rio5Qk/edit#heading=h.g896c5vbh0dv`);

        const embed = new EmbedBuilder()
            .setTitle(`Guides on how to isolate audio to create a good Dataset`)
            .setDescription(embedDescription.join('\n'))
            .setColor(`Yellow`)
            .setFooter({text:'Credits: Litsa The Dancer, Faze Masta and SCRFilms'});

        if (message.mentions.members.first()) {
            return message.channel.send({content: `*Tag suggestion for ${message.mentions.members.first()}*`, embeds: [embed]});
        }

        message.channel.send({embeds: [embed]});
    }
}