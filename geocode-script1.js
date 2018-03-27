var api_key = 'AIzaSyCBi-ZWTa_7E4vy9ow6yzGSKozmMNo2tTw';
var shit_locations = []; // array for locations that geocoder could not resolve
var dope_locations = []; // array for locations that geocoder resolved
var redo_locations = []; // array for locations that need to be re-resolved
var pathToFile = 'govno.csv'; // path to csv file with locations

//document.querySelector('#run').addEventListener('click',handleClick());
//debugger;

function getCsvFile() {
    return new Promise((resolve,reject)=>{
        var http = new XMLHttpRequest();
        http.onreadystatechange = function(e) {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    resolve(http.response);
                } else {
                    reject(http.status);
                }
            }
        };
        http.open("GET",pathToFile,true);
        http.send();
    });
}

async function handleClick(){
    var csv = await getCsvFile();
    var locationsParsed;
    Papa.parse(csv, 
        {
            header: true,
            complete: (results) => {
                    locationsParsed = results.data;
                }
        });
    //console.log(locationsParsed);
    await fethc_geocodes(locationsParsed);
    console.log(dope_locations);

}



function waitASecond(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve()
        },1000);
    });
}

async function fethc_geocodes(locationsParsed) {
    for(var i = 0, j = 0; i < 2500; i++, j++){
    
        //var data = await resolveLocation(locationsParsed[i]);
        //var location = locationsParsed[i];
        var location = jQuery.extend(true, {}, locationsParsed[i]);
        resolveLocation(location).then();
        
        if(j === 49){ // don't do more than 50 request per second
            await waitASecond();    
            j = 0;
        }
    }
};

function resolveLocation(location){
    return new Promise(function(resolve,reject){
        var http = new XMLHttpRequest();
        //debugger;
        var loc_name = (location.LocationName).replace(new RegExp(' ', 'g'), '+');

        http.onreadystatechange = function(e) {
            if (http.readyState === 4) {
              if (http.status === 200) {
                  var data = JSON.parse(http.response)
                  if(data.status === "ZERO_RESULTS"){
                    shit_locations.push(location);
                    }else if(data.status === "OK"){
                        location.lat = data.results[0].geometry.location.lat;
                        location.lng = data.results[0].geometry.location.lng;
                        dope_locations.push(location);
                    } else if (data.status === "OVER_QUERY_LIMIT"){
                        console.log('api key exceeded',data);
                        redo_locations.push(location);
                    }
                resolve(JSON.parse(http.response))
              } else {
                reject(JSON.parse(http.status))
              }
            }
          };

        http.open("GET",`https://maps.googleapis.com/maps/api/geocode/json?address=${loc_name}&key=${api_key}`,true);

        http.send();
    });
}

function saveText(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
  }