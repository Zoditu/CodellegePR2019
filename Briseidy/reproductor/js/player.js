

var allowChanged = false;
var IsUserMovingTime = false;
const ProgressSmothness = 10000;
var AudioPlayer = {
    player: undefined,
    open: function (source) {
        //reproducir cancion e instanciar el reproductor
        if (AudioPlayer.player)
            AudioPlayer.player.load();

        AudioPlayer.player = new Audio(source);

        //Si termina de reproducirse el audio.. cambiar el icono 
        AudioPlayer.player.onended = function () {
            $('.playButton').html('play_arrow');
        }
        AudioPlayer.player.ontimeupdate = function () //onplaying es un evento 
        {
            if (IsUserMovingTime)
                return;



            var position = (AudioPlayer.player.duration - AudioPlayer.player.currentTime) / AudioPlayer.player.duration;
            position *= ProgressSmothness
            position = Math.floor(ProgressSmothness - position);
            $('#music_time').slider("value", position);
        }
        AudioPlayer.player.volume = $('#volume').slider("value") / 100;
        AudioPlayer.player.play();
        $('.playButton').html('pause');

    },
    volume: function (volume) {
        if (AudioPlayer.player) {
            AudioPlayer.player.volume = volume;
        }
    },

    isPlaying: function () {
        if (AudioPlayer.player) {
            if (AudioPlayer.player)
                return !AudioPlayer.player.paused;
            return false;
        }
    },
    play: function (button) {
        if (AudioPlayer.isPlaying()) {
            AudioPlayer.player.pause();
            button.innerHTML = 'play_arrow';
            //cambiar el icono al de play
        } else {
            if (AudioPlayer.player) {
                AudioPlayer.player.play();
                button.innerHTML = 'pause';
                //cambiar el icono al de Pause
            }
        }
    }
};


function OpenMedia(source, type) {
    
    if (type === 'A') //refers to audio
    {
        //reproducir cancion e instanciar el reproductor
        CurrentSong.enabled = true;
        CurrentSong.title = source.title;
        CurrentSong.autor = source.autor;
        CurrentSong.album = source.album;
        CurrentSong.thumbnail = source.thumbnail;
        AudioPlayer.open(source.location);
    } else // refers to playlist
    {
        GetPlaylistSongs(source);
        //Home.visible = false;
    }
}

function GetMediaFromList(playlist,index,type)
{
    if(type === 'next')
        if(index < playlist.length - 1)
        OpenMedia(playlist[index + 1 ], 'A');

    else if(type == 'prev')
        if(index > 0)
            OpenMedia(playlist[index - 1], 'A');
}