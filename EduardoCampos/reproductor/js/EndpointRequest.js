function GET(baseUrl, endpoint, headers, params, watToDo, request)
{
   var data = null;
   var ajax = new XMLHttpRequest();
   ajax.onreadystatechange = function()
   {
      if (this.readyState === 4)
      {
         if (this.status >= 200 && this.status < 300)
         {
            //Todo OK
            watToDo(this.responseText, false, request);
         }
         else
         {
            //No salió bien
            watToDo(this.responseText, true, request);
         }
      }
      else
      {
         //Mostrar carga
         watToDo();
      }
   };
   var parameters = '';
   if (params)
   {
      var keys = Object.keys(params);
      for (var i = 0; i < keys.length; i++)
      {
         var key = keys[i];
         var value = params[key];
         if( i == 0)
            parameters += '?';
         else  
            parameters += '&';

         parameters += key + '=' + value;
      }   
   }
   console.log(baseUrl, endpoint, parameters);
   
   ajax.open('GET', baseUrl + endpoint + parameters, true);
   if (headers)
   {
      var keys = Object.keys(headers);
      for (var i = 0; i < keys.length; i++)
      {
         var key = keys[i];
         var value = headers[key];
         ajax.setRequestHeader(key,value);
      }   
   }
   //alert( baseUrl + endpoint + parameters);
   ajax.send();
   
}