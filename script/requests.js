
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


/*Necesito chequear si el token expiro */
/*
function handleTokenExpiration() {
    const expirationTime = localStorage.getItem('tokenExpiration');
    const currentTime = Math.floor(Date.now() / 1000);

    if (expirationTime && currentTime >= expirationTime) {
        // Token has expired, refresh it
        console.log("Token expiro");
        refreshToken();
    }
}

/*Si el token expiro, creo esta funcion que basicamente lo que hace es volver a llamar a getToken y re almacenarlo con nueva fecha de expiracion*/
/*
function refreshToken() {
    // Implement logic to refresh the token
    getToken(clientID, clientSecret)
        .then(newToken => {
            token = newToken;
            const expirationTime = Math.floor(Date.now() / 1000) + token.expirationTime;
            localStorage.setItem('token', token);
            localStorage.setItem('tokenExpiration', expirationTime);
        })
        .catch(error => {
            console.error('Error refreshing token:', error);
            // Handle the error appropriately
        });
}
*/
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

document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('Votes List')) {
        ulVoted.innerHTML = localStorage.getItem('Votes List');
    }
});

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
                Swal.fire({
                    title: "Error",
                    text: "There happened to be an error while retrieving the artists names.",
                    icon: "Close"
                });
            }

            let listItem = document.createElement('li');
            let listAnchor = document.createElement('a');

            let content = localStorage.getItem(songNumberString);
            listAnchor.textContent = content;
            listItem.appendChild(listAnchor);

            listItem.addEventListener('click', (event) => {
                event.preventDefault();
                let liVotes = document.createElement('li');
                liVotes.className = 'votesCount';
                let voteCount = 0;
                liVotes.textContent = voteCount;

                /*Clona el item seleccionado */
                ulVoted.appendChild(listItem.cloneNode(true)); // Clone the clicked item
                ulVoted.appendChild(liVotes);
                localStorage.setItem('Votes List', ulVoted.innerHTML);
                let elements = [];
                let listOfItems = ulVoted.getElementsByTagName('li');
                for(let i=0; i<listOfItems.length; ++i){
                    elements.push(listOfItems[i].textContent);
                }
                console.log(elements);
            });

            if (i == 0) {
                listItem.setAttribute("id", "firstItemRecommended");
            }
            if (i == 9) {
                listItem.setAttribute("id", "lastItemRecommended");
            }
            list.appendChild(listItem);
        }
    });
});



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
