var EndpointBase = require ('./endpoint.base');

class MusicSongs extends EndpointBase
{
    constructor(response, request, mongo, result)
    {
        super(response,request,mongo,result);
    }

    async GetByID(id){
        if (id)
        {
            var  _id = parseInt(id);
            if ( _id === NaN)
            {
                this.result.data = {
                    message: 'Insufficient search criteria',
                    error: '"ID" parameter is requered to perform this query',
                    result: 'WARNING'
                };
                this.status=406;
                this.FinishRequest();
                return;
            }
            else 
            {
                var song = await this.SingleQueryDataBase
            (
                'MusicPlayer',
                'Audio',
                {  id:_id }
            );
            if (song !=null){
                this.result.data = {
                    message: 'Succesful request query for "id"',
                    totalResults: 1,
                    result: song
                };
                this.status=200;
    
                this.FinishRequest();
                }
                else {
                    this.result.data = 
                    {
                        message:'id['+_id +']does \'t exist ',
                        warning: 'Song not found',
                        result: 'WARNING'
                    }
                    this.status =404;
                    this.FinishRequest();
                }
            }
        }
        else
        {
            this.result.data = {
                message: 'Insufficient search criteria',
                error: '"ID" parameter is requered to perform this query',
                result: 'WARNING'
            };
            this.status=406;
            this.FinishRequest();
            return;
        }
    }

    async GetBySearch (search)
    {
        if (!this.CheckHeaders ( 'initialid', 'max') )
        return;

        if (search) {
            var max = parseInt(this.headers.max);
            var initialid = parseInt(this.headers.initialid);

            if (max <= 0 || initialid < 0)
             {
                this.result.data=
                 {
                    message: 'Invalid data type for max',
                    error: '"max" o "initialid" header is requered to be an integer',
                    result: 'ERROR'
                 }
                this.status=412;
                this.FinishRequest();
                return;
            }

            search = this.ToRegex(search);
            var songs = await this.QueryDataBase
            (
                'MusicPlayer',
                'Audio',
                {
                    $and:
                    [
                        {id:{$gte:initialid}},
                        {$or:
                        [
                            {title:{$regex:'.*'+search+'.*'}},
                            {author:{$regex:'.*'+search+'.*'}},
                            {album:{$regex:'.*'+search+'.*'}}
                        ]
                        }
                    ]
                },
                { id:1},
                max
            );

            var lastIndex = 0;
            if (songs.length > 0)
                lastIndex = songs[songs.length - 1].id;

            this.result.data = {
                message: 'Succesful request query for "search"',
                lastIndex: lastIndex,
                totalResults: songs.length,
                result: songs

            };
            this.status=200;

            this.FinishRequest();
        }
        else
         {
            this.result.data = {
                message: 'Insufficient search criteria',
                error: '"search" parameter is requered to perform this query',
                result: 'WARNING'
            };
            this.status=406;
            this.FinishRequest();
            return;
        }
    }
}

module.exports = MusicSongs;