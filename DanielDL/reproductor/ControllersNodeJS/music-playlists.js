var EndpointBase = require('./endpoint-base');

class MusicPlaylists extends EndpointBase
{
    constructor( response, request, mongo, result )
    {
        super( response, request, mongo, result );
    }

    async GET( search )
    {
        if( !this.CheckHeaders( 'initialid','max') )
            return;

        var max = parseInt(this.headers.max);
        var initialid = parseInt(this.headers.initialid);
        var user = this.headers['x-owner'];

        if(max <= 0 || initialid < 0 )
        {
            //Error
            this.result.data = 
            {
                message: 'Invalid data type for max header',
                error: '"max" or "initialid" headers are required to be an integer',
                result: 'ERROR'
            }
            this.status = 412;
            this.FinishRequest();
            return;
        }

        if(search) //http:/localhost:27000/music/playlist?=search=La+carnita+asada
        {
            search = this.ToRegex (search);
            var lists = await this.QueryDataBase
            (
                'MusicPlayer',
                'Playlists',
                {
                    $and:
                    [
                        {id: { $gte : initialid } },
                        { name:  {$regex: '.*' + search + '.*'} }
                    ]
                },
                { id:1 },
                max
            );

            var lastIndex = 0;
            if (lists.length > 0)
                lastIndex = lists [lists.length - 1].id;

            this.result.data = 
            {
                message: 'Succesful request query for "Search"',
                lastIndex : lastIndex,
                totalResults: lists.length,
                result: lists
            };
            this.status = 200;
            this.FinishRequest();
        }
        else
        {
            if(!this.headers['x-owner'])
            {
                this.result.data = 
                {
                    message: 'Invalid user playlist query',
                    warning: '"x-owner" header is required to perform this query',
                    result: 'WARNING'
                }
                this.status = 412;
                this.FinishRequest();
                return;
            }   
            else
            {
                var owner = await this.SingleQueryDataBase
                (
                    'MusicPlayer',
                    'Users',
                    { owner: { $regex: '^' + this.ToRegex( user ) + '$' } }
                );

                if( owner == null )
                {
                    this.result.data = 
                    {
                        message: 'User incongruency. User does not exist',
                        warning: 'User not found',
                        result: 'WARNING'
                    }
                    this.status = 404;
                    this.FinishRequest ();
                    return;
                }
                var $or = [];
                var cancionesABuscar = 
                {
                    $and:
                    [
                        { id: { $gte: initialid } }
                    ]
                };
                var count = 0;
                var lastIndex = 0;

                for(var i = 0; i < owner.playlist.length; i++)
                {
                    var id = owner.playlist[i];
                    lastIndex = id;
                    if(count < max )
                    {
                        if(id >= initialid )
                        {
                            $or.push({ id: id});  
                            count++;
                        }
                    }
                    else
                    {
                        break;
                    }
                }

                if($or.length < 1)
                {
                    this.result.data = 
                    {
                        message: 'Query all playlists for user ' + user,
                        lastIndex: lastIndex,
                        totalResults: 0,
                        data: []
                    };
                    this.status = 200;
                    this.FinishRequest();
                    return;
                }
                cancionesABuscar.$and.push( { $or: $or } );
                //$and: [ { id... }, {$or: [ { id: 2}, { id: 3} ] } ]
                
                if( lastIndex === owner.favorites.length - 1)
                    lastIndex = owner.favorites.length

                var canciones = await this.QueryDataBase
                (
                    'MusicPlayer',
                    'Playlists',
                    cancionesABuscar,
                    { id: 1 },
                    max
                );
                
                this.result.data = 
                {
                    message: 'Query all playlists for user ' + user,
                    lastIndex: lastIndex,
                    totalResults: canciones.length,
                    data: canciones
                }
                this.status = 200;
                this.FinishRequest();
                //Buscar las playlists del usuario
            }
        }
    }
}
module.exports = MusicPlaylists;