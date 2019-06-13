//var showLoading = false;
var BackgroundControl = 
{
   visible: false
}


var CurrentSong =
{
    title:'',
    author:'',
    album:'',
    thumbnail:'',
    enabled:false
};

var Home = 
{
   visible: true
};

$('.carousel').carousel({
   interval: 1000
 });

 $('.grid').masonry({
   itemSelector: '.grid-item',
   columnWidth: '.grid-sizer',
   percentPosition: true
 });
 
$(function (){
   var app = new Vue(
   {
      el: '#app',
      data:
      {
         userData: _requests,
         OpenMedia: OpenMedia,
         Playlist: Playlist,
         BackgroundControl : BackgroundControl,
         Home: Home,
         CurrentSong: CurrentSong,
         FindListFor:FindListFor,
         Genres: Genres
      }
   });

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

   $('#music_time').mousedown(function(){ IsUserMovingTime = true;});

   $(document).mouseup(function()
   { 
      if(IsUserMovingTime)
         setTimeout ( function()
         {
            IsUserMovingTime = false;
         }, 70);
   });
});