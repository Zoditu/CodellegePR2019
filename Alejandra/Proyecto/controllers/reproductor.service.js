var http = require('http'); //Modulo de servicios REST HTTP
var audios = require('./music'); //Importar informacion de audio
var codellege = require('./codellege'); //Importar informacion de alumnos
const parse = require('url-parse'); //Parser url de parametros

//Crear un servidor HTTP    
http.createServer((req, res) => {

    //Parametros de todas las peticiones HTTP
    //Request, Response
    if (req.method === 'GET') {
        var params = parse(req.url, true);

        if (params.pathname === '/codellege/alumnos') {
            var name = params.query.name;
            var age = params.query.age;
            var gender = params.query.gender;
            var alumnosEncontrados = codellege.alumnos.slice(0);
            if (name) {
                var query = [];
                alumnosEncontrados.forEach(
                    alumno => {
                        if (alumno.nombre.toLowerCase() === name.toLowerCase())
                            query.push(alumno);
                    }

                );
                alumnosEncontrados = query;
            } //Fin del if params.name
            if (age) {
                var query = [];
                alumnosEncontrados.forEach(
                    alumno => {
                        if (alumno.edad === parseInt(age))
                            query.push(alumno);
                    }

                );
                alumnosEncontrados = query;
            } //Fin del if params.age

            if (gender) {
                var query = [];
                alumnosEncontrados.forEach(
                    alumno => {
                        if (alumno.sexo.toLowerCase() === gender.toLowerCase())
                            query.push(alumno);
                    }

                );
                alumnosEncontrados = query;
            } //Fin del if params.gender

            res.write(JSON.stringify(alumnosEncontrados));

        } else if (params.pathname === '/codellege/maestros') {
            var name = params.query.name;
            var age = params.query.age;
            var gender = params.query.gender;
            var maestrosEncontrados = codellege.maestros.slice(0);
            if (name) {
                var query = [];
                maestrosEncontrados.forEach(
                    maestro => {
                        if (maestro.nombre.toLowerCase() === name.toLowerCase())
                            query.push(maestro);
                    }

                );
                maestrosEncontrados = query;
            } //Fin del if params.name
            if (age) {
                var query = [];
                maestrosEncontrados.forEach(
                    maestro => {
                        if (maestro.edad === parseInt(age))
                            query.push(maestro);
                    }

                );
                alumnosEncontrados = query;
            } //Fin del if params.age

            if (gender) {
                var query = [];
                maestrosEncontrados.forEach(
                    maestro => {
                        if (maestro.sexo.toLowerCase() === gender.toLowerCase())
                            query.push(maestro);
                    }

                );
                maestrosEncontrados = query;
            } //Fin del if params.gender

            res.write(JSON.stringify(maestrosEncontrados));

        }

        res.statusCode = 200;
        res.end();

    } else {
        res.statusCode = 405;
        res.end('<h1>Error: No permito</h1>');
    }

}).listen(27000);