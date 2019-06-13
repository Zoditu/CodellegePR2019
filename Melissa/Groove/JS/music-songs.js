var EndpointBase = require('./endpoint-base');

class MusicSongs extends EndpointBase
{
    constructor( response, request, mongo, result )
    {
        super( response, request, mongo, result );
    }

    async GetByID( id )
    {
        if( id )
        {
            var _id = parseInt( id );
            if(_id == NaN )
            {
                this.result.data = 
                {
                    message: 'Invalid search criteria',
                    warning: '"id" parameter must be a number',
                    result: 'WARNING'
                };
                this.status = 406;

                this.FinishRequest ();  
            }
            else
            {
                var song = await this.SingleQueryDataBase
                (
                    'MusicPlayer',
                    'Audio',
                    {id: _id},
                );
                
                if( song != null )
                {
                    this.result.data = 
                    {
                        message: 'Succesful request query for "id"',
                        totalResults: 1,
                        result: song
                    };
                    this.status = 200;
                    this.FinishRequest ();
                }
                else
                {
                    this.result.data = 
                    {
                        message: 'id [' + _id + 'doesn\'t exist',
                        warning: 'Song not found',
                        result: 'WARNING'
                    }
                    this.status = 404;
                    this.FinishRequest();
                }
            }
        }
        else
        {
            this.result.data = 
            {
                message: 'Insufficient search criteria',
                warning: '"search" parameter is required to perform this query',
                result: 'WARNING'
            };
            this.status = 406;

            this.FinishRequest ();
        }
    }

    async GetBySearch( search )
    {
        if( !this.CheckHeaders( 'initialid', 'max' ))
            return;

        if(search) //http:/localhost:27000/music/songs?=search=michael+jackson
        {
            //db.Audio.find($and: [
            //{id: { $gte: initialid} },
            //{$or:
            //  [ 
            //  { title: /.*[Oo][Nn][Ee].*/ },
            //  { author: /.*[Oo][Nn][Ee].*/ },
            //  { album: /.*[Oo][Nn][Ee].*/ }
            //  ]
            //  }]}).sort( {id: 1}).limit( max );
            var max = parseInt(this.headers.max);
            var initialid = parseInt(this.headers.initialid);
            if(max <= 0 || initialid < 0)
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

            search = this.ToRegex( search );
            var songs = await this.QueryDataBase
            (
                'MusicPlayer',
                'Audio',
                {
                    $and:
                    [
                        {id: { $gte : initialid } },
                        {$or:
                            [
                                { Title:  {$regex: '.*' + search + '.*'} },
                                { Author: {$regex: '.*' + search + '.*'} },
                                { Album:  {$regex: '.*' + search + '.*'} },
                            ]
                        }
                    ]
                },
                {id: 1},
                max
            );
            var lastIndex = 0;
            if (songs.length > 0)
                lastIndex = songs [songs.length - 1].id;

            this.result.data = 
            {
                message: 'Succesful request query for "Search"',
                lastIndex : lastIndex,
                totalResults: songs.length,
                result: songs
            };
            this.status = 200;
            this.FinishRequest ();
        }
        else
        {
            this.result.data = 
            {
                message: 'Insufficient search criteria',
                warning: '"search" parameter is required to perform this query',
                result: 'WARNING'
            };
            this.status = 406;

            this.FinishRequest ();
        }
    }
}
module.exports = MusicSongs;