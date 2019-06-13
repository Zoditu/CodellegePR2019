var http = require ('http');

http.createServer( (req, res) => {
        res.write( '<h1>Hola Mundo uwu </h1>');
        res.end()
 })   .listen(27000);

    
