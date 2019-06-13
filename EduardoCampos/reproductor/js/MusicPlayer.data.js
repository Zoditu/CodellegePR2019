var host = 'http://localhost:27000';//Host base del servicio de NodeJS
var music_users = '/user';//Endpoint
var music_songs = '/music/songs';//Endpoint
var music_favorites = '/music/favorites';//Endpoint
var music_playlists = '/music/playlists';//Endpoint
var music_uploads = '/music/uploads';//Endpoint
const MAX_Query = 5;
const USER = 'campos';
var _requests = 
{
   myFavorites: 
   {
      list: 
      {
         name: 'Favorite Tracks',
         songs:[]
      },
      endpoint:music_favorites,
      fetchingFromServer: true,
      data: []
   },
   myPlaylists: 
   {
      endpoint:music_playlists,
      fetchingFromServer: true,
      data: []
   },
   myUploads: 
   {
      endpoint:music_uploads,
      fetchingFromServer: true,
      data: []
   }
}
var Genres = //
{
   types:
   [
      {
         name: 'Rock',
         color: 'black'//aqui se cambia el color que tendra cada badge
      },
      {
         name: 'Pop',
         color: 'blue'//aqui se cambia el color que tendra cada badge
      },
      {
         name: 'Jazz',
         color: 'peru'//aqui se cambia el color que tendra cada badge
      },
      {
         name: 'Regional Mexicano',
         color: 'springgreen'//aqui se cambia el color que tendra cada badge
      },
      {
         name: 'Clasica',
         color: 'darkmagenta'//aqui se cambia el color que tendra cada badge
      },
      {
         name: 'K-Pop',
         color: 'pink'//aqui se cambia el color que tendra cada badge
      },
   ]
};
var Playlist = { 
   name: 'unnamed playlist',
   description: 'playlist description',
   thumbnail: '',
   owner: 'owner name',
   songs: [],
   isLoading: true
}
//Traer los datos principales por default(My songs, Favorites, Playlist... MAX 5)
//Buscar datos es asíncrono
//Traer My Songs
var endpoints = Object.keys(_requests);
for(var i = 0; i < endpoints.length; i++)
{
   var request = _requests[endpoints[i]];
   GET
   (
      host,
      request.endpoint,
      {initialid:0, max: MAX_Query, 'x-owner': USER},
      {},
      function( result, error, request ) 
      {
          //Estoy cargando datos
          if (!result && !error)

         {
            BackgroundControl.visible = true;
            if(request)
            request.fetchingFromServer = true;
         }
         else if(!error)
         {
            request.fetchingFromServer = false;
            request.data =  JSON.parse(result);
            BackgroundControl.visible = false;
         }
         else
         {
            request.data = []
            request.error = 'Error';
            BackgroundControl.visible = false;
         }
      },
      request
   );
}

function GetPlaylistSongs(list){
   Home.visible = false;
   var ids = list.ids;
   Playlist.name = list.name;
   Playlist.description = list.description;
   Playlist.thumbnail = list.thumbnail;
   Playlist.owner = list.owner;
   Playlist.songs = [];
   if(list.songs)
   {
      Playlist.isLoading = false;
      Playlist.songs = list.songs;
      return;
   }

   Playlist.isLoading = true;
   $.each(ids, function(i, id) {
      GET
      (
         host,
         music_songs,
         {},
         {id: id},
         function( result, error, request ) 
         {
             //Estoy cargando datos
             if (!result && !error)
   
            {
               BackgroundControl.visible = true;
         
            }
            else if(!error)
            {
               
               var data =  JSON.parse(result);
               Playlist.songs.push(data.data.result);
               if(Playlist.songs.length === ids.length)
                  Playlist.isLoading = false;

               BackgroundControl.visible = false;
            }
            else
            {
               var data = JSON.parse(result);
               Playlist.songs.push( data.data.result );
               if(Playlist.songs.length === ids.length)
                  Playlist.isLoading = false;
               BackgroundControl.visible = false;
            }
         },
         ''
      );
   });
}

function FindListFor(request, initialID)
{
  
   GET
   (
      host,
      request.endpoint,
      {initialid:initialID, max:MAX_Query, 'x-owner': USER},
      {},
      function( result, error, request ) 
      {
          //Estoy cargando datos
          if (!result && !error)

         {
            BackgroundControl.visible = true;
            if(request)
            request.fetchingFromServer = true;
         }
         else if(!error)
         {
            request.fetchingFromServer = false;
            var favorites =  JSON.parse(result);
           $.each(favorites.data.data, (i, song)=>{
              request.list.songs.push(song);
              console.log(JSON.stringify(favorites));
           });
           
            //songs = request.data.data.data;
            if(favorites.data.totalResults === 0)
            {
               BackgroundControl.visible = false;
               GetPlaylistSongs(request.list);
            }
            else
            {
               FindListFor(request, favorites.data.lastIndex + 1);
            }

         }
         else
         {
            request.data = []
            request.error = 'Error';
            BackgroundControl.visible = false;
         }
      },
      request
   );
}