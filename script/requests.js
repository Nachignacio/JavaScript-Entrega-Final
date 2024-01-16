
let clientID = '220740938cc24433892949767fb73acf';
let clientSecret = 'b1c6052744704fa5a3e3e5b69fff22e8';
    


function getToken(id, secret){
    return fetch("https://accounts.spotify.com/api/token", { 
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + id + '&client_secret=' + secret,
        headers: {"Content-Type" : "application/x-www-form-urlencoded"},
    })
    .then(res => res.json());
}

function getData(search, token){
    return fetch('https://api.spotify.com/v1/search?q=' + search + '&type=track&limit=10&offset=0&include_external=audio', {    
        headers: {
                'Authorization' : 'Bearer ' + token,
            },
        })
    .then(res => res.json());
}

let tokenPromise = getToken(clientID,clientSecret);
tokenPromise.then(obj => localStorage.setItem('token',obj.access_token));

const token = localStorage.getItem('token');

let input = document.querySelector('#search');
let button = document.querySelector('#searchButton');
let searchValue = '';

button.addEventListener('click', (event, searchValue) => {
    event.preventDefault();
    let searchBox = document.querySelector('#searchBox');
    
    //searchBox.style.display='display';
    searchValue = document.querySelector('#search').value;
    console.log(searchValue);
    let trackPromise = getData(searchValue,token);
    let list = document.querySelector("#recommendationsList");
    trackPromise.then(trackObject => {
        for (let i = 0; i < 10; ++i) {
            
            let songNumberString = 'Song' + i.toString();
            let artistsNames = trackObject.tracks.items[i].artists.map(artist => artist.name).join(', ');

            localStorage.setItem(songNumberString, trackObject.tracks.items[i].name + " - " + artistsNames);

            let listItem = document.createElement('li');
            listItem.innerHTML=localStorage.getItem(songNumberString);

            console.log(songNumberString);
            console.log(listItem);
            list.appendChild(listItem);
        }
    });
})

input.addEventListener('input', ( ) => {
    if(input.value!="")
        searchBox.style.display = "block";
    else
        searchBox.style.display = "none";
});





/*getData().then(trackData => console.log(trackData)).then(song => localStorage.setItem('songs',JSON.stringify(song)));
let songs=JSON.parse(localStorage.getItem('songs'));
console.log(songs);*/


/*Comienzo el motor de busqueda de Spotify*/



/*Agrego el evento de guardar el valor buscado al pulsar el boton Search*/




