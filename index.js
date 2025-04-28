//--- requirements ---//
require("dotenv").config();

const {Client, Collection, Events, GatewayIntentBits, SlashCommandBuilder} = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const {Player} = require("discord-player");

const fs = require("fs");
const path = require("path");

//--- set up client ---//
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates]
});

//--- load commands ---//
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for(const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    console.log(command.data.name);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
};

//--- player setup ---/ /
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({version: "9"}).setToken(process.env.TOKEN);
    for (const guildId of guild_ids)
    {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
            bpdy: commands
        })
        .then(() => console.log(`Added ${commands.length} commands to ${guildId}`))
        .catch(console.error);
    }
});

client.on("interactionCreate", async interation => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try{
        await command.execute({client, interaction});
    }
    catch(err)
    {
        console.error(err);
        await interaction.reply("Oops, an error occurred while excuting that command");
    }
});

client.login(process.env.TOKEN);





/*
client.once(Events.ClientReady, c => {
    console.log("Logged as ${c.user.tag");

    const ping = new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with 'Pong!'");

    const list = new SlashCommandBuilder()
        .setName("list")
        .setDescription("Lists messages in playlist channel");

    const add = new SlashCommandBuilder()
        .setName("add")
        .setDescription("add new playlist to channel")
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("Unique playlist name")
                .setRequired(true)
            )
        .addStringOption(option =>
            option
                .setName("url")
                .setDescription("Spotify URL for the playlist")
                .setRequired(true)
            );

    const join = new SlashCommandBuilder()
        .setName("join")
        .setDescription("Tells Jockie to join your current channel");

    client.application.commands.create(ping, "969913679829143613");
    client.application.commands.create(list, "969913679829143613");
    client.application.commands.create(add, "969913679829143613");
    client.application.commands.create(join, "969913679829143613");
})

client.on(Events.InteractionCreate, interaction => {

    const playlistChannel = client.channels.cache.get("1366014803658936512");

    if(!interaction.isChatInputCommand()) return;

    // ping pong test
    if(interaction.commandName === "ping"){
        interaction.reply("m!join");
    };

    // listing messages from the playlist channel
    if(interaction.commandName === "list"){
        playlistChannel.messages.fetch({limit: 100}).then((messages) => {
            console.log(`Received ${messages.size} messages`);
            messages.forEach(message => console.log(message.content))
         });
    };

    // adding new playlists to playlist channel
    if(interaction.commandName === "add"){
        let playlistName = interaction.options.getString("name"),
            playlistURL = interaction.options.getString("url");

        interaction.reply(playlistName + " " + playlistURL);
    };

    //console.log(interaction);
});

client.login(token);
*/