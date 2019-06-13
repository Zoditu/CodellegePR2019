var http = require('http'); //Modulo de servicios REST HTTP node
var MusicSongs = require('./music-songs');//MusicSongs
var MusicPlaylists = require('./music-playlists');//MusicPlaylists
var MusicFavorites = require('./music-favorites');//MusicFavorites
var MusicUploads = require('./music-uploaded');//MusicUploads
var MusicUsers = require('./users');//Users
var EndpointBase = require('./endpoint-base'); //EndpointBase
const parse = require ('url-parse'); //Parser de url/parametro

var MongoClient = require ('mongodb').MongoClient; //Módulo de Mongo
var MongoURL = 'mongodb://localhost:27017/Codellege'; //URL de Mongo (Default)/DATABASE
var MongoDB;
var ServiceIntegrity = {state : 'OK'};
const GET= 'GET', POST= 'POST', PUT= 'PUT', DELETE= 'DELETE';


MongoClient.connect(MongoURL, {native_parser: true}, function(err,db){ //CallBack
    if(err)
    {
        ServiceIntegrity.state = 'ERROR';
        ServiceIntegrity.lastError = err;
        console.log ( ServiceIntegrity );
        return;
    }
       
    MongoDB = db;
    console.log('Succesfully connected to Mongo Client at URL: ' + MongoURL);
});


//Crear un servidor HTTP
http.createServer
    (
        async(req, res) =>
        {
            //Revisar la integridad del servicio. ¿Ocurrio algo en el servidor?
            //Detectar Errores, Warnings, Excepciones, etc.
            var result = {integrity: '', state: ServiceIntegrity.state};
            if(ServiceIntegrity !=  'OK')
            {
                //Hay WARNING o ERRORES
                if( ServiceIntegrity.state === 'ERROR')
                {
                    result.integrity = 'An error ocurred in the server. Please wait for this problem to be fixed';
                    res.statusCode = 503; //Internal server error
                    res.end(JSON.stringify( result ));
                }
            }

            var metadata = parse( req.url, true);
            var parameters = metadata.query;
            var endpoint = metadata.pathname;
            var METHOD = req.method;

            //Obtener los metadatos de :
            /*
            *id -> Indica a partir de donde obtiene resultados...
            *max -> Limita el número de resultados
            * userId -> Sobre qué usuario estamos trabajando
            */

            
            var api = new EndpointBase( res, req, MongoDB, result );
            api.EnableCORSForLocal();
            switch ( endpoint )
            {
                case '/music/songs':
                {
                    api = new MusicSongs( res, req, MongoDB, result );

                    if(METHOD === GET)
                    {
                        if( parameters.search )
                            await api.GetBySearch( parameters.search );
                        else if( parameters.id )
                            await api.GetById( parameters.id )
                    }
                        
                }
                break;

                case '/music/playlists':
                {
                    api = new MusicPlaylists( res, req, MongoDB, result );

                    if(METHOD === GET)
                        //Buscar canciones
                        await api.GET( parameters.search );
                }
                break;

                case '/users': 
                {
                    api = new MusicUsers( res, req, MongoDB, result );

                    if(METHOD === GET)
                        //Buscar canciones
                        await api.GET( parameters.user );
                    
                }
                break;

                case '/music/favorites':
                {
                    api = new MusicFavorites( res, req, MongoDB, result );

                    if(METHOD === GET)
                        //Buscar canciones
                        await api.GET(); 
                }
                break;

                case '/music/uploads':
                {
                    api = new MusicUploads( res, req, MongoDB, result );

                    if(METHOD === GET)
                        //Buscar canciones
                        await api.GET(); 
                    else
                    api.InvalidateMethod( METHOD );
                }
                break;

                default:
                     api.InvalidateEndpoint( endpoint );
                     return;
            }
            api.InvalidateMethod( METHOD );
        }
).listen(27000);

/*--------------------------------Functions-----------------------------------------*/


//Extraer datos de una peticion diferente a GET

function RequestData (request, whatToDo)
{
    var requestData = '';
    request.on('data',function (data) {
        requestData += data;
    });
    request.on ('end', function () {
        whatToDo( requestData);
    });
}