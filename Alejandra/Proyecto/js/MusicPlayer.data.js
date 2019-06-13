var host= 'http://localhost:27000'; //host base de servicio de NODEjs
var music_users = '/users';
var music_songs = '/music/songs';
var music_favorites = '/music/favorites';
var music_playlists = '/music/playlists';
var music_uploads = '/music/uploads';
const MAX_QUERY = 5; 
const USER = 'ale';
var _requests = {

    myFavorites :
    {
        list :{name: 'Favorite Tracks', songs:[]
        },
        endpoint: music_favorites,
        fetchingFromServer: true,
        data:[]
    },
    myPlaylists :
    {
        endpoint: music_playlists,
        fetchingFromServer: true,
        data:[]
    },
    myUploads :
    {
        endpoint:music_uploads,
        fetchingFromServer: true,
        data:[]
    }

};

var Genres = 
{
    types:
    [
        {
            name: 'rock',
            color: 'black'
        },
        {
            name: 'Pop',
            color: 'darkslateblue'
        },
        {
            name: 'Jazz',
            color: 'darkmagenta'
        },
        {
            name: 'Disco',
            color: 'darkcyan'
        },
        {
            name: 'Ska',
            color: 'darkgreen'
        },
        {
            name: 'K-pop',
            color: 'deeppink'
        }
    ]    
}

var Playlist = {
    name: 'Unnamed playlist',
    description:'playlistdescription',
    thumbnail:'',
    owner:'owner name',
    songs:[],
    isLoading: false
};


//traer los datos principales 
var endpoints = Object.keys ( _requests);

 for (var i = 0; i<endpoints.length; i++)
{ 
    var request = _requests [endpoints[i]];
    
       
        GET (
            host,
            request.endpoint,
            {initialid:0, max: MAX_QUERY, 'x-owner': USER},
            {},
            function (result,error,request)
            {
                //estoy cargando
                if (!result && !error)
                {
                    BackgroundControl.visible = true; 
                    if (request)
                    request.fetchingFromServer = true;
                } 
                else if (!error)
                {
                request.fetchingFromServer = false;
                request.data = JSON.parse(result);
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
function GetPlaylistSongs(list)
{
    Home.visible = false;
    var ids =list.ids;
    Playlist.name = list.name;
    Playlist.description = list.description;
    Playlist.thumbnail = list.thumbnail;
    Playlist.owner =  list.owner;
    Playlist.songs = [];
   
    if(list.songs)
    {
        Playlist.isLoading = false;
        Playlist.songs= list.songs;
        return;
    }

    Playlist.isLoading = true;
    $.each(ids,function (i, id)
    {
        GET (
            host,
            music_songs,
            {},
            {id: id},
            function (result,error,request)
            {
                //estoy cargando
                if (!result && !error)
                {
                    BackgroundControl.visible = true; 
                } 
                else if (!error)
                {
                    var data = JSON.parse(result);

                    Playlist.songs.push (data.data.result); 
                    if (Playlist.songs.length === ids.length)
                        Playlist.isLoading=false;

                    BackgroundControl.visible = false;
                    
                }
                else
                {
                    var data = JSON.parse(result);
                    Playlist.songs.push(data.data.result);
                    if (Playlist.songs.length === ids.length)
                    Playlist.isLoading=false;

                    BackgroundControl.visible= false;
                }
            },
            request
      );
    });
}

function FindListFor(request, initialID){
   
    GET (
        host,
        request.endpoint,
        {initialid: initialID, max: MAX_QUERY, 'x-owner': USER},
        {},
        function (result,error,request)
        {
            //estoy cargando
            if (!result && !error)
            {
                BackgroundControl.visible = true; 
                if (request)
                request.fetchingFromServer = true;
            } 
            else if (!error)
            {
                request.fetchingFromServer = false; 

                var favorites = JSON.parse(result);
                $.each(favorites.data.data, (i,song)=>
                {
                    request.list.songs.push(song);
                });
                 // songs = request.data.data.data;
                if (favorites.data.totalResults === 0)
                {
                    BackgroundControl.visible = false;
                    GetPlaylistSongs(request.list);
                }
                else { 
                    FindListFor(request, favorites.data.lastIndex + 1);
                }
                
            }
            else
            {
                request.data= [];
                request.error = 'ERROR'
                BackgroundControl.visible= false;
            }
        },
        request
  );
}