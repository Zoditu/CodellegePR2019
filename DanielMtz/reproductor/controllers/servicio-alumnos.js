var http = require('http'); //Modulo de servicios REST HTTP
const parse = require('url-parse'); //Parser url de parametros

var MongoClient = require('mongodb').MongoClient; //Modulo de Mongo
var MongoURL = 'mongodb://localhost:27017/Codellege'; //URL de Mongo  (Default) DATABASE
var MongoDB;

MongoClient.connect(MongoURL, {
        native_parser: true
    },
    function (err, db) {
        if (err) throw err;
        MongoDB = db;
        console.log('Succesfully connected to Mongo Client at URL: ' + MongoURL);
    });
//Crear un servidor HTTP    
http.createServer(
    async (req, res) => { //Lambda Sytax

        //Parametros de todas las peticiones HTTP
        //Request, Respons
        //=> = function () 
        if (req.method === 'GET') {
            EnableCORSForLocal(res);
            var params = parse(req.url, true);

            var datosEncontrados = [];

            var name = params.query.name;
            var age = params.query.age;
            var gender = params.query.gender;
            var queryFilter = {}; //db.Alumnos.find({});

            if (name)
                queryFilter.nombre = name;
            if (age)
                queryFilter.edad = (age);
            if (gender)
                queryFilter.sexo = gender;

            if (params.pathname === '/codellege/alumnos') {

                var Codellege = await MongoDB.db('Codellege'); //use Codellege
                var alumnos = await Codellege.collection('Alumnos'); //db Alumnos
                datosEncontrados = await alumnos.find(queryFilter).project({
                    _id: 0
                }).toArray();


            } else if (params.pathname === '/codellege/maestros') {
                var Codellege = await MongoDB.db('Codellege'); //use Codellege
                var maestros = await Codellege.collection('Maestros'); //db Maestros
                datosEncontrados = await maestros.find(queryFilter).project({
                    _id: 0
                }).toArray();
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    error: 'El endpoint: "' + params.pathname + '" no es valido'
                }));
            }

            res.statusCode = 200;
            res.end(JSON.stringify({result: datosEncontrados}));

        } else {
            res.statusCode = 405;
            res.end(JSON.stringify({
                error: 'Error no permito el metodo: ' + req.method
            }));
        }

    }).listen(27000);

    function EnableCORSForLocal(res){
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
    }