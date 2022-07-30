const mineflayer = require('mineflayer')

bot = mineflayer.createBot({
    host: "Erohiae.aternos.me",
    port: 46439,
    username: "AutomatedBot"
})

bot.on('kicked', (e)=>{console.log(e);})
bot.on('error', (e)=>{console.log(e)})
bot.once('login', ()=>{console.log(`[${this.username}] - Joined the server`)})
bot.on('spawn', ()=>{console.log(`[${this.username}] - Spawned`)})