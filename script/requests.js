
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
let list = document.querySelector("#recommendationsList");
let searchBox = document.querySelector('#searchBox');
let ulVoted = document.querySelector('#listWithVotes');
let searchValue = '';

button.addEventListener('click', (event, searchValue) => {
    event.preventDefault();
    searchBox.style.borderStyle = "solid";
    searchValue = document.querySelector('#search').value;
    let trackPromise = getData(searchValue, token);
    trackPromise.then(trackObject => {
        for (let i = 0; i < 10; ++i) {
            let songNumberString = 'Song' + i.toString();

            try {
                let artistsNames = trackObject.tracks.items[i].artists.map(artist => artist.name).join(', ');
                localStorage.setItem(songNumberString, trackObject.tracks.items[i].name + " - " + artistsNames);
            } catch (error) {
                console.log("There was an error", error);
            }

            let listItem = document.createElement('li');
            let listAnchor = document.createElement('a');

            listItem.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('li clicked');
                let liVoted = document.createElement('li');
                liVoted.textContent = event.target.textContent;
                ulVoted.appendChild(liVoted);
            });

            let content = document.createTextNode(localStorage.getItem(songNumberString));
            listAnchor.textContent = content.textContent;
            listItem.appendChild(listAnchor);

            console.log(i);
            if (i == 0) {
                listItem.setAttribute("id", "firstItemRecommended");
            }
            if (i == 9) {
                listItem.setAttribute("id", "lastItemRecommended");
            }

            console.log(songNumberString);
            console.log(listItem);
            list.appendChild(listItem);
        }
    });
})



input.addEventListener('keydown', (event) => {
    if (list.innerHTML!="")
        list.innerHTML="";
    if (input.value !="")
        searchBox.style.display = "block";
    else{
        searchBox.style.display = "none";
    }
    searchBox.style.borderStyle = "none";    
});
