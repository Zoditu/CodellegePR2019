var http = require('http'); //Modulo de servicios REST HTTP
var MusicSongs = require('./music.songs');//music songs
var MusicPlaylist = require('./music.playlists'); // music playlist
var MusicFavorites = require ('./music.favorites');
var MusicUploads = require ('./Music.Uploaded');
var MusicUsers = require ('./users');//usuarios 
var EndpointBase = require ('./endpoint.base');//Endpoint
const parse = require('url-parse'); //Parser url de parametros

var MongoClient = require('mongodb').MongoClient; //modulo de mongo
var MongoURL = 'mongodb://localhost:27017/'; //URL de mongo(default)/DATA BASE
var MongoDB;
var ServiceIntegrty = 
{
    state: 'ok'
};
const GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE';

var asyncProcessing = false;

MongoClient.connect(MongoURL, {
    native_parser: true
}, function (err, db) {
    if (err) {
        ServiceIntegrty.state = 'ERROR';
        ServiceIntegrty.lastError = err;
        console.log(ServiceIntegrty);
        return;
    }


    MongoDB = db;
    console.log('Succesfully connected to Mongo Client at URL:' + MongoURL);
});
//Crear un servidor HTTP    
http.createServer(

//Parametros para todas las peticiones HTTP
// Request(peticion), Response (respuesta)

async (req, res) => //lambda syntax       //Parametros de todas las peticiones HTTP
    //Request, Response
    {
       
        var result = {integrity: '',state: ServiceIntegrty.state  };
            
        if (ServiceIntegrty.state != 'OK'); {

            if (ServiceIntegrty.state === 'ERROR')

            {
                result.integrity = ' ah error ocurred in the server. Please wait for this problem to be fixed';
                res.statusCode = 503;
                res.end(JSON.stringify(result));
            }
        }
        var metadata = parse(req.url, true);
        var parameters = metadata.query;
        var endpoint = metadata.pathname;
        var METHOD = req.method;
        //obtener los metadatos de:
        /* 
         *id = indica a partir de donde obtuviste los resultados
         * max =limita la busqueda de resultados
         *USERID= SOBRE EL USUARIO QUE ESTAMOS TRABAJANDO
         */

        var api= new EndpointBase (res,req,MongoDB,result);
        api.EnableCORSForLocal();
        
        switch (endpoint) {
            case '/music/songs':
                {
                    api= new MusicSongs(res, req, MongoDB, result);
                    if (METHOD === GET) {
                        if(parameters.search)
                            await api.GetBySearch(parameters.search);
                        else if (parameters.id)
                            await api.GetByID(parameters.id);
                    }
                } //fin de songs

                break;

            case '/music/playlists':
                {
                  api = new MusicPlaylist(res, req,MongoDB,result);
                    if (METHOD === GET) 
                        await api.GET (parameters.search);
                } //fin de playlist
                break;

             case '/users':
                {
                api = new MusicUsers (res, req, MongoDB,result);   
                if (METHOD === GET) 
                await api.GET (parameters.user);
                } // fin de users 
                break;  

            case '/music/favorites':
                {
                api = new MusicFavorites (res, req, MongoDB,result);
                if (METHOD === GET)
                await api.GET (parameters.search);
                }
                break;
            case '/music/uploads':
                {
                api = new MusicUploads (res, req, MongoDB,result);
                if (METHOD === GET)
                await api.GET (parameters.search);
                }
                break;

        default: api.InvalidateEnpoint (endpoint);
        return; 
    } //fin del switch 
    api.InvalidateMethod (METHOD);
}).listen(27000);
/*------------------------------ funciones -----------------------*/
function RequestData(request, whatToDo)
 {
    asyncProcessing = true;
    var requestData = '';
    request.on('data', function (data) 
    {
        requestData += data;
    });

    request.on('end', function () 
    {
        whatToDo(requestData);

    });
}

