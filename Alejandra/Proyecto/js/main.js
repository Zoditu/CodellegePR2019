var  BackgroundControl=
{
    visible:false
};

var CurrentSong =
{
    title: '',
    author:'',
    album:'',
    thumbnail:'',
    enable:false
};
var Home = 
{
    visible : true
};

$(function (){

    var app = new Vue({
        el: '#app',
        data: { userData: _requests,
        OpenMedia:OpenMedia,
        Playlist:Playlist,
        BackgroundControl:BackgroundControl,
        Home: Home,
        CurrentSong : CurrentSong,
        FindListFor: FindListFor,
        Genres: Genres
        }

     });

    $('.carousel').carousel({
        interval: 2000
    });

    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true
      });

    $("#volumen").slider({
        orientation:"horizontal",
        range: "min",
        max:100,
        value:75,
        slide:function(){
            var volumen = $ ('#volumen').slider("value");
            if(AudioPlayer)
            AudioPlayer.volume(volumen/100);
        },
        change :function(){
            var volumen = $ ('#volumen').slider("value");
            if(AudioPlayer)
            AudioPlayer.volume(volumen/100);
        },

    });

    $('#music_time').slider({
        orientation:"horizontal",
        range: "min",
        max:ProgressSmothness,
        value:0,
        slide:function(){
            
            if(AudioPlayer.player && IsUserMovingTime)
            {
               var position = $('#music_time').slider("value");
               position/=ProgressSmothness;
               var newPosition = Math.floor(position*AudioPlayer.player.duration);
               AudioPlayer.player.currentTime = newPosition; 
            }
            
        },
        change: function(){
            if(AudioPlayer.player && IsUserMovingTime)
            {
               var position = $('#music_time').slider("value");
               position/=ProgressSmothness;
               var newPosition = Math.floor(position*AudioPlayer.player.duration);
               AudioPlayer.player.currentTime = newPosition; 
            }
        },

    });
       
    $("#music_time").mousedown(function (){ IsUserMovingTime = true;});
        
    $(document).mouseup(function ()
        {
            if(IsUserMovingTime)
                setTimeout(function(){
                IsUserMovingTime = false;
            },70
                );
        });
    
    
});
