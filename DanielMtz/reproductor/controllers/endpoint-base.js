class EndpointBase {
    

    constructor(response, request, MongoDB, result){

        this.response = response;
        this.request = request;
        this.headers = request.headers;
        this.result = result;
        this.stauts = 200;
        this.mongo = MongoDB;

    }
    get MongoDB(){
        return this.mongo;
    }

    get Result(){
        return this.result;
    }
    get Status(){
        return this.status;
    }
    set Result (value){ 
        this.result = value;
    }
    set Status(value){
        this.status = value;
    } 
    set MongoDB(value){
        this.mongo = value;
    }
    

    CheckHeaders (...headers){

        var _headers = this.headers;
        
        for( var i = 0; i < headers.length; i++ ){

            var header = headers[i];

            if(!_headers[header]){
                this.result.data = {
                    message: 'Invalid endpoint request',
                    error: 'Invalid headers on sent request.' + header + 'not defined',
                    result: 'ERROR'
                }//Result Data HEADERS ERROR
                this.status = 412;
                this.FinishRequest();
                return false;
            }//Fin del if !_headers

        }//Fin del for headers.length

        return true;
    }//Fin de la clase CheckHeaders
   async  QueryDatabase(db, collection, filter, sort, limit){
    
        var db = await this.mongo.db(db);
       
        var collection = await db.collection(collection);

        var data = await collection.find(filter);

            if(sort){
                await data.sort(sort);
            }
                
            if(limit){
                 await data.limit(limit);
            }
     return await data.toArray();
    }

    async  SingleQueryDatabase(db, collection, filter){
    
        var db = await this.mongo.db(db);
       
        var collection = await db.collection(collection);

        var data = await collection.findOne(filter);

        return await data;
    }
    
   InvalidateMethod(METHOD){
        if(METHOD === 'OPTIONS')
        {
            var headers = {};
            headers["Access-Control-Allow-Origin"] = "*";
            headers["Access-Control-Allow-Methods"] = "OPTIONS, GET";
            headers["Access-Control-Allow-Credentials"] = false;
            headers["Access-Control-Allow-Max-Age"] = '86400';
            headers["Access-Control-Allow-Headers"] = 
            "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, initialid, max, x-owner";
            this.response.writeHead(200, headers);
            this.response.end();
            return;
        }
        this.result.data = {
            message: 'Invalid Endpoint Request.',
            error: 'The Endpoint does not support the method: "' + METHOD + '"',
            result: 'ERROR'
        }
        this.status = 405;
        this.FinishRequest();
    }

    InvalidateEndpoint(endpoint){
        this.result.data = {
            message: 'El endpoint: "'+ endpoint + '"no es valido',
            result: {}
        };
        this.status = 404;
        this.FinishRequest();
    }

    //CheckHeaders('initialid');
    //CheckHeaders('initialid', 'max');
    //CheckHeaders('initialid', 'max', 'x-owner');
    
    FinishRequest() {
        this.response.statusCode = this.status;
        this.response.end(JSON.stringify(this.result));
    }//Finish Request

    toRegex(text) {
        var regex = '';
        text = text.trim();
        for (var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            if (c == ' ')
                regex += '\\s*';
            else
                regex += '[' + c.toUpperCase() + c.toLowerCase() + ']';
        }
        return regex;
    }

    EnableCORSForLocal() {
        this.response.setHeader('Content-Type', 'application/json');
        this.response.setHeader('Access-Control-Allow-Origin', '*');
        this.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        this.response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
        this.response.setHeader('Access-Control-Allow-Credentials', true);
    }

}

//APIUtils.
module.exports = EndpointBase;