var BackgroundControl = 
{
    visible: false
}

var Home = 
{
    visible : true
};

var CurrentSong =
{
    Title: '',
    Author: '',
    Album: '',
    Thumbnail: '',
    enabled: false
}

$(function(){

    var app = new Vue({
        el: '#app',
        data: {
          userData: _requests,
          OpenMedia: OpenMedia,
          Playlist: Playlist,
          BackgroundControl: BackgroundControl,
          Home: Home,
          CurrentSong: CurrentSong,
          FindListFor: FindListFor,
          Genres: Genres
        }
    }); 

    $('.carousel').carousel({interval: 5000});

    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true
      });
      

    $("#volume").slider({
      orientación: "horizontal",
      range: "min",
      max: 100,
      value: 75,
      slide: function(){
          var volume = $( '#volume' ).slider( "value" );
          //Cambiar el volumen
          if( AudioPlayer )
              AudioPlayer.volume(volume/100);
          //cambiar el volumen
      },
      change: function()
      {
          var volume = $( '#volume' ).slider( "value" );
          if( AudioPlayer )
              AudioPlayer.volume( volume/100 );
              //cambiar el volumen
      }
  });

  $("#music_time").slider({
      orientation: "horizontal",
      range: "min",
      max: ProgressSmothness,
      value: 0,
      slide: function()
      {
          //Cambiar la posicion del audio
          if( AudioPlayer.player &&IsUserMovingTime )
          {
              var position = $( '#music_time' ).slider( "value" );
              position /= ProgressSmothness;
              var newPosition = Math.floor( position * AudioPlayer.player.duration );
              AudioPlayer.player.currentTime = newPosition;
          }
      },

      change: function()
      {
          //Cambiar la posicion del audio
          if( AudioPlayer.player &&IsUserMovingTime )
          {
              var position = $( '#music_time' ).slider( "value" );
              position /= ProgressSmothness;
              var newPosition = Math.floor( position * AudioPlayer.player.duration );
              AudioPlayer.player.currentTime = newPosition;
          }
      }
  });

  $("#music_time").mousedown( function( )
  {IsUserMovingTime = true; });
  
  $(document).mouseup( function( )
  {
      setTimeout( function(){
          IsUserMovingTime = false; 
      }, 70);
  });
});
