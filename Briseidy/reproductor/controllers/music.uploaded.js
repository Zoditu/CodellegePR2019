var EndpointBase = require('./endpoint-base');

class MusicUploads extends EndpointBase
{
    constructor(response,request,mongo,result)
    {
        super(response,request,mongo,result);
    }
    async GET()
    {
        if(!this.CheckHeaders('initialid','max','x-owner'))
        return;
        var initialid = parseInt(this.headers.initialid);
        var max = parseInt(this.headers.max);
        var user = this.headers['x-owner'];

        if(max <= 0 || initialid < 0 )
        {
        //Error
        this.result.data = //Result es con mayuscula porque ya no estamos en el archivo de utils
        {
            message:'Invalid data type for max|initialid header.',
            warning:'"max" or "initial" headers are required to be an integer',
            result: 'ERROR'
        }
        this.status  = 412;
        this.FinishRequest();
        return;
        }

        var uploads = await this.SingleQueryDatabase
        (
            'MusicPlayer',
            'Uploads',
            
                {owner :{$regex: '^' + this.ToRegex(user)+ '$'}} //filtro,aquellos donde el owner 
            
        );
        if(uploads == null)
        {
            this.result.data = //Result es con mayuscula porque ya no estamos en el archivo de utils
            {
                message:'No records found for user:' +user,
                warning:'No uploads for this user',
                result: {}
            } 
            this.status  = 404;
            this.FinishRequest();
            return;
        } 
        var $or = [] ;
        var cancionesABuscar =
        {
            $and:
            [
                {id:{ $gte: initialid } } //cuyo id sea mayor o igual a initialid
            ]
    
        };
        var count =0;
        var lastIndex = 0;

        for(var i = 0;i< uploads.songs.length; i++)
        {
            var id = uploads.songs[i]; // contiene el primer id de la favorita 
            lastIndex = id;
            if(count < max) //inicialmente count=0 
            {
                if (id >= initialid)
                {
                    $or.push({id: id});
                    count++;
                }
            }
        else // si ya acabo de meter las canciones salte del for 
        {
            break;
        }
        }
        if($or.length<1)
        {
        this.result .data =
            {
                message:'Query all uploaded tracks for user' + user,
                lastIndex:lastIndex,
                totalResults: 0,
                 data:[]
            };
        this.status = 200;
        this.FinishRequest();
        return;
        }
        cancionesABuscar.$and.push({$or:$or});
    
    //$and: [{id...}, {$or }]
    if(lastIndex === uploads.songs.length-1) // si el ultimo indice 
        lastIndex = uploads.songs.length; // a lastindex asignale el tamaño del arreglo 

    var canciones = await this.QueryDatabase
    (
        'MusicPlayer',
        'Audio',
        cancionesABuscar,
        {id:1},
        max
    );

    this.result .data =
    {
        message: 'Query all uploaded tracks for user' + user,
        lastIndex: lastIndex,
        totalResults:canciones.length,
        data:canciones
    };
        this.status = 200;
        this.FinishRequest();
    }
}
module.exports = MusicUploads;