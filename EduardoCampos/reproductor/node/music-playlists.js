/*var EndpointBase = require('./endpoint-base')
class MusicPlaylists extends EndpointBase
{
   constructor( response, request, mongo, result)
   {
      super(response, request, mongo, result);
   }
   
   async GET(search)
   {
      if(!this.CheckHeaders('initialid','max'))
      return;
        
         var max = parseInt(this.headers.max);
         var initialid = parseInt(this.headers.initialid);
         var user = this.headers['x-owner'];

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

         if (search) //http://localhost:27001/music/songs?search=michael+jackson
         {
            search = this.ToRegex(search);
            var lists = await this.QueryDatabase
            (
               'MusicPlayer',
               'Playlists',
               {
                  $and:
                  [
                     { id: { $gte: initialid}},
                     { name: {$regex: '.*' + search + '.*'}}
                  ]
               },
               {id:1},
               max
            );

            var lastIndex = 0;
            if(lists.length > 0)
            {
               lastIndex = lists[lists.length - 1].id;
            }

            this.result.data =
            {
               message: 'Succesful request query for "Search"',
               lastIndex: lastIndex,
               totalResult: lists.length,
               data: lists
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
            message: 'Invalid user playlists query',
            warning: '"x-owner" header is required to perform this query',
            result: 'WARNING'
         }
            this.status = 412;
            this.FinishRequest();
            return; 
         }

         else //else copiado
         {
            var owner = await this.SingleQueryDatabase
            (
               'MusicPlayer',
               'Users',
               {owner: {$regex: '^' + this.ToRegex(user) +'$'}}
            );

            if( owner == null)
            {
               //Warning
               this.result.data =
               {
                     message: 'User incongruency. User does not exist',
                     warning: 'User not fund',
                     result: 'WARNING'
               }
               this.status = 404;
               this.FinishRequest();
               return;
            }

            
            var $or = [];
            var cancionesABuscar = 
            {
               $and:
               [
                     {id: {$gte: initialid}}
               ]
            };
            var count = 0;
            var lastIndex = 0;

            for ( var i = 0; i < owner.playlists.length; i++)
            {
               lastIndex = id;
               var id = owner.playlists[i];
               if(count < max)
               {
                     if( id >= initialid)
                     {
                        $or.push({id: id});
                        count++;
                     } 
               }

               else
               {
                     break;
               }
            }

            if ($or.lenght < i)
            {
               this.result.data =
               {
                     message: 'Query all favorite tracks for user' + user,
                     lastIndex: lastIndex,
                     totalResult: 0,
                     data: []
               };
               this.status = 200;  
               this.FinishRequest();
               return;
            }

            cancionesABuscar.$and.push({ $or:$or });
         
            if (lastIndex === owner.favorites.length - 1)
            {
               lastIndex = owner.favorites.length;   
            }

            var canciones = await this.QueryDatabase
            (
               'MusicPlayer',
               'Playlists',
               cancionesABuscar,
               {id: 1},
               max
            );
         
            this.result.data =
            {
               message: 'Query all favorite tracks for user ' + user,
               lastIndex: lastIndex,
               totalResult: canciones.length,
               data: canciones
                  
            };
            this.status=200;
            this.FinishRequest(); 
         }
                
      }
   }
}
module.exports = MusicPlaylists;*/

var EndpointBase = require('./endpoint-base');

class MusicPlaylists extends EndpointBase{
    constructor(response, request, mongo, result) {
        super(response, request, mongo, result);
    }

    async GET(search) {
        if(!this.CheckHeaders('initialid', 'max'))
        return;

        var max = parseInt(this.headers.max)
        var initialid = parseInt(this.headers.initialid);
        var user = this.headers['x-owner'];

        if (max <= 0 || initialid < 0) {

            //error
            this.result.data = {
                message: 'Invalid data type for max header|initialid',
                error: '"max" or "initial id" parameter is required to be an Integer',
                result: 'ERROR'
            }; //Fin del result.data  

            this.status = 412;
            this.FinishRequest();
            return;
        }

        if (search) {

            search = this.ToRegex(search);
            var lists = await this.QueryDatabase(
                'MusicPlayer',
                'Playlists', {
                    $and: [{
                            id: {
                                $gte: initialid
                            }
                        },
                        {
                            name: {
                                $regex: '.*' + search + '.*'
                            }
                        }
                    ]
                }, {
                    id: 1
                }, max

            );

            var lastIndex = 0;

            if (lists.length > 0) {
                lastIndex = lists[lists.length - 1].id;
            }

            this.result.data = {
                message: 'Succesful request query for "Search"',
                lastIndex: lastIndex,
                totalResults: lists.length,
                result: lists
            };
            this.status = 200;
            this.FinishRequest();

        } //Fin del if SEARCH
        else {
            if (!this.headers['x-owner']) {
                this.result.data = {
                    message: 'Invalid user playlists query',
                    error: '"x-owner" header is required to perform this query',
                    result: 'ERROR'
                }; //Fin del result.data  
                this.status = 412;
                this.FinishRequest();
                
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
                    message: 'User incongruency. User does not exist',
                    error: 'User not found',
                    result: 'WARNING'
                };
                this.status = 404;
                this.FinishRequest();
                return;
            }
            var $or = [];
            var cancionesABuscar = {
                $and: [{
                        id: {
                            $gte: initialid
                        }
                    }


                ]

            };
            var count = 0;
            var lastIndex = 0;

            for (var i = 0; i < owner.playlists.length; i++) {
                var id = owner.playlists[i];
                lastIndex = id;

                if (count < max) {
                    if (id >= initialid) {
                        $or.push({
                            id: id
                        });
                        count++
                    };
                } else {
                    break;
                }
            }

            if ($or.length < 1) {
                this.result.data = {
                    message: 'Query all favorite tracks for user' + user,
                    lastIndex: lastIndex,
                    totalResults: 0,
                    data: []
                };
                this.status = 200;
                this.FinishRequest();
                return;
            }
            cancionesABuscar.$and.push({
                $or: $or
            });
            console.log(cancionesABuscar);

            if (lastIndex === owner.favorites.length - 1)
                lastIndex = owner.favorites.length;

            var canciones = await this.QueryDatabase(
                'MusicPlayer',
                'Playlists',
                cancionesABuscar, {
                    id: 1
                },
            );

            this.result.data = {
                message: 'Query all favorite tracks for user' + user,
                lastIndex: lastIndex,
                totalResults: canciones.length,
                data: canciones
            };

            this.status = 200;
            this.FinishRequest();
            return;
        }

    }


}
module.exports = MusicPlaylists;