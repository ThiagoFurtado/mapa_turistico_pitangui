document.addEventListener('DOMContentLoaded', function () {

    // 1. Inicializar o mapa
    const map = L.map('map', {
        zoomControl: false
    }).setView([-19.685, -44.89], 15);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // --- CAMADAS DE MAPA BASE ---
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    } ).addTo(map);

    // --- LÓGICA PRINCIPAL SIMPLIFICADA ---
    const oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });

    const layerReferences = {};
    let allListItems = [];

    oms.addListener('click', (marker) => {
        marker.openPopup();
    });

    fetch('pontos_turisticos.geojson')
        .then(response => response.json())
        .then(data => {
            document.getElementById('locations-count').textContent = `${data.features.length} pontos turísticos`;

            data.features.forEach(feature => {
                const props = feature.properties;
                const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                
                // ==================================================================
                // ***** ETAPA 1: USAR UM MARCADOR PADRÃO DO LEAFLET *****
                // Em vez do nosso ícone complexo, vamos usar o marcador azul padrão.
                // Se este marcador aparecer, sabemos que o problema está 100% no
                // código do `divIcon` ou no CSS associado a ele.
                // ==================================================================
                const marker = L.marker(latlng); // <-- A MUDANÇA CRUCIAL ESTÁ AQUI

                let popupContent = `<h3>${props.Descricao}</h3>`;
                if (props.Historia) popupContent += `<div class="popup-descricao">${props.Historia}</div>`;
                if (props.Endereço) popupContent += `<p><strong>Endereço:</strong> ${props.Endereço}</p>`;
                
                marker.bindPopup(popupContent);
                marker.bindTooltip(props.Descricao, { direction: 'top' });

                oms.addMarker(marker);

                // O resto do código para a lista lateral permanece o mesmo
                const localId = props.id;
                layerReferences[localId] = marker;
                const lista = document.getElementById('lista-locais');
                const item = document.createElement('li');
                item.setAttribute('data-id', localId);
                item.innerHTML = `<i class="fa-solid fa-location-dot item-icon"></i><div class="item-info"><div class="item-title">${props.Descricao}</div><div class="item-address">${props.Endereço || ''}</div></div>`;
                lista.appendChild(item);
                allListItems.push(item);
            });

            // Lógica da lista lateral
            const listaLocais = document.getElementById('lista-locais');
            listaLocais.addEventListener('click', e => {
                const listItem = e.target.closest('li');
                if (listItem) {
                    allListItems.forEach(li => li.classList.remove('active'));
                    listItem.classList.add('active');
                    const targetLayer = layerReferences[listItem.dataset.id];
                    if (targetLayer) {
                        map.setView(targetLayer.getLatLng(), 18);
                        targetLayer.openPopup();
                    }
                }
            });
        })
        .catch(error => console.error('Erro ao processar o GeoJSON:', error));
});
