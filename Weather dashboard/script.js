const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

const buscarBtn = document.getElementById('buscarBtn');
const inputBuscar = document.getElementById('buscar');

const tituloCiudad = document.getElementById('ciudad');
const temperatura = document.getElementById('temperatura')
const minMax=document.getElementById('max-min')

menuBtn.addEventListener('click', (event) => {
    menuBtn.classList.toggle('desplazado');
    sidebar.classList.toggle('oculto');
});

buscarBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const ciudad= inputBuscar.value.trim();

    if (ciudad!==""){
          const API_key="TU_API_KEY"
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_key}&units=metric&lang=es`;

          const respuesta= await fetch(url)
          const datos= await respuesta.json()
          console.log(datos)

          tituloCiudad.textContent=datos.name
          temperatura.textContent=Math.round(datos.main.temp)+'°C'
          minMax.textContent=`Max: ${Math.round(datos.main.temp_max)}°C Min: ${Math.round(datos.main.temp_min)}°C`;

          const iconoCode = datos.weather[0].icon;
          const urlIcono = `https://openweathermap.org/img/wn/${iconoCode}@2x.png`;
          const iconoElemento = document.getElementById('icono_clima');
          iconoElemento.src = urlIcono;

          const urlForecast=`https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${API_key}&units=metric&lang=es`;
          const respuestaForecast=await fetch(urlForecast)
          const datosForecast= await respuestaForecast.json()

          const listaPrediccion=document.getElementById('prediccion')
          listaPrediccion.innerHTML=""

          const pronosticoFiltrado=datosForecast.list.filter(item=>item.dt_txt.includes("12:00:00"))

          pronosticoFiltrado.forEach(item=>{
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
               
               // Lo añadimos a la lista
               listaPrediccion.appendChild(li);
          })
     }
});

function aplicarModoSegunHora() {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 20) {
        document.body.classList.add('modo_dia');
    } else {
        document.body.classList.remove('modo_dia');
    }
}

aplicarModoSegunHora()
setInterval(aplicarModoSegunHora,60000)