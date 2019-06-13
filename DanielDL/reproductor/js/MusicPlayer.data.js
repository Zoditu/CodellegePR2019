var host = 'http://localhost:667'; //Hostbase de servicio de Node JS
var music_users = '/users'; //Endpoint
var music_songs = '/music/songs';
var music_favorites = '/music/favorites';
var music_playlists = '/music/playlists';
var music_uploads = '/music/uploads';
const MAX_QUERY = 5;
const USER = 'Sayra';
// var _requests = [music_songs, music_favorites, music_playlists, music_uploads];
var _requests = 
{
    myFavorites: 
    {
        list:
        {
            name: 'Favorite Tracks',
            songs: []
        },
        endpoint: music_favorites,
        fetchingFromServer: true,
        data: []
    },
    myPlaylists: 
    {
        endpoint: music_playlists,
        fetchingFromServer: true,
        data: []
    },
    myUploads: 
    {
        endpoint: music_uploads,
        fetchingFromServer: true,
        data: []
    },
};

//Cambio
var Genres = 
{
    types: 
    [
        {
            name: 'Rock',
            color: '#173F5F'
        },
        {
            name: 'Pop',
            color: '#20639B'
        },
        {
            name: 'Jazz',
            color: '#3CAEA3'
        },
        {
            name: 'Classic',
            color: 'gray'
        }
    ]
}

var PlayList = 
{
    name: 'Nombre de la playlist',
    description: 'playlist description',
    thumbnail: '',
    owner: 'owner name',
    songs: [],
    isLoading: true
};

var endpoints = Object.keys(_requests);
for (var i = 0; i < endpoints.length; i++) 
{
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

                //Estoy cargando datos.
                if (!result && !error) 
                {
                    BackGroundControl.visible = true;
                    if( request )
                    request.fetchingFromServer = true;
                } 
                else if (!error) 
                {
                    request.fetchingFromServer = false;
                    request.data = JSON.parse( result );
                    BackGroundControl.visible = false;
                }
                else 
                {
                    request.data = [];
                    request.error = "Error";
                    BackGroundControl.visible = false;
                }
            },
            request
        );
}


function GetPlaylistSongs( list )
{
    //Cambio
    Home.visible = false;

    var ids = list.ids;
    PlayList.name = list.name;
    PlayList.description = list.description;
    PlayList.thumbnail = list.thumbnail;
    PlayList.owner = list.owner;
    PlayList.songs = [];
    if( list.songs )
    {
        PlayList.isLoading = false;
        PlayList.songs = list.songs;
        return;
    }
    
    PlayList.isLoading = true;
    $.each( ids, function(i, id) 
    {
        GET
        (
            host,
            music_songs, 
            {}, //Headers
            {id, id}, //Parameters
            function (result, error, request) {

                //Estoy cargando datos.
                if (!result && !error) 
                {
                    BackGroundControl.visible = true;
                } 
                else if (!error) 
                {
                    var data = JSON.parse(result);
                    PlayList.songs.push( data.data.result );
                    if( PlayList.songs.length === ids.length )
                        PlayList.isLoading = false;

                    BackGroundControl.visible = false;
                } 
                else {
                    var data = JSON.parse(result);
                    PlayList.songs.push( data.data.result ); //Canciones con ids no existentes
                    if( PlayList.songs.length === ids.length )
                        PlayList.isLoading = false;

                    BackGroundControl.visible = false;
                }
            },
            request
        );
    });
    
}

function FindListFor( request, initialID )
{
    // request.list.songs = []; SE PASA AL INDEX EN EL BOTON QUE DICE Open playlist
    GET
    (
        host,
        request.endpoint, {
            initialid: initialID,
            max: MAX_QUERY,
            'x-owner': USER
        }, {},
        function (result, error, request) {

            //Estoy cargando datos.
            if (!result && !error) 
            {
                BackGroundControl.visible = true;
                if( request )
                request.fetchingFromServer = true;
            } 
            else if (!error) 
            {
                request.fetchingFromServer = false;
                var favorites = JSON.parse(result);
                $.each( favorites.data.data, ( i, song ) =>
                {
                    request.list.songs.push( song ); 
                });
                                
                if( favorites.data.totalResults === 0) 
                {
                    BackGroundControl.visible = false;
                    GetPlaylistSongs( request.list );
                }
                else 
                {
                    FindListFor( request, favorites.data.lastIndex + 1 );
                }
            } 
            else 
            {
                request.data = [];
                request.error = "Error"; 
                BackGroundControl.visible = false;
            }
        },
        request
    );
}