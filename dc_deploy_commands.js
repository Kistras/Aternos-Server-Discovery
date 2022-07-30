const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId } = require('./config.json');

const commands = [
	new SlashCommandBuilder().setName('top').setDescription('Returns TOP 10 servers sorted by players.')
	.addIntegerOption(option => option.setName('page').setDescription('Selects page'))
	.addStringOption(option => option.setName('version').setDescription('Selects version')),
	new SlashCommandBuilder().setName('server').setDescription('Returns information about specific server'),
	new SlashCommandBuilder().setName('start').setDescription('Starts serverfinder. Sends information into the same channel')
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);