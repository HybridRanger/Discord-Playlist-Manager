//--- requirements ---//
require("dotenv").config();

const {Client, Collection, GatewayIntentBits} = require("discord.js");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const {Player} = require("discord-player");

//--- source extractors ---//
const {SpotifyExtractor} = require("discord-player-spotify");
const {YoutubeiExtractor} = require("discord-player-youtubei");
const { DefaultExtractors, VimeoExtractor, ReverbnationExtractor, SoundCloudExtractor} = require("@discord-player/extractor");

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

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }

    commands.push(command.data.toJSON());
};

//--- player setup ---/ /
const player = new Player(client);

/*
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});*/

//--- register commands ---//
const rest = new REST().setToken(process.env.TOKEN);


(async () => {
    // deploy extractors
    //await player.extractors.loadMulti(DefaultExtractors);
    await player.extractors.loadMulti([SpotifyExtractor, YoutubeiExtractor]);

    // deploy commands
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

// 
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try{
        await interaction.deferReply();
        await command.execute({client, interaction});
        //interaction.editReply();
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