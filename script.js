document.addEventListener('DOMContentLoaded', function () {

    // Correção de ambiente para o Leaflet (mantemos por segurança)
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    } );

    // 1. Inicializar o mapa
    const map = L.map('map', {
        zoomControl: false
    }).setView([-19.685, -44.89], 15);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // --- CAMADAS DE MAPA BASE ---
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    } ).addTo(map);

    // --- LÓGICA PRINCIPAL ---
    const oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });

    fetch('pontos_turisticos.geojson')
        .then(response => response.json())
        .then(data => {
            data.features.forEach(feature => {
                const props = feature.properties;
                const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                
                // ==================================================================
                // ***** PROVA DE FOGO: USAR UMA IMAGEM DA INTERNET *****
                // Em vez de usar a imagem local, usamos um link de uma imagem online.
                // Se isto funcionar, o problema é 100% relacionado ao bloqueio de
                // arquivos locais pelo seu ambiente (servidor, navegador ou firewall).
                // ==================================================================
                const onlineImagePath = 'https://cdn-icons-png.flaticon.com/128/684/684908.png';

                const marker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        // Usamos a imagem online aqui, dentro de um pino simples
                        html: `<div class="pin-body" style="border: 2px solid red; background: white;"><img src="${onlineImagePath}" alt="Teste" style="width: 40px; height: 40px;"></div>`,
                        iconSize: [44, 60], // Tamanho ajustado para o teste
                        iconAnchor: [22, 60],
                    } )
                });
                
                marker.bindPopup(`<h3>${props.Descricao}</h3>`);
                oms.addMarker(marker);
            });
        })
        .catch(error => console.error('Erro ao processar o GeoJSON:', error));
});
