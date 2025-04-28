const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const {QuereyType} = require("discord-player");

// commands for playing song from youtube
// will expand later with Spotify API to include Spotify 
// (or make another command if needed)
module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or playlist")
    .addSubcommand(subcommand =>
        subcommand
            .setName("search")
            .setDescription("Searches for a song and plays it")
            .addStringOption(option =>
                option.setName("searchterms").setDescription("search keywords").setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("playlist")
            .setDescription("Plays a playlist from YT")
            .addStringOption(option => option.setName("url").setDescription("the playlist's url").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("song")
            .setDescription("Plays a single song from YT")
            .addStringOption(option => option.setName("url").setDescription("the song's url").setRequired(true))
    ),
    execute: async ({client, interaction}) => {

        // check if user is actually in a voice channel, and throw a message if they are not
        if (!interaction.member.voice.channel)
        {
            await interaction.reply("You must be in a voice channel to use this command");
            return;
        }

        // song player queue
        const queue = await client.player.createQueue(interaction.guild);

        // connect to VC if not already connected
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);

        let embed = new MessageEmbed();
        if (interaction.options.getSubcommand() == "song")
        {
            let url = interaction.options.getString("url");

            // search for url
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QuereyType.YOUTUBE_VIDEO,
            });

            // check for no search results
            if (result.tracks.length === 0)
            {
                await interaction.reply("no results found");
                return;
            }

            // add search result to queue
            const song = result.tracks[0];
            await queue.addTrack(song);

            embed
            .setDescription(`Added **[${song.title}] (${song.url})** to the queue`)
            .setThumbnail(song.thumbnail)
            .setFooter({text: `Duration: ${song.duration}`});
        }
        else if (interaction.options.getSubcommand() == "playlist")
        {
            let url = interaction.options.getString("url");

            // search for url
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QuereyType.YOUTUBE_PLAYLIST,
            });

            // check for no search results
            if (result.tracks.length === 0)
            {
                await interaction.reply("no playlist found");
                return;
            }

            // add search result to queue
            const playlist = result.playlist;
            await queue.addTracks(playlist);

            embed
            .setDescription(`Added **[${playlist.title}] (${playlist.url})** to the queue`)
            .setThumbnail(playlist.thumbnail)
            .setFooter({text: `Duration: ${playlist.duration}`});
        }
    }
}