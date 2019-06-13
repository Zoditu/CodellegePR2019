/* node se divide en:
1.node modules (libreras, aqui se importan, pueden ser propios, terceros, etc)
2.prototyping (declaraciones)
3. to do (codigo)

el objetivo de nodeJS es mas de backend para web services, routines, work flows(rutina pero mas compleja)
Electron NODEJS es para mas aplicaciones de escritorio.
web service: consumir servicios por ejemplo de facebook 
*/ 
var http = require('http'); //Modulo de servicios REST HTTP nodejs

var MusicSongs = require('./music-songs');
var MusicPlaylists = require('./music-playlists');
var MusicUsers = require('./users');
var MusicFavorites = require('./music-favorites');
var EndpointBase = require('./endpoint-base'); //EndpointBase
var MusicUploads = require('./music.uploaded');

const parse = require('url-parse'); //Parser de url/parametros

var MongoClient = require('mongodb')//modulo de mongo
var MongoURL = 'mongodb://localhost:27017/' //URL de Mongo 
var MongoDB;
var ServiceIntegrity = {state: 'OK'};
const GET = 'GET', POST = 'POST', PUT = 'PUT', DELETE = 'DELETE';

MongoClient.connect(MongoURL, {native_parser:true},function(err,db){ //CallBack, llamada de regreso, es async
    if(err) 
    {
        ServiceIntegrity.state = 'ERROR';
        ServiceIntegrity.lastError = err;
        console.log(ServiceIntegrity);
        return;
    }

    MongoDB =db;
    console.log('Succesfully connected to Mongo Client at URL:' + MongoURL);
}); 

http.createServer
(
    async(req,res) =>
    {

        //Revisar la integridad del servicio. ¿Ocurrio algo en el servidor?
        //Detectar Errores, Warnings, Excepciones, etc.
    
        var result = {integrity: '', state: ServiceIntegrity.state };
        if(ServiceIntegrity.state != 'OK')
        {
            //Hay WARNING o ERROR
            if(ServiceIntegrity.state === 'ERROR')
            {
                result.integrity = 'An error ocurred in the server. Please wait for this problem to be fixed';
               
                res.statusCode = 503; //Internal server error
                res.end(JSON.stringify(result));
            }
        }
        var metadata = parse (req.url, true); // nos parsea la url 
        var parameters = metadata.query;
        var endpoint = metadata.pathname;
        var METHOD= req.method;

        //Obtener los metadatos de :
        /*
        *id -> Indica a partir de donde obtiene resultados
        *max -> Limita el numero de resultados 
        *UserId -> Sobre que usuario estamos trabajando 
        */

        var api = new EndpointBase(res,req,MongoDB,result); // es de la clase EndpointBase  
        api.EnableCORSForLocal();
        switch(endpoint)
        {
            case '/music/songs':
            {
                var api = new MusicSongs(res,req,MongoDB,result);//sobreescribio api

                if(METHOD === GET)
                {
                    if(parameters.search)
                        await api.GETBySearch(parameters.search);
                    else if(parameters.id)
                        await api.GetByID(parameters.id);
                }
               
            }
            break;

            case '/music/playlists':
            {
                var api = new MusicPlaylists(res,req,MongoDB,result);//sobreescribio api
                if(METHOD === GET)
                
                    await api.GET(parameters.search)
                
            }
            break;
            
            case'/users':
            {
                var api = new MusicUsers(res,req,MongoDB,result);//sobreescribio api
                if(METHOD === GET)
                {
                    await api.GET(parameters.user);
                }
               
            }
            break;

            case '/music/favorites':
            {
                var api = new MusicFavorites(res,req,MongoDB,result);//sobreescribio api
                if(METHOD === GET)
                {
                    await api.GET();
                }
              
            }


            break;

            case '/music/uploads':
            {
                var api = new MusicUploads(res,req,MongoDB,result);//sobreescribio api
                if(METHOD === GET)
                {
                    await api.GET();
                }
              
            }

            
            break;

            default: api.InvalidateEndpoint(endpoint);
            return;
        }
        api.InvalidateMethod(METHOD);
    }
).listen(667); /*es el puerto*/

//las funciones siempre se ponen abajo
//Habilitar el acceso CORS a servicios locales


//Extraer datos de una peticion diferente a GET
function RequestData(request, whatToDo){
    asyncProcessing= true;
    var requestData = '';
    request.on('data', function (data){
        requestData += data;
    });

    request.on('end',function(){
        whatToDo( requestData );

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
