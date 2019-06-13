var EndpointBase = require('./endpoint-base');

class MusicSongs extends EndpointBase {
    constructor(response, request, mongo, result) {
        super(response, request, mongo, result);
    }

    async GetBySearch(search) {
        if (!this.CheckHeaders('initialid', 'max'))
            return;

        if (search) {
            var max = parseInt(this.headers.max)
            var initialid = parseInt(this.headers.initialid);;

            if (max <= 0 || initialid < 0) {

                //error
                this.result.data = {
                    message: 'Invalid data type for max header|initialid',
                    error: '"max" or "initial id" parameter is required to be an Integer',
                    result: 'ERROR'
                }; //Fin del result.data 
                this.status = 200;
                this.FinishRequest();

            }
            search = this.toRegex(search);
            var songs = await this.QueryDatabase(
                'MusicPlayer',
                'Audio', {
                    $and: [{
                            id: {
                                $gte: initialid
                            }
                        },
                        {
                            $or: [{
                                    title: {
                                        $regex: '.*' + search + '.*'
                                    }
                                },
                                {
                                    author: {
                                        $regex: '.*' + search + '.*'
                                    }
                                },
                                {
                                    album: {
                                        $regex: '.*' + search + '.*'
                                    }
                                }
                            ]
                        }
                    ]
                }, {
                    id: 1
                },
                max
            );

            var lastIndex = 0;

            if (songs.length > 0) {
                lastIndex = songs[songs.length - 1].id;
            }
            this.result.data = {
                message: 'Succesful request query for "Search"',
                lastIndex: lastIndex,
                totalResults: songs.length,
                data: songs
            };
            this.status = 200;
            this.FinishRequest();

        } else {
            this.result.data = {
                message: 'Insuffcient search data',
                warning: '"Search" parameter is requires to perform this query',
                result: 'WARNING'
            };
            this.status = 406;
            this.FinishRequest();
        }
    }

    async GetByID(id) {
        if (id) {
            var _id = parseInt(id);
            if (_id === NaN) {
                this.result.data = {
                    message: 'Invalid search criteria',
                    warning: '"id" parameter must be a number',
                    result: 'WARNING'
                };
                this.status = 406;
                this.FinishRequest();
            } else {
                var song = await this.SingleQueryDatabase(
                    'MusicPlayer',
                    'Audio', {
                        id: _id,
                    }
                );
                if (song != null) {
                    this.result.data = {
                        message: 'Successful request query for ID',
                        totalResults: 1,
                        result: song
                    };
                    this.status = 200;
                    this.FinishRequest();
                } else {
                    this.result.data =
                    {
                        message: 'id[' + _id +  '] doesn\'t exist',
                        warning: 'Song not found',
                        result: 'WARNING'
                    }
                    this.status = 404;
                    this.FinishRequest();
                }
            }
        }
    }
}


module.exports = MusicSongs;