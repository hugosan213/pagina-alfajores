const $ = selector => document.querySelector(selector);

// Esta función es el "motor" que mueve las fotos
function moverCarrusel(direccion) {
    const list = $(".list");
    if (!list) return;

    if (direccion === 'next') {
        const first = list.firstElementChild;
        list.appendChild(first); // Mueve la primera al final
    } else {
        const last = list.lastElementChild;
        list.insertBefore(last, list.firstElementChild); // Mueve la última al principio
    }
    actualizarClases();
}

// Asigna las clases CSS según la posición real en el HTML
function actualizarClases() {
    const items = document.querySelectorAll(".list li");
    if (items.length === 0) return;

    // Limpiamos clases viejas
    items.forEach(li => {
        li.classList.remove("act", "prev", "next", "hide", "new-next");
    });

    // Asignamos nuevas posiciones (suponiendo que tienes al menos 5 fotos)
    if (items[0]) items[0].classList.add("hide");
    if (items[1]) items[1].classList.add("prev");
    if (items[2]) items[2].classList.add("act");
    if (items[3]) items[3].classList.add("next");
    if (items[4]) items[4].classList.add("new-next");
}

function initSlider() {
    const slider = $(".list");
    
    // Si la galería aún no se carga en el DOM, reintentamos en 200ms
    if (!slider) {
        setTimeout(initSlider, 200);
        return;
    }

    console.log("Iniciando Carrusel de Mesal Café...");
    actualizarClases(); 

    slider.onclick = event => {
        const target = event.target.closest('li');
        if (!target) return;
        if (target.classList.contains('next')) moverCarrusel('next');
        if (target.classList.contains('prev')) moverCarrusel('prev');
    };

    let autoPlay = setInterval(() => moverCarrusel('next'), 4000);

    const container = $(".galeria_imagenes");
    if (container) {
        container.onmouseenter = () => clearInterval(autoPlay);
        container.onmouseleave = () => autoPlay = setInterval(() => moverCarrusel('next'), 4000);
    }
}

// Arrancamos el intento de inicialización
initSlider();