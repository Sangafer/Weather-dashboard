const menuBtn=document.getElementById('menuBtn')
const sidebar=document.getElementById('sidebar')

menuBtn.addEventListener('click', (event)=>{
     menuBtn.classList.toggle('desplazado')
     sidebar.classList.toggle('oculto')
})