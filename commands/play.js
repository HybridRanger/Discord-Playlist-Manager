const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed, PermissionsBitField} = require("discord.js");
const {QuereyType, useMainPlayer} = require("discord-player");

// commands for playing song from youtube
// will expand later to include Spotify using extractors
// (or make another command if needed)
module.exports = {
    data: new SlashCommandBuilder()
    .setName('play') // Command name
    .setDescription('Play a song in a voice channel') // Command description
    .addStringOption(
        (option) =>
            option
            .setName('song') // Option name
            .setDescription('The song to play') // Option description
            .setRequired(true), // Make the option required
    ),
    execute: async ({client, interaction}) => {

        const player = useMainPlayer();
        const query = interaction.options.getString('song', true)

        const voiceChannel = interaction.member.voice.channel;

        // check if user not in channel
        if (!voiceChannel) {
            return interaction.editReply(
                "You must be in a voice channel to use this command",
            );
        }

        // check if already playing in another channel
        if (
            interaction.guild.members.me.voice.channel &&
            interaction.guild.members.me.voice.channel !== voiceChannel
        ) {
            return interaction.editReply(
                "I am already playing in another channel",
            );
        }

        // check if bot has channel joining permissions
        if (
            !interaction.guild.members.me.permissions.has(
                PermissionsBitField.Flags.Connect,
            )
        ) {
            return interaction.editReply(
                "I do not have permission to join your voice channel!",
            );
        }

        // check if bot has speaking permissions
        if (
            !interaction.guild.members.me
              .permissionsIn(voiceChannel)
              .has(PermissionsBitField.Flags.Speak)
        ) {
            return interaction.editReply(
              "I do not have permission to speak in your voice channel!",
            );
        }

        try {
            // Play the song in the voice channel
            const result = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: { channel: interaction.channel }, // Store text channel as metadata on the queue
                },
            });
         
            // Reply to the user that the song has been added to the queue
            return interaction.editReply(
                `${result.track.title} has been added to the queue!`,
            );
        } catch (error) {
            // Handle any errors that occur
            console.error(error);
            return interaction.editReply('An error occurred while playing the song!');
        }
        /*
        // check if user is actually in a voice channel, and throw a message if they are not
        if (!interaction.member.voice.channel)
        {
            await interaction.reply("You must be in a voice channel to use this command");
            return;
        }

        // song player queue
        const queue = await client.player.create(interaction.guild);

        if (!queue) {
            return interaction.reply(
              "This server does not have an active player session.",
            );
        }

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
            */
    }
}