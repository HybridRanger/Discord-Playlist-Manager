const {Client, Events, GatewayIntentBits, SlashCommandBuilder} = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');

require("dotenv").config();
const {token} = process.env.DISCORD_TOKEN;

const client = new Client({intents: [GatewayIntentBits.Guilds]});

//------------------------------------//



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