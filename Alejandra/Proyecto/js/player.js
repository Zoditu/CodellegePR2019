const ProgressSmothness = 10000;
var IsUserMovingTime = false; 
var AudioPlayer =
{
    player:undefined,
    open:function(source)
    {
      
        if (AudioPlayer.player)
            AudioPlayer.player.load();

        AudioPlayer.player = new Audio(source);

        AudioPlayer.player.onended = function()
        {
            $('.playButton').html('play_arrow');
        };

        AudioPlayer.player.ontimeupdate = function()
        {
            if(IsUserMovingTime)
                return;

            var position =((AudioPlayer.player.duration - AudioPlayer.player.currentTime)/ AudioPlayer.player.duration);
            position *= ProgressSmothness;
            position = Math.floor(ProgressSmothness-position);

            $('#music_time').slider("value",position);
        };
        AudioPlayer.player.volume= $('#volumen').slider ("value")/100;
        AudioPlayer.player.play ();
        $('.playButton').html('pause');

    },
    volume:function(volume)
    {
        if(AudioPlayer.player)
        AudioPlayer.player.volume = volume;
    },
    isPlaying: function()
    {
        if (AudioPlayer.player)
            return!AudioPlayer.player.paused;
        return false;
    },
    play: function(button)
    {
        if (AudioPlayer.isPlaying())
        {
            AudioPlayer.player.pause();
            button.innerHTML = 'play_arrow';
        }
        else
        {
            if (AudioPlayer.player)
            {
                AudioPlayer.player.play();
                button.innerHTML = 'pause';
            }
        }
        
    }
};


function OpenMedia(source,type)
{
    
    if(type === 'A')//refers to audio 
    {
        //reproducir cancion e instanciar el reproductor 
        CurrentSong.enabled = true;
        CurrentSong.title = source.title;
        CurrentSong.author = source.author;
        CurrentSong.album = source.album;
        CurrentSong.thumbnail = source.thumbnail;
        AudioPlayer.open(source.location);
    }
    else//refers to playlist
    {
        GetPlaylistSongs(source);
    }

}


function GetMediaFromList (playlist,index,type)
{
    if( type == 'next')
        if ( index < playlist.length - 1 )
            OpenMedia(playlist[index + 1 ],'A');
    
    else if (type == 'next')
        if (index > 0)
            OpenMedia(playlist [ index - 1],'A');
}