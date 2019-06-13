var EndpointBase = require('./endpoint-base');

class MusicFavorites extends EndpointBase{
    constructor(response, request, mongo, result) {
        super(response, request, mongo, result);
    }

    async GET(){
       if(!this.CheckHeaders('initialid', 'max', 'x-owner'))
        return;

        var initialid = parseInt(this.headers.initialid);
        var max = parseInt(this.headers.max);
        var user = this.headers['x-owner'];

        if (max <= 0 || initialid < 0) {
            
            this.Result.data = {
                message: 'Invalid data type for max initial id header',
                error: '"max" or "initialid" headers are requiered to be an integer',
                result: 'ERROR'
            };
            this.Status = 412;
            this.FinishRequest();
            return;
        }

        var owner = await this.SingleQueryDatabase(
            'MusicPlayer',
            'Users', {
                owner: {
                    $regex: '^' + this.ToRegex(user) + '$'
                }
            }
        );

        if (owner == null) {
            this.result.data = {
                message: 'User: "' + user + '" does not exist',
                error: 'User not found',
                result: 'WARNING'
            };
            this.status = 404;
            this.FinishRequest();
            return;
        }

        owner.favorites.sort((a,b) => a -b);

        var $or = [];
        var cancionesABuscar = {
            $and: [{ id: { $gte: initialid } } ]
        };
        var count = 0;
        var lastIndex = 0;

        for(var i=0; i < owner.favorites.length; i++) {
            var id = owner.favorites[i];
            //lastIndex = id;

            if (count < max) { 
                if(id >= initialid){
                $or.push({ id: id });
                count++
                }
            }
        }

        if($or.length < 1){
            this.Result.data = {
                message: 'Query all favorite tracks for user' + user,
                lastIndex: lastIndex,
                totalResults: 0,
                data: []
            };
            this.Status = 200;
            this.FinishRequest();
            return;
        }
        cancionesABuscar.$and.push( {$or: $or });

        /*if (lastIndex === owner.favorites.length - 1){ 
            lastIndex = owner.favorites.length;
        }*/

        var canciones = await this.QueryDatabase(
            'MusicPlayer',
            'Audio',
            cancionesABuscar,
            {id: 1},
        );

        if(canciones.length > 0)
        {
            lastIndex = canciones[canciones.length - 1].id;
        }

        this.result.data = {
            message: 'Query all favorite tracks for user' + user,
            lastIndex: lastIndex,
            totalResults: canciones.length,
            data: canciones
        };
        this.Status = 200;
        this.FinishRequest();
        return;
    }
}
module.exports = MusicFavorites;