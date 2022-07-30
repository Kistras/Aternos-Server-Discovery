const { MinecraftServerListPing } = require("minecraft-status");

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const finder = require("./serverfinder");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
	console.log('Ready!');
});

//console.log(finder, finder.servers)

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'top') {
		let offset = interaction.options.getInteger('page') || 1
        let version = interaction.options.getString('version') || ""
        // Sort
        let sortable = [];
        for (var v in finder.servers) {
            if (sortable.players && sortable.players.online && (!version || finder.servers[v].version.name.includes(version))) {
                sortable.push([v, finder.servers[v]]);
            }
        }

        sortable.sort(function(a, b) {
            return b[1].players.online - a[1].players.online
        });

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Top 10 servers by players')
            .setAuthor({ name: `Page ${offset}/${Math.ceil(Object.keys(sortable).length/10)}` })
            .setThumbnail('https://cdn.discordapp.com/avatars/1002566673297068102/5c7838ce6dac3c7813be870c5c639e76.png?size=4096')
            .setTimestamp()

        for (k = (offset-1)*10; k<=offset*10; k++) {
            const s1 = sortable[k]
            if (!s1) break
            const s = s1[1]
            // I WANT TO KILL MYSELF
            embed.addFields({ name: `${k+1}. ${s1[0]}`, value: `**Version: **${s.version.name} (${s.version.protocol})\n**It has ${s.players.online}/${s.players.max} players:**\n\`\`\`${
                s.players.online > 0 ? `${s.players.sample ? s.players.sample.map(u => `${u.name} (${u.id})`).join('\n') : ""}` : '\u200B'}\`\`\`${
                s.usesForge ? `Uses mods: \`\`\`${s.usesForge.mods ? (s.usesForge.mods.length == 0 ? "Very likely just forge/fabric without mods." : (s.usesForge.mods ? (s.usesForge.mods.length == 0 ? "Very likely just forge/fabric without mods." : (s.usesForge.mods.length > 20 ? `MORE THAN 20 (${s.usesForge.mods.length}).` : s.usesForge.mods.map(u => {return `\`${u.modId} ${u.modmarker}\``}).join('\n'))) : "?")) : "?"}\`\`\`` : ""
            }`, inline: false })
        }

        await interaction.reply({ embeds: [embed] })
	} else if (commandName === 'start') {
        await interaction.reply('Started!');
        finder.cycleservers(interaction)
	} else if (commandName === 'server') {
        const rip = interaction.options.getString('ip')
        const r = rip.split(':')
        const port = r.length == 1 ? 25565 : parseInt(r[1])
        const ip = r[0]
        await interaction.deferReply()
        
        MinecraftServerListPing.ping(4, ip, port, 10000)
        .then(response => {
            const key = `${ip}:${port}`
            finder.servers[key] = {
                version: response.version,
                description: response.description,
                players: response.players,
                usesForge: false
            }
            if (response.forgeData) {
                finder.servers[key].usesForge = response.forgeData
            }

            const embed = finder.genEmbed(response, key)

            interaction.editReply({embeds: [embed]})
        })
        .catch(error => {
            interaction.editReply(`Failed with an error!\n${error}`)
        })
	} else if (commandName === 'findplayer') {
        const player = interaction.options.getString('name').toLowerCase()
        let results = []

        for (s in finder.servers) {
            console.log(finder.servers[s].players.sample.map(u => `${u.name}`).join(',').toLowerCase())
            if (finder.servers[s].players.sample.length && finder.servers[s].players.sample.map(u => `${u.name}`).join(',').toLowerCase().includes(player)) {
                results.push(s)
            }
        }
        
        let embeds = []

        if (results.length > 10) {
            await interaction.reply('Found more than ten servers with that player.')
        } else if (results.length == 0) {
            await interaction.reply('Found zero servers with that player.')
        } else {
            for (r of results) {
                embeds.push(finder.genEmbed(finder.servers[r]),r)
            }
            await interaction.reply({embeds:embeds})
        }
    }
});

client.login(token);
