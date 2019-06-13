var http = require('http'); //Modulo de servicios REST HTTP
const parse = require('url-parse'); //Parser url de parametros

var MongoClient= require('mongodb').MongoClient; //modulo de mongo
var MongoURL='mongodb://localhost:27017/Codellege'; //URL de mongo(default)/DATA BASE
var MongoDB;

MongoClient.connect( MongoURL, { native_parser: true}, function( err, db){
    if (err)
        throw err;

    MongoDB=db;
    console.log('Succesfully connected to Mongo Client at URL:' + MongoURL);
});



//Crear un servidor HTTP    
http.createServer(
    
//Parametros para todas las peticiones HTTP
// Request(peticion), Response (respuesta)

    async (req, res) => //lambda syntax
    {

    //Parametros de todas las peticiones HTTP
    //Request, Response
    if (req.method === 'GET') {
        var params = parse(req.url, true);
        var DatosEncontrados= [ ];

            //Existen los parametros de 'name', 'age' y 'sex'
            var name = params.query.name;
            var age = params.query.age;
            var sex = params.query.sex;

           
            var queryFilter = {};

            if (name)
                queryFilter.name = name;
            if (age)
                query.Filter.edad = parseInt(age);
            if (sex)
                query.Filter.sexo = sex;   
        if (params.pathname === '/codellege/alumnos') 
        {
            var Codellege = await MongoDB.db('Codellege'); //use codellege
            var Alumnos = await Codellege.collection('Alumnos'); //db.alumnos   
             DatosEncontrados= await Alumnos.find(queryFilter).toArray();
           
                
            res.write(JSON.stringify(alumnosEncontrados));

        } 
        else if (params.pathname === '/codellege/maestros') {
            var Codellege = await MongoDB.db('Codellege'); //use codellege
            var Maestros = await Codellege.collection('Maestros'); //db.alumnos   
             DatosEncontrados= await Maestros.find(queryFilter).toArray();

           // res.write(JSON.stringify(maestrosEncontrados));

        }

        else
        {
            res.statusCode= 404
            res.end(JSON.stringify ( {error: 'el endpoint"'+ params.pathname + '"no es valido' } ) );
        }


        res.statusCode = 200;
        res.end(JSON.stringify(DatosEncontrados));

    } else {
        res.statusCode = 405;
        res.end('<h1>Error: No permito</h1>');
    }

}).listen(27000);