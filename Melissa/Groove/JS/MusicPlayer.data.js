//node C:\NGINX\nginx-1.14.2\html\Groove\JS\reproductor-service.js

var host = 'http://localhost:27000'; //Host base del servicio de nodejs
var music_users = '/users';
var music_songs = '/music/songs'; //Endpoint 
var music_favorites = '/music/favorites'; //Endpoint
var music_playlists = '/music/playlists'; //Endpoint  
var music_uploads = '/music/uploads'; //Endpoint
const MAX_QUERY = 5;
const USER = 'Mel';
var _requests= 
{
    myFavorites:
    {
        list: 
        {
            name: 'Favorite Tracks',
            songs: []
        },
        endpoint: music_favorites,
        fetchingFromServer : true,
        data: []
    },

    myPlaylists:
    {
        endpoint: music_playlists,
        fetchingFromServer : true,
        data: []
    },

    myUploads:
    {
        endpoint: music_uploads,
        fetchingFromServer : true,
        data: []
    }
};

var Genres = 
{
    types:
    [
        {
            name: 'Rock',
            color: 'black',
        },
        {
            name: 'Pop',
            color: 'pink',
        },
        {
            name: 'Classic',
            color: 'darkcyan',
        },
        {
            name: 'Jazz',
            color: 'red',
        },
        {
            name: 'Country',
            color: 'lightblue',
        },
        {
            name: 'K-pop',
            color: 'hotpink',
        },
        {
            name: 'Reketón',
            color: 'blueviolet',
        }
]};

var Playlist = 
{
    name: 'No Title',
    songs: [],
    description: 'playlist description',
    thumbnail: '',
    owner: 'owner name',
    isLoading: true
};

var endpoints = Object.keys(_requests);
for( var i = 0; i < endpoints.length; i++ )
    {
        var request = _requests[endpoints[ i ]];
        GET
        (
            host,
            request.endpoint,
            { initialid: 0, max: MAX_QUERY, 'x-owner': USER },
            {},
            function( result, error, request)
            {
                //Estoy cargando datos
                if( !result && !error )
                {
                    BackgroundControl.visible = true;
                    if( request )
                    request.fetchingFromServer = true;
                }
                else if( !error )
                {
                    request.fetchingFromServer = false;
                    request.data = JSON.parse( result );
                    BackgroundControl.visible = false;
                }
                else
                {
                    request.data = [];
                    request.error = 'Error';
                    BackgroundControl.visible = false;
                }
            }, 
            request
        );    
    }

    function GetPlaylistSongs( list )
{
    Home.visible = false;
    var ids = list.ids;
    Playlist.name = list.name;
    Playlist.description = list.description;
    Playlist.thumbnail = list.thumbnail;
    Playlist.owner = list.owner;
    Playlist.songs = [];
    if( list.songs )
    {
        Playlist.isLoading = false;
        Playlist.songs = list.songs;
        return;
    }
    Playlist.isLoading = true;
    $.each( ids, function(i, id)
    {
        GET
        (
            host,
            music_songs,
            {}, //headers
            { id: id }, //parameters
            function( result, error, request )
            {
                //Estoy cargando datos
                if( !result && !error )
                {
                    BackgroundControl.visible = true;
                }
                else if( !error )
                {
                    var data = JSON.parse( result );
                    Playlist.songs.push( data.data.result );
                    
                    if( Playlist.songs.length === ids.length )
                        Playlist.isLoading = false;

                    BackgroundControl.visible = false;
                }
                else
                {
                    var data = JSON.parse( result );
                    Playlist.songs.push( data.data.result );

                    if( Playlist.songs.length === ids.length )
                        Playlist.isLoading = false;

                    BackgroundControl.visible = false;
                }
            }, 
            ''
        );   
    });
}

function FindListFor( request, initialID )
{
    GET
        (
            host,
            request.endpoint,
            { initialid: initialID, max: MAX_QUERY, 'x-owner': USER },
            {},
            function( result, error, request)
            {
                //Estoy cargando datos
                if( !result && !error )
                {
                    BackgroundControl.visible = true;
                    if( request )
                        request.fetchingFromServer = true;
                }
                else if( !error )
                {
                    request.fetchingFromServer = false;
                    var favorites = JSON.parse( result );
                    $.each( favorites.data.data, (i, song)=>
                    {
                        request.list.songs.push( song );
                    });

                    if( favorites.data.totalResults === 0 )
                    {
                        BackgroundControl.visible = false;
                        //console.log(JSON.stringify(request.list));
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
                    request.error = 'Error';
                    BackgroundControl.visible = false;
                }
            }, 
            request
        );    
}