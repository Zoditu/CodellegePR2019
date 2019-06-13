var BackGroundControl = 
{
    visible: false
};

var Home = 
{
    visible : true
};

var CurrentSong =
{
    title: '',
    author: '',
    album: '',
    thumbnail: '',
    enabled: false
};


$(function(){

    var app = new Vue(
      {
        el: '#app',
        data: 
        {
          userData: _requests,
          OpenMedia: OpenMedia,
          PlayList: PlayList,
          BackGroundControl: BackGroundControl,
          CurrentSong: CurrentSong,
          FindListFor: FindListFor,
          Genres: Genres,
          Home: Home
        }
      });

      $('.carousel').carousel({
        interval: 4000
      });

      $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true
      });

      $("#volume").slider({
        orientation: "horizontal",
        range: "min",
        max: 100,
        value: 50,
        slide: function () {

            var volume = $( '#volume' ).slider ( "value" );
            //Cambiar el volumen
            if( AudioPlayer )
            AudioPlayer.volume (volume/100);
        },

        change: function () {

            var volume = $( '#volume' ).slider ( "value" );
            //Cambiar el volumen
            if( AudioPlayer )
            AudioPlayer.volume (volume/100);

        }

    });

    $("#music_time").slider({
        orientation: "horizontal",
        range: "min",
        max: ProgressSmothness, //ProgressSmothness = 10,000
        value: 0,
        slide: function () {

           //Cambiar la posicioón del audio
            if( AudioPlayer.player && IsUserMovingTime )
            {
                var position = $( '#music_time' ).slider( "value" );
                position /= ProgressSmothness; // es o mismo que position=position/10
                var newPosition = Math.floor( position * AudioPlayer.player.duration );
                AudioPlayer.player.currentTime = newPosition;
            }
        },
        change: function () {

            //Cambiar la posicioón del audio
             if( AudioPlayer.player && IsUserMovingTime )
             {
                 var position = $( '#music_time' ).slider( "value" );
                 position /= ProgressSmothness; // es o mismo que position=position/10
                 var newPosition = Math.floor( position * AudioPlayer.player.duration );
                 AudioPlayer.player.currentTime = newPosition;
             }
         }

    });

    $( "#music_time" ).mousedown(function(){ IsUserMovingTime = true;});

    $( document ).mouseup( function()
    {
        setTimeout( function(){
        IsUserMovingTime = false;
    }, 70);
    });

    });