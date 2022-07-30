const { getIPRange } = require('get-ip-range')
//const { MinecraftQuery } = require("minecraft-status");
const { MinecraftServerListPing } = require("minecraft-status");
const { portRange, ipRange, threadsCount } = require('./config.json')

const { EmbedBuilder } = require('discord.js');

const twoIPv4 = getIPRange(ipRange[0], ipRange[1]) //"ipRange": ["185.116.156.195", "185.116.156.201"]?
//twoIPv4.push('185.116.156.198') // ?

//
let currentThreads = 0
let servers = {}
let currentPort = portRange[0]
let currentIp = 0

let integration

function genEmbed(s, key) {
    const emb = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(key)
        .setAuthor({name: s.version.name})
        .setDescription(`\u200B${s.description.text}`)
        .addFields({ name: `Players ${s.players.online}/${s.players.max}`, value: s.players.online > 0 ? `${s.players.sample ? s.players.sample.map(u => `${u.name} (${u.id})`).join('\n') : ""}` : '\u200B', inline: false })
        .setTimestamp()
    if (s.usesForge) {
        emb.addFields({ name: 'Uses mods', value: s.usesForge.mods ? (s.usesForge.mods.length == 0 ? "Very likely just forge/fabric without mods." : (s.usesForge.mods.length > 20 ? `MORE THAN 20 (${s.usesForge.mods.length}).` : s.usesForge.mods.map(u => {return `\`${u.modId} ${u.modmarker}\``}).join('\n'))) : "?", inline: false })
    }
    return emb
}

async function log(message, key) {
    console.log(message)
    if (!integration) return
    if (!key) {
        try {
            await integration.channel.send( {content: message} )
        } catch {}
    } else {
        const s = servers[key]
        const emb = genEmbed(s, key)
        integration.channel.send({embeds: [emb]})
    }
}

async function cycleservers(integra) {
    if (integra) {integration = integra}
    while (threadsCount > currentThreads) {
        curip = twoIPv4[currentIp]
        if (!curip) 
            break
        curport = currentPort

        const _TEMP1 = curip + ""
        const _TEMP2 = curport + 0
        const key = `${_TEMP1}:${_TEMP2}`
        if (servers[key]) continue

        currentThreads += 1

        MinecraftServerListPing.ping(4, curip, curport, 10000)
        //MinecraftQuery.query("mc.hypixel.net", 25565, 5000)
        .then(response => {
            //console.log(response)
            
            servers[key] = {
                version: response.version,
                description: response.description,
                players: response.players,
                usesForge: false
            }
            if (response.forgeData) {
                servers[key].usesForge = response.forgeData
            }
            log(`Found ${key}. ${response.players.online}/${response.players.max}`, key)
        })
        .catch(error => {
            /*
            if (servers[key]) {
                console.log(`Lost ${key}.`)
                delete servers[key]
            }
            */
        })
        .finally(()=> {
            currentThreads -= 1
            cycleservers()

            if (currentThreads === 0) {
                currentIp = 0
                currentPort = portRange[0]
                log("Done scanning servers. I'll start again in ten minutes.")
                setTimeout(cycleservers, 1000*60*10)
            }
        })

        currentPort += 1
        if (currentPort > portRange[1]) {
            currentIp += 1
            currentPort = portRange[0]
            log(`Did a full cycle. Now scanning ${twoIPv4[currentIp]}.`)
        }
    }
}
console.log('Loaded serverfinder!')

module.exports = {
    servers,
    currentThreads,
    cycleservers,
    genEmbed
}

// Autoupdating
currentlyupdating = 0
function updateServers() {
    for (k in servers) {
        currentlyupdating += 1
        MinecraftServerListPing.ping(4, curip, curport, 10000)
        .then(response => {
            servers[key] = {
                version: response.version,
                description: response.description,
                players: response.players,
                usesForge: false
            }
            if (response.forgeData) {
                servers[key].usesForge = response.forgeData
            }
        })
        .catch(error => {
            if (servers[key]) {
                log(`Lost ${key}.`)
                delete servers[key]
            }
        })
        .finally(()=> {
            currentlyupdating -= 1
        })
    }
}

//setInterval(updateServers, 1000*60*2)
