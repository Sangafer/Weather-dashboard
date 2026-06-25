// --- 1. SELECTORES DEL DOM ---
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const buscarBtn = document.getElementById('buscarBtn');
const inputBuscar = document.getElementById('buscar');
const tituloCiudad = document.getElementById('ciudad');
const temperatura = document.getElementById('temperatura');
const minMax = document.getElementById('max-min');
const iconoClima = document.getElementById('icono_clima');
const listaPrediccion = document.getElementById('prediccion');
const listaFavoritos = document.querySelector('#favoritas ul'); // Seleccionamos el <ul> sin ID

const API_key = "1b7d9b5dabef1cf23108470b07eb6884";

// --- 2. ESTADO DE LA APLICACIÓN ---
let ciudadesFavoritas = JSON.parse(localStorage.getItem('favoritas')) || [];
let ciudadActual = ""; 

// --- 3. EVENTOS BÁSICOS ---
menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('desplazado');
    sidebar.classList.toggle('oculto');
});

// Configurar el título de la ciudad para que actúe como botón de guardar
tituloCiudad.style.cursor = 'pointer';
tituloCiudad.title = 'Haz clic para guardar en favoritas';
tituloCiudad.addEventListener('click', () => {
    if (ciudadActual && !ciudadesFavoritas.includes(ciudadActual)) {
        ciudadesFavoritas.push(ciudadActual);
        guardarFavoritas();
        renderizarFavoritos();
    }
});

// --- 4. FUNCIONES DE RENDERIZADO VISUAL ---
function mostrarClimaActual(datos) {
    ciudadActual = datos.name; 
    tituloCiudad.textContent = datos.name;
    temperatura.textContent = Math.round(datos.main.temp) + '°C';
    minMax.textContent = `Max: ${Math.round(datos.main.temp_max)}°C Min: ${Math.round(datos.main.temp_min)}°C`;
    
    const iconoCode = datos.weather[0].icon;
    iconoClima.src = `https://openweathermap.org/img/wn/${iconoCode}@2x.png`;
}

function mostrarPronostico(datosForecast) {
    listaPrediccion.innerHTML = "";
    const pronosticoFiltrado = datosForecast.list.filter(item => item.dt_txt.includes("12:00:00"));
    
    pronosticoFiltrado.forEach(item => {
        const fecha = new Date(item.dt_txt);
        const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
        const icono = item.weather[0].icon;
        const temp = Math.round(item.main.temp);
        
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="dia">${nombreDia}</span>
            <img src="https://openweathermap.org/img/wn/${icono}.png" alt="icono">
            <span class="temp">${temp}°C</span>
        `;
        listaPrediccion.appendChild(li);
    });
}

// --- 5. LÓGICA DE FAVORITOS ---
function guardarFavoritas() {
    localStorage.setItem('favoritas', JSON.stringify(ciudadesFavoritas));
}

function renderizarFavoritos() {
    listaFavoritos.innerHTML = ""; 
    
    ciudadesFavoritas.forEach((ciudadFav, index) => {
        const li = document.createElement('li');
        li.classList.add('item-fav'); 
        
        // Estructura exacta a tu HTML
        li.innerHTML = `
            <span class="nombre-ciudad" style="cursor:pointer" title="Ver clima">${ciudadFav}</span>
            <button class="btn-eliminar">x</button>
        `;
        
        // Evento para buscar la ciudad al hacer clic en su nombre
        li.querySelector('.nombre-ciudad').addEventListener('click', () => {
            buscarDatosClima(ciudadFav);
            // Si estás en móvil, ocultamos el sidebar tras buscar
            if(window.innerWidth < 768) {
                menuBtn.classList.remove('desplazado');
                sidebar.classList.add('oculto');
            }
        });

        // Evento para borrar la ciudad de favoritas
        li.querySelector('.btn-eliminar').addEventListener('click', () => {
            ciudadesFavoritas.splice(index, 1);
            guardarFavoritas();
            renderizarFavoritos();
        });

        listaFavoritos.appendChild(li);
    });
}

// --- 6. PETICIONES A LA API ---

// Función reutilizable para buscar cualquier ciudad (por input o favoritos)
async function buscarDatosClima(ciudad) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_key}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) throw new Error("Ciudad no encontrada");
        
        const datos = await respuesta.json();
        
        const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${API_key}&units=metric&lang=es`;
        const respuestaForecast = await fetch(urlForecast);
        const datosForecast = await respuestaForecast.json();
        
        mostrarClimaActual(datos);
        mostrarPronostico(datosForecast);
    } catch (error) {
        console.error(error);
        alert("No se pudo encontrar la ciudad. Revisa el nombre e inténtalo de nuevo.");
    }
}

buscarBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const ciudad = inputBuscar.value.trim();
    if (ciudad !== "") {
        buscarDatosClima(ciudad);
        inputBuscar.value = ""; // Limpiamos el input tras buscar
    }
});

function obtenerClimaLocal() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (posicion) => {
            const lat = posicion.coords.latitude;
            const lon = posicion.coords.longitude;
            try {
                const urlClima = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric&lang=es`;
                const respuestaClima = await fetch(urlClima);
                const datosClima = await respuestaClima.json();
                
                const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric&lang=es`;
                const respuestaForecast = await fetch(urlForecast);
                const datosForecast = await respuestaForecast.json();
                
                mostrarClimaActual(datosClima);
                mostrarPronostico(datosForecast);
            } catch (error) {
                console.error(error);
            }
        }, (error) => {
            console.warn("Geolocalización denegada.");
        });
    }
}

// --- 7. MODO NOCHE Y ARRANQUE INICIAL ---
function aplicarModoSegunHora() {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 20) {
        document.body.classList.add('modo_dia');
    } else {
        document.body.classList.remove('modo_dia');
    }
}

// Inicialización de la aplicación
aplicarModoSegunHora();
setInterval(aplicarModoSegunHora, 60000);
obtenerClimaLocal();
renderizarFavoritos();