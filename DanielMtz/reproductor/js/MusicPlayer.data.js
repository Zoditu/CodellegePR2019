var host = 'http://localhost:27001'; //Host base del servicio de NodeJS
var music_users = '/user'; //Endpoint
var music_songs = '/music/songs'; //Endpoint
var music_favorites = '/music/favorites'; //Endpoint
var music_playlists = '/music/playlists'; //Endpoint
var music_uploads = '/music/uploads'; //Endpoint
const MAX_QUERY = 5;
const USER = 'danmarlo';
var _requests = {
   myFavorites: {
      list: {
         name: 'Favorite Tracks',
         songs: []
      },
      endpoint: music_favorites,
      fetchingFromServer: true,
      data: []
   },
   myPlaylists: {
      endpoint: music_playlists,
      fetchingFromServer: true,
      data: []
   },
   myUploads: {
      endpoint: music_uploads,
      fetchingFromServer: true,
      data: []
   }
}
var Playlist = {
   name: 'Selecciona una Playlist',
   description: 'La descripcion de tu playlist!',
   thumbnail: '',
   owner: 'Creador de la Playlist',
   songs: [],
   isLoading: true    
}

var Genres = 
{  
   types: [   
   {
      name: 'Rock',
      color: 'black'
   },
   {
      name: 'Pop',
      color: 'darkmagenta'
   },
   {
      name: 'Jazz',
      color: 'darkslateblue',
   },
   {
      name: 'Classic',
      color: 'silver'
   },
   {
      name: 'K-Pop',
      color: 'deeppink',
   },
   {
      name: 'Metal',
      color: 'darkred',
   },
   {
      name: 'Folklorica',
      color: 'green',
   }
   ]

}
//Traer los datos principales por default(My songs, Favorites, Playlist... MAX 5)
//Buscar datos es asíncrono
//Traer My Songs
var endpoints = Object.keys(_requests);

for (var i = 0; i < endpoints.length; i++) {
   var request = _requests[endpoints[i]];
   GET
      (
         host,
         request.endpoint, {
            initialid: 0,
            max: MAX_QUERY,
            'x-owner': USER
         }, {},
         function (result, error, request) {
            //Estoy cargando datos
            if (!result && !error)

            {
               BackgroundControl.visible = true;
               if (request)
                  request.fetchingFromServer = true;
            } else if (!error) {
               request.fetchingFromServer = false;
               request.data = JSON.parse(result);
               BackgroundControl.visible = false;
            } else {
               request.data = []
               request.error = 'Error';
               BackgroundControl.visible = false;
            }
         },
         request
      );
}

function GetPlaylistSongs(list) {
   Home.visible = false;
   var ids = list.ids;
   Playlist.songs = [];
   Playlist.name = list.name;
   Playlist.description = list.description;
   Playlist.thumbnail = list.thumbnail;
   Playlist.owner = list.owner;
   if(list.songs){
      Playlist.songs = list.songs;
      return;
   }
   
   Playlist.isLoading = true;
   $.each(ids, function (i, id) {
      GET
         (
            host,
            music_songs, {}, {
               id: id
            },
            function (result, error, request) {
               //Estoy cargando datos
               if (!result && !error)

               {
                  BackgroundControl.visible = true;

               } else if (!error) {

                  var data = JSON.parse(result);

               
                  Playlist.songs.push(data.data.result);
                  if (Playlist.songs.length === ids.length)
                     Playlist.isLoading = false;
                  BackgroundControl.visible = false;
               } else {
                  var data = JSON.parse(result);
                  Playlist.songs.push(data.data.result);
                  if (Playlist.songs.length === ids.length)
                     Playlist.isLoading = false;
                  BackgroundControl.visible = false;
               }
            },
            request
         );
   });
}

function FindListFor(request, initialID) {

   GET
      (
         host,
         request.endpoint, {
            initialid: initialID,
            max: MAX_QUERY,
            'x-owner': USER
         }, {},
         function (result, error, request) {
            //Estoy cargando datos
            if (!result && !error)

            {
               BackgroundControl.visible = true;
               if (request)
                  request.fetchingFromServer = true;
            } else if (!error) {
               request.fetchingFromServer = false;

               var favorites = JSON.parse(result);

               $.each(favorites.data.data, (i, song) => {
                  request.list.songs.push(song);
               });
               if (favorites.data.lastIndex === 0) {
                  BackgroundControl.visible = false;
                  GetPlaylistSongs(request.list);
               } else {

                  FindListFor(request, favorites.data.lastIndex + 1)
               }
            } else {
               request.data = []
               request.error = 'Error';
               BackgroundControl.visible = false;
            }
         },
         request
      );
}