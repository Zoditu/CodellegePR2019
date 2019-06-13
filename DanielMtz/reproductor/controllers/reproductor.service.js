var http = require('http'); //Modulo de servicios REST HTTP
const parse = require('url-parse'); //Parser url de parametros
var MusicSongs = require('./music-songs');
var MusicPlaylists = require('./music-playlists');
var MusicUsers = require('./user');
var MusicFavorites = require('./music-favorites');
var MusicUploads = require('./music-uploaded');
var EndpointBase = require('./endpoint-base');
var MongoClient = require('mongodb').MongoClient; //Modulo de Mongo
var MongoURL = 'mongodb://localhost:27017'; //URL de Mongo  (Default) DATABASE

var MongoDB;
var serviceIntegrity = {
    state: 'OK'
};
const GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE';

MongoClient.connect(MongoURL, {
        native_parser: true
    },
    function (err, db) {
        if (err) {

            serviceIntegrity.state = 'ERROR';
            serviceIntegrity.lastError = err;
            console.log(serviceIntegrity);
            return;
        }
        MongoDB = db;
        console.log('Succesfully connected to Mongo Client at URL: ' + MongoURL);
    });

//Crear un servidor HTTP    
http.createServer(async (req, res) => {

    var result = {
        integrity: '',
        state: serviceIntegrity.state
    };
    if (serviceIntegrity.state != 'OK') {

        //Revisa la integridad del servicio
        //Detecta errores, warnings, excepciones, etc.
        if (serviceIntegrity.state === 'ERROR') {
            result.integrity = 'An error has occured in the server, please wait while this error is fixed';
            res.statusCode = 503; //Internal server error
            res.end(JSON.stringify(result));

        }
    }

    var metadata = parse(req.url, true);
    var parameters = metadata.query;
    var endpoint = metadata.pathname;
    var METHOD = req.method;
    

    var api = new EndpointBase(res, req, MongoDB, result);
    api.EnableCORSForLocal();

    switch (endpoint) {
        case '/music/songs':
            {
                api = new MusicSongs(res, req, MongoDB, result);
                if (METHOD === GET) {
                    if(parameters.search)
                        await api.GetBySearch(parameters.search);
                    else if(parameters.id)
                        await api.GetByID(parameters.id);
                }
            }
            break; //Fin del Case

        case '/music/playlists':
            {
                api = new MusicPlaylists(res, req, MongoDB, result);
                if (METHOD === GET) {
                
                  await  api.GET(parameters.search);
                
                } //Fin del GET
            }
            break; //Fin del Case Playlists
           
        case '/users':
            {
                api = new MusicUsers(res, req, MongoDB, result);
                if (METHOD === GET) {
                
                  await  api.GET(parameters.user);
                
                } //Fin del GET
               
            }
            break; //Fin del Case Users

        case '/music/favorites':
            {
                api = new MusicFavorites(res, req, MongoDB, result);
                if (METHOD === GET) {
                  await api.GET(parameters.search);
                }
            }
            break;

            case '/music/uploads':
            {
                api = new MusicUploads(res, req, MongoDB, result);
                if (METHOD === GET) {
                  await api.GET();
                }
            }
            break;
        
        default: 
        api.InvalidateEndpoint(endpoint);
        return;
        
           
    } //Fin del Switch  

 api.InvalidateMethod(METHOD);
}).listen(27001);



function RequestData(request, whatToDo) {
    var requestData = '';
    request.on('data', function (data) {
        requestData += data;
    });

    request.on('end', function () {
        whatToDo(requestData);
    });
}


