// JS/contato.js - Lógica da Página de Contato

document.addEventListener('DOMContentLoaded', () => {

    // Inicialização do Mapa Interativo (Leaflet.js)
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Coordenadas de exemplo (Avenida Faria Lima, SP)
        const lat = -23.5872;
        const lng = -46.6806;

        const map = L.map('map').setView([lat, lng], 16);

        // Adiciona o mapa base (tile layer)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        // Ícone customizado
        const markerIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Um ícone de pino genérico
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        // Adiciona um marcador
        L.marker([lat, lng], { icon: markerIcon }).addTo(map)
            .bindPopup('<b>eduStreet HQ</b><br>Nosso QG criativo.')
            .openPopup();
    }
});