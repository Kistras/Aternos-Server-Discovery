# Aternos Server Discovery

## What is this?
This is a javascript program that scans range of ports on range of IP adresses and checks whether there is a minecraft server hosted at this exact location.
## Why is it needed?
This way you can connect to servers (primary Aternos, but can be used anywhere else) that could be otherwise inaccessible/unlisted.
## Are you raiding those servers?
No.
## Then why are you doing this?
To prove that hosting server on Aternos isn't as secure as it's believed.
## How to prevent people from joining my server and doing bad stuff?
1. Consider installing some sort of authorization plugin.
2. Use whitelist.
3. Turn online mode on. **That requires license though and a lot of Aternos users play only on cracked servers.**
A lot of stuff could be prevented by using just those three steps.
## Installation?
1. Dump this thing anywhere and run `npm i`.
2. Create your 'config.json' file and fill it accordingly. Look at `config_example.json` for reference.
3. Add your bot on your server. Make sure that it can use slash commands.
4. Run `node dc_deploy_commands.js`.
5. Run `node index.js`.
6. You're good to go! Use commands.
