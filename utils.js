// Libraries needed
const fs = require('fs');
const path = require('node:path');
const { EmbedBuilder } = require('discord.js');

// Will give you all the files in a folder recursively
function getAllFiles(currentPath){
    let currentFiles = [];
    for(const thatFile of fs.readdirSync(currentPath)){
        let filePath = currentPath + '/' + thatFile;
        if(fs.lstatSync(filePath).isDirectory()){
            currentFiles = currentFiles.concat(currentFiles, getAllFiles(filePath));
        } else {
            currentFiles.push(filePath);
        }
    }
    return [...new Set(currentFiles)];
}
exports.getAllFiles = getAllFiles;

// Create delay async in the script
async function delay(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}
exports.delay = delay;

function getRandomNumber(min, max) {
    /* gets a random number between min and max */
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.getRandomNumber = getRandomNumber;

function getCommands(basePath, subPath) {
    /* get an array of commands converted to json ready to be sent to discord API */
    const commands = [];

    const foldersPath = path.join(basePath, subPath);
    let commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
            else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    return commands;
}

exports.getCommands = getCommands;


function createEmbed(data, color='') {
    /**
     * Creates a discord embed from an object passed as `data` argument
     */
    const embed = new EmbedBuilder();
    
    // if the color not provided as an argument, try to use from data
    if (!color) {
        color = data.color;
    }
    embed.setColor(color ?? 'Yellow');  // defaults to Yellow

    if (data.title) {
        embed.setTitle(data.title);
    }

    if (data.description) {
        embed.setDescription(data.description.join('\n'));
    }

    if (data.fields) {
        embed.setFields(data.fields);
    }

    if (data.image) {
        embed.setImage(data.image);
    }

    if (data.footer) {
        embed.setFooter({ text: data.footer });
    }

    if (data.timestamp) {
        embed.setTimestamp();
    }

    return embed;
}

exports.createEmbed = createEmbed;


function createEmbeds(contents, colors) {
    /* create embeds from an array of objects and assign colors */
    let colorIndex = 0;
    let embeds = contents.map(item => {
        if (colorIndex >= colors.length) {
            colorIndex = 0;  // goes back to the start of the array after reaching the end
        }
        const selectedColor = item.color ?? colors[colorIndex++];
        return createEmbed(item, selectedColor);
    });
    return embeds;
}

exports.createEmbeds = createEmbeds;

function getAvailableColors(configs) {
    return Object.values(configs.colors.theme);
}

exports.getAvailableColors = getAvailableColors;