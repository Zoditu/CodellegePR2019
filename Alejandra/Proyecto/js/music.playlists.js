var EndpointBase = require ('./endpoint.base');

class MusicPlaylist extends EndpointBase
{
    constructor(response, request, mongo, result)
    {
        super(response,request,mongo,result);
    }
    async GET (search)
    {
        if (!this.CheckHeaders ( 'initialid', 'max') )
        return;

            var max = parseInt(this.headers.max);
            var initialid = parseInt(this.headers.initialid);
            var user = this.headers['x-owner'];

            if (max <= 0 || initialid < 0)
            {
                this.result.data =
                {
                    message: 'Invalid data type for max',
                    error: '"max" o "initialid" header is requered to be an integer',
                    result: 'ERROR'
                };
                this.status=412;
                this.FinishRequest();
                return;
            }

        if (search)
         { 
            search = this.ToRegex(search);
            var list = this.QueryDataBase
            (
                'MusicPlayer',
                'Playlist',
                {
                    $and: 
                    [
                        { id: { $gte: initialid } },
                        { name: {$regex: '.*' + search + '.*'} }
                    ]
                },
                {id:1},
                max
            );

            var lastIndex = 0;
            if (list.length > 0)
                lastIndex = list[list.length - 1].id;
            
            this.result.data = 
            {
                message: 'Succesful request query for "search"',
                lastIndex: lastIndex,
                totalResults: songs.length,
                result: songs

            };
            this.status=200;
            this.FinishRequest();

        } // fin del search
        
        else {
            if (!this.headers['x-owner'])
             {
               this.result.data =
                {
                    message: 'Invalid user playlist query',
                    error: '"x-owner" hearder is requerid to perform this query',
                    result: 'ERROR'
                }
                this.status=406;
                this.FinishRequest();
                
            } 

            else
            {
            var owner = await this.SingleQueryDataBase
            (
                'MusicPlayer',
                'Users',
                {owner : {$regex:'^'+ this.ToRegex(user)+ '$' }}
            );
                
                if (owner == null)
                {
                    this.result.data = 
                    {
                        message: 'User incongruency. User does not exist',
                        warning: 'User not found',
                        result: 'WARNING'
                    }
                    this.status= 404;
                    this.FinishRequest();
                    return;
                }

                var $or = []
                var cancionesABuscar =
                {
                    $and: [{id: {$gte: initialid}}]
                };

                var count = 0;

                for (var i = 0; i < owner.playlist.length; i++) 
                {
                    var id = owner.playlist[i];
                    lastIndex = id;
                    if (count < max) 
                    {
                        if (id >= initialid) 
                        {$or.push({id: id});
                            count++;
                        }
                    } 
                    else 
                    {
                        break;
                    }

                }

                if ($or.length < 1) 
                {
                    this.result.data = 
                    {
                        message: 'Query all favorite tracks for use' + user,
                        lastIndex: lastIndex,
                        totalResults: 0,
                        data: []
                    };
                    this.status=200;
                    this.FinishRequest();
                    return;
                }
                cancionesABuscar.$and.push({$or: $or });

                if (lastIndex === owner.playlist.length - 1)
                    lastIndex = owner.playlist.length;
                
                var canciones = await this.QueryDataBase
                (
                    'MusicPlayer',
                    'Playlist',
                    cancionesABuscar,
                    {id:1},
                    max
                );

                this.result.data = 
                {
                    message: 'Query all playlists for user ' + user,
                    lastIndex: lastIndex,
                    totalResults: canciones.length,
                    data: canciones

                };
                this.status=200;
                this.FinishRequest();
            };
        }
    }

}

module.exports = MusicPlaylist;