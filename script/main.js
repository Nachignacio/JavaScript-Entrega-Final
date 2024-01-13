let formulario = document.querySelector("#formulario");
let listaComentarios = [];
const listaComentariosHTML = document.querySelector(".listaComentarios");

formulario.addEventListener("submit",agregarComentario);
listaComentariosHTML.addEventListener("click",borrarComentario);

function agregarComentario(evt){
    evt.preventDefault();
    const comentario = document.querySelector("#comentario").value;
    if(comentario === ""){
        alert("Agregar comentario");
        return;
    }
    let cadaComentario = {
        id: Date.now(),
        texto: comentario,
    };  
    listaComentarios.push(cadaComentario);
    formulario.reset();
    console.log(listaComentarios);
    crearHTML();
}

function crearHTML(){
    limpiarLista();
    listaComentarios.forEach((comment) => {
        const botonBorrar = document.createElement("a");
        botonBorrar.textContent = "Borrar";
        botonBorrar.className = "botonBorrar";
        const li = document.createElement("li");
        li.textContent = comment.texto;
        li.dataset.comentarioId = comment.id;
        li.appendChild(botonBorrar);
        listaComentariosHTML.appendChild(li);
    })
    sincroStorage();
}

function limpiarLista(){ /*Limpia la lista listaComentariosHTML para que no repita comentarios al postear */
    while(listaComentariosHTML.firstChild){
        listaComentariosHTML.removeChild(listaComentariosHTML.firstChild);
    }
}

function borrarComentario(evt){
    evt.preventDefault();
    const id = evt.target.parentElement.dataset.comentarioId;
    listaComentarios = listaComentarios.filter( (comment) => comment.id != id);
    crearHTML();
}   

window.addEventListener("DOMContentLoaded",() =>{ /*Esto es para que cargue los comentarios del Local Storage, si es que hay alguno*/ 
    listaComentarios = JSON.parse(localStorage.getItem("listaComentarios")) || []; /*El || [] le da la opcion de que cargue cero comentarios si no hay nada en Local Storage */
    crearHTML();
})

function sincroStorage(){
    localStorage.setItem("listaComentarios",JSON.stringify(listaComentarios));
}

fetch("https://api.spotify.com")
.then((res) => console.log(res))
.catch((err) => console.log(err));
