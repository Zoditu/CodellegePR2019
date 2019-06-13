var allowChanged = false;
const ProgressSmothness = 10000;
var IsUserMovingTime = false;
var AudioPlayer = {
   player: undefined,
   open: function (source, type) {
      if (AudioPlayer.player) {
         AudioPlayer.player.load();
      }
      AudioPlayer.player = new Audio(source);
      AudioPlayer.player.onended = function () {
         //Si termina de reproducirse el audio...
         //Cambiar el icono
         $('.playButton').html('play_arrow');
      }

      //Calculamos la duración de la cancion
      AudioPlayer.player.ontimeupdate = function () {
        if( IsUserMovingTime)
            return;

         var position = ((AudioPlayer.player.duration - AudioPlayer.player.currentTime) / AudioPlayer.player.duration);
         position *= ProgressSmothness;
         position = Math.floor(ProgressSmothness - position);
         $('#music_time').slider("value", position);
      }
      AudioPlayer.player.volume = $('#volume').slider("value") / 100;
      AudioPlayer.player.play();
      $('.playButton').html('pause');
   },
   volume: function (volume) {
      if (AudioPlayer.player)
         AudioPlayer.player.volume = volume;
   },
   isPlaying: function () {
      if (AudioPlayer.player) {
         if (AudioPlayer.player)
            return !AudioPlayer.player.paused; //Revisa si esra reproduciendo algo
         return false;
      }
   },
   play: function (button) {
      if (AudioPlayer.isPlaying()) {
         AudioPlayer.player.pause();
         button.innerHTML = 'play_arrow';
         //cambiar el icono al de PLAY

      } else {
         if (AudioPlayer.player) {
            AudioPlayer.player.play();
            button.innerHTML = 'pause';
            //Cambiar el ícono al de PAUSE
         }
      }
   }
};

/*$(function () {
   $("#volume").slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 75,
      slide: function () {
         var volume = $(' #volume').slider("value");
         if (AudioPlayer)
            AudioPlayer.volume(volume / 100);
         //cambiar el volumen
      },
      change: function () {
         var volume = $(' #volume').slider("value");
         if (AudioPlayer)
            AudioPlayer.volume(volume / 100);
      },
   });

   $("#music_time").slider({
      orientation: "horizontal",
      range: "min",
      max: ProgressSmothness,
      value: 350,
      slide: function () {
         //cambiar posicion del audio
         if (AudioPlayer.player) {
            var position = $('#music_time').slider("value");
            position /= ProgressSmothness; //position = position / 10;
            var newPosition = Math.floor(position * AudioPlayer.player.duration);
            AudioPlayer.player.currentTime = newPosition;
         }
      }
   });
});
*/
 /*$(function()
{
  $('#volume').slider({
      orientation: "horizontal",
      range: "min",
      max: 100,
      value: 75,
      slide: function () {
         var volume = $(' #volume').slider("value");
         if (AudioPlayer)
            AudioPlayer.volume(volume / 100);
         //cambiar el volumen
      },
      change: function () {
         var volume = $(' #volume').slider("value");
         if (AudioPlayer)
            AudioPlayer.volume(volume / 100);
      },
   });

   $('#music_time').slider({
      orientation: "horizontal",
      range: "min",
      max: ProgressSmothness,
      value: 0,
      slide: function () {
         //cambiar posicion del audio
         if (AudioPlayer.player) {
            var position = $('#music_time').slider("value");
            position /= ProgressSmothness;; //position = position / 10;

            var newPosition = Math.floor(position * AudioPlayer.player.duration);
            AudioPlayer.player.currentTime = newPosition;
         }
      },
      change: function () {
         //cambiar posicion del audio
         if (AudioPlayer.player && IsUserMovingTime) {
            var position = $('#music_time').slider("value");
            position /= ProgressSmothness;; //position = position / 10;

            var newPosition = Math.floor(position * AudioPlayer.player.duration);
            AudioPlayer.player.currentTime = newPosition;
         }
      }
   });

   $('#music_time').mousedown(function(event){ IsUserMovingTime = true;});
   $(document).mouseup(function()
   { 
      if(IsUserMovingTime)
         setTimeout ( function()
         {
            IsUserMovingTime = false;
         }, 50);
   });
});
*/

function OpenMedia(source, type) {
 
   if (type === 'A') //Refers to Audio
   {
      CurrentSong.enabled = true;
      CurrentSong.title = source.title;
      CurrentSong.author = source.author;
      CurrentSong.album = source.album;
      CurrentSong.thumbnail = source.thumbnail;
      AudioPlayer.open(source.location);
   } else //Refers to playlists
   {
      GetPlaylistSongs(source); 
   }
}



function GetMediaFromList(playlist, index, type)
{
   if(type == 'next')
      if(index < playlist.lenght -1)
         OpenMedia(playlist[index+1], 'A');
   else if(type == 'prev')
      if(index > 0)
         OpenMedia(playlist[index - 1], 'A');
}