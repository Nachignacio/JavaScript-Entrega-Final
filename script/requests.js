// Cargo mis datos de mi Web API de Spotify, estos me dejaran solicitar un token

// Idealmente, cada computadora que ingrese a mi pagina tendra que iniciar sesion para pedir cada uno su token, pero de momento asi es como pude aprender a hacerlo

let clientID = '220740938cc24433892949767fb73acf';
let clientSecret = 'b1c6052744704fa5a3e3e5b69fff22e8';
    
// Creo una funcion que, dados el Client ID y el Client Secret, me devuelve una promesa que luego de realizarse opera con el token devuelto

function getToken(id, secret){
    return fetch("https://accounts.spotify.com/api/token", { // Debo crear un Request object para simular los parametros del curl que recomienda ejecutar el tutorial de Spotify
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + id + '&client_secret=' + secret,
        headers: {"Content-Type" : "application/x-www-form-urlencoded"},
    })
    .then(res => res.json());
}

// Esta funcion es la que realiza una peticion http al endpoint de la API del catalogo de Spotify

function getData(search, token){
    // Esta URL esta automatizada para que se cree con el parametro search que se pase a la funcion para buscar y me devuelve 10 resultados de lo que me busca la API de Spotify
    return fetch('https://api.spotify.com/v1/search?q=' + search + '&type=track&limit=10&offset=0&include_external=audio', {
        headers: {
                'Authorization' : 'Bearer ' + token, // Esta es la forma en la que debo configurar el Request object para acceder al endpoint de Spotify
            },
        })
    .then(res => res.json());
}

// Ahora no tengo el token, pero tengo puedo ejecutar funciones que permitan almacenar la promesa del token

let tokenPromise = getToken(clientID,clientSecret);

// Ahora que tengo la promesa del token, lo que hago es un then que despues lo almacene en el Local Storage
// La verdad que lo queria almacenar en una variable comunmente pero aparentemente no se puede hacer y por lo que estuve tratando con el Local Storage las promesas trabajan bien

tokenPromise.then(obj => localStorage.setItem('token',obj.access_token));

// Ahora puedo extraer lo que la promesa guardo en el LocalStorage y ahora si lo guardo en una variable. No encontre otra forma de guardar el resultado de una promesa en una variable

const token = localStorage.getItem('token');

// Comienzo a crear todos objetos DOM HTML que voy a necesitar

let input = document.querySelector('#search'); // Creo el input de texto a partir del cual voy a buscar
let button = document.querySelector('#searchButton'); // Creo el boton cuyo click disparara el evento de busqueda
let list = document.querySelector("#recommendationsList"); // Creo la lista que quiero que se despliegue debajo de mi input con canciones recomendadas
let searchBox = document.querySelector('#searchBox'); // Esta será el contenedor de la lista de recomendaciones que se despliega
let ulVoted = document.querySelector('#listWithVotes'); // Esta será la lista de canciones votadas luego de seleccionarlas en la lista que se despliega

// Creo la primera fila de la lista con los titulos de las columnas
let listItemHeader = document.createElement('li'); 
listItemHeader.id = 'listItemHeader';
listItemHeader.textContent = 'Songs'; // Titulo de columna de canciones
let liVotesHeader = document.createElement('li'); 
liVotesHeader.id = 'liVotesHeader';
liVotesHeader.className = 'votesCount';
liVotesHeader.textContent = 'Votes'; // TItulo de columna de votos

// Agrego las celdas recien creadas a la tabla

ulVoted.appendChild(listItemHeader);
ulVoted.appendChild(liVotesHeader);

// La lista de canciones recomendadas se guarda en el Local Storage (la uso como mi base de datos), si ya hay algo cargado previamente se carga dicha lista

document.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem('Votes List')) {
        ulVoted.innerHTML = localStorage.getItem('Votes List');
    }
});

// Comienzo a crear la logica dentro del evento del click en el boton Search

button.addEventListener('click', (event, searchValue) => {

    // Evito que se actualice la pagina
    event.preventDefault(); 

    // Le doy un borde a la lista de recomendaciones
    searchBox.style.borderStyle = "solid";

    // Guardo en una variable lo escrito para buscar y pasar como argumento a getData
    searchValue = document.querySelector('#search').value;

    // Guardo la promesa que retorna getData en trackPromise
    let trackPromise = getData(searchValue, token);

    // Leo la informacion del json devuelto por la API de Spotify para almacenarla en Local Storage y desde ahí replicarla en mi pagina
    trackPromise.then(trackObject => {
        for (let i = 0; i < 10; ++i) {
            let songNumberString = 'Song' + i.toString();

            // Utilizo try and catch para avisar al usuario en caso de que falle la peticion GET que suele fallar.
            try {

                // Aca, debido a que cada cancion puede tener mas de un artista, al array de artistas los uno en un mismo string cada uno separado por una coma y espacio
                // De esta forma guardo esa info en un string con todos los artistas de una cancion
                let artistsNames = trackObject.tracks.items[i].artists.map(artist => artist.name).join(', ');

                // Guardo en el local storage el numero de la cancion recomendada justo con su nombre, un guion y seguido por por los artistas que la compusieron
                // De esta forma tengo la informacion guardada en el formato que quiero para accederla luego y mostrarla en mi pagina
                localStorage.setItem(songNumberString, trackObject.tracks.items[i].name + " - " + artistsNames);
            } catch (error) {
                Swal.fire({
                    title: "Error",

                    // Le pido al usuario que actualice la pagina, asi se soluciona el error
                    text: "There happened to be an error while retrieving the information. Please refresh the page and try again.",
                    icon: "Close"
                });
            }

            // Creo los elementos de la lista recomendada y les cargo lo guardado en Local Storage: los nombres de las canciones con sus artistas
            let listItem = document.createElement('li');
            let content = localStorage.getItem(songNumberString);
            listItem.textContent = content;

            // Comienzo con el evento de click en un item, la intencion es que al hacer click en una cancion recomendada, se sume un voto para esa cancion en la lista
            listItem.addEventListener('click', (event) => {
                
                // Creo un array el cual va a almacenar los nombres de las canciones clickeadas y las va a organizar con sus votos
                let elements = [];

                // Utilizo el metodo getElements para que me devuelva un array de objetos que se encuentren ya presentes en la lista de temas votados para replicarlos en el array elements
                let listOfItems = ulVoted.getElementsByTagName('li');

                for(let i=0; i<listOfItems.length; ++i){
                    elements.push(listOfItems[i].textContent);
                }

                // Chequeo si la cancion clickeada YA SE ENCUENTRA en el array elements. Si se encuentra en este array, significa que se encuentra en el objeto ulVoted
                // No trabajé directamente con el objeto ulVoted porque no es un array, por eso hice el duplicado llamado elements como un array, para poder usar metodos de array como includes y forEach
                if(elements.includes(event.target.textContent)){

                    // Comparo cada cancion YA recomendada con la cancion clickeada, accediendo al nombre de la cancion clickeada con event.target.textContent
                    elements.forEach((element) => {
                        if(element == event.target.textContent){

                            // Me fijo que ya haya algo guardado sobre la cancion ya votada en el Local Storage. Si lo hay almaceno en una variable cuantos votos ya tiene convirtiendo el string en un numero
                            if(localStorage.getItem('votesForSong' + event.target.textContent)){
                                
                                // Como ya hay algo ya cargado, cargo cuantos votos tiene, le sumo un voto y modifico el HTML por esa cantidad de votos resultante
                                let voteToChange = document.getElementById('votesCount' + event.target.textContent);
                                votesCounter = Number(voteToChange.innerHTML);
                                votesCounter++;
                                voteToChange.innerHTML = votesCounter;
                            }
                        }
                    })
                }
                else{
                    
                    // Si la cancion clickeada no fue votada anteriormente, se crea su fila en la lista de la pagina
                    let liVotes = document.createElement('li');

                    // Le agrego este ID para poder acceder a el si se vota de nuevo la misma cancion
                    liVotes.id = 'votesCount' + event.target.textContent; 

                    // Este Class Name es solo para darle formato mediante CSS
                    liVotes.className = 'votesCount';

                    let voteCount = 1;
                    liVotes.textContent = voteCount;

                    // Almaceno la cancion y su primer voto en el Local Storage para que luego pueda ser cargado y aumentar sus votos
                    localStorage.setItem('votesForSong' + event.target.textContent, '1');

                    // Clona el item seleccionado y lo agrega a la lista de canciones recomendadas
                    ulVoted.appendChild(listItem.cloneNode(true));

                    // Se agrega a la lista la cantidad de votos de la cancion, queda al lado del nombre de la cancion
                    ulVoted.appendChild(liVotes);
                }
                //if(elements.includes(event.target.innerHTML))

                //Guardo en el Local Storage los temas que fueron votados para que cuando se vuelva a cargar la pagina sigan los mismos temas que antes
                localStorage.setItem('Votes List', ulVoted.innerHTML);
            });

            // Esto es para agregar formato por CSS a la lista de temas recomendados
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


// Agrego eventos de escritura en el input de busqueda para que desaparezca la lista de temas recomendados cuando se esta escribiendo o borrando
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
