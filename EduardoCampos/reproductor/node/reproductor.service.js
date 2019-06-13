/* NODE
---->node modules: modules son para importar librerias(estos pueden ser propias, globales, de terceros, File, NPM)
siempre es la primera parte

----->prototyping: declaraciones

TO DO -----> Codigo

Node se utiliza más para ofrecer
Servicios --> WebServices
Tareas ---> Rutinas
Flujos ----> Código
*/
/*Importar modulo*/
var http = require('http'); //Modulo de servicios REST HTTP node
var MusicSongs = require('./music-songs'); //MusicSongs
const parse = require('url-parse'); //Parser de url/parametros
var MusicPlaylists = require('./music-playlists');//MusicPlaylist   
var MusicUsers = require('./users');//MusicUsers
var EndpointBase = require('./endpoint-base')//EndpointBase
var MusicFavorites = require('./music-favorites');//MusicFavorites
var MusicUploads = require('./music-uploaded');//MusicUploads
var MongoClient = require('mongodb') //Modulo de Mongo
var MongoURL = 'mongodb://localhost:27017' //URL de Mongo(Default)
var MongoDB;
var ServiceIntegrity = {state: 'OK'};
const GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE';

MongoClient.connect(MongoURL, {
    native_parser: true
}, function (err, db) { //CallBack
    if (err) {
        ServiceIntegrity.state = 'ERROR';
        ServiceIntegrity.lastError = err;
        console.log(ServiceIntegrity);
        return;
    }
    MongoDB = db;
    console.log('Succesfully connected to Mongo Client at URL: ' + MongoURL);
});

http.createServer(async (req, res) => {
        //Resvisar la integridad del servicio. ¿Ocurrio algo en el servidor?
        //Detectar Errores, Warnings, Excepciones, etc.
        //var utils = new APIUtils(res, req);
        var result = {integrity: '',state: ServiceIntegrity.state};

        if (ServiceIntegrity.state != 'OK') {
            if (ServiceIntegrity.state === 'ERROR') {
                result.integrity = 'An error ocurred in the server. Plase wait for this problem to be fixed';
                res.statusCode = 503; //Internal server error
                res.end(JSON.stringify(result));
            }
        }
        var metadata = parse(req.url, true);
        var parameters = metadata.query;
        var endpoint = metadata.pathname;
        var METHOD = req.method;
        //Obtener los metadatos de:
        /* 
         * id -> Indica a partir de dondobtiene resultados...
         * max -> Limita el número de resultados
         * userId -> Sobre que usuario estamos trabajando
         */

        var api = new EndpointBase(res, req, MongoDB, result);
        api.EnableCORSForLocal();
        switch (endpoint)
        {
            case '/music/songs':
            {
               var api = new MusicSongs(res, req, MongoDB, result);
                if (METHOD === GET){
                    //Buscar canciones
                    if(parameters.search)
                        await api.GetBysearch(parameters.search);
                    else if(parameters.id)
                        await api.GetByID(parameters.id);
                }   
            }
            break; //fin del case song

            case '/music/playlists':
            {
               var api = new MusicPlaylists(res, req, MongoDB, result);
                if (METHOD === GET)
                {
                    await api.GET(parameters.search);
                }  
            }
            break; //fin del case playlists

            case '/users':
            {
                var api = new MusicUsers(res, req, MongoDB, result);
                if ( METHOD === GET)
                {
                    await api.GET(parameters.user);
                }
            }
            break; //fin del case playlists

            case '/music/favorites':
            {
                api = new MusicFavorites(res, req, MongoDB, result);
                if ( METHOD === GET)
                {
                    await api.GET();
                }
            }
            break; //fin del case favorites

            case '/music/uploads':
            {
                api = new MusicUploads(res, req, MongoDB, result);
                if ( METHOD === GET)
                {
                    await api.GET();
                };
            }
            break; //fin del uploads
            default: 
            api.InvalidateEndpoint(endpoint);
            return;
        }
        api.InvalidateMethod(METHOD);
}).listen(27000);
/* ----------------------------Functions-------------------------------------*/
//Extraer datos de una peticion diferente a GET
function RequestData(request, whatToDo) {
    syncProcessing = true;
    var requestData = '';
    request.on('data', function (data) {
        requestData += data;
    });
    request.on('end', function () {
        whatToDo(requestData);
    });
}
// se va a llamar varias veces
function FinishRequest(response, result,status) // vamos a pasar result 
{
    if(status)
        response.statusCode = status;
    else
        response.statusCode = 200;
    response.end(JSON.stringify(result));
}
