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

    // --- LÓGICA DO MENU HAMBÚRGUER ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    // --- CAMADAS DE MAPA BASE ---
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    } );
    const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Dados de imagem &copy;2025 Google'
    } );
    osmLayer.addTo(map);
    L.control.layers({ "Ruas": osmLayer, "Satélite": googleSat }, null, { position: 'bottomright' }).addTo(map);

    // --- LÓGICA PRINCIPAL ---
    const oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });

    const layerReferences = {};
    let allListItems = [];

    oms.addListener('click', (marker) => {
        marker.openPopup();
    });
    oms.addListener('spiderfy', () => map.closePopup());

    fetch('pontos_turisticos.geojson')
        .then(response => response.json())
        .then(data => {
            // RESTAURADO: A contagem de locais
            document.getElementById('locations-count').textContent = `${data.features.length} pontos turísticos`;

            data.features.forEach(feature => {
                const props = feature.properties;
                const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
                
                // TESTE: Usando o marcador padrão do Leaflet
                const marker = L.marker(latlng);
                
                let popupContent = `<h3>${props.Descricao}</h3>`;
                if (props.Historia) popupContent += `<div class="popup-descricao">${props.Historia}</div>`;
                if (props.Endereço) popupContent += `<p><strong>Endereço:</strong> ${props.Endereço}</p>`;
                
                marker.bindPopup(popupContent);
                marker.bindTooltip(props.Descricao, { direction: 'top' });

                oms.addMarker(marker);

                // RESTAURADO: A lógica completa da lista lateral
                const localId = props.id;
                layerReferences[localId] = marker;
                const lista = document.getElementById('lista-locais');
                const item = document.createElement('li');
                item.setAttribute('data-id', localId);
                item.innerHTML = `<i class="fa-solid fa-location-dot item-icon"></i><div class="item-info"><div class="item-title">${props.Descricao}</div><div class="item-address">${props.Endereço || ''}</div></div>`;
                lista.appendChild(item);
                allListItems.push(item);
            });

            // RESTAURADO: A lógica de eventos da lista e da busca
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
                    if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
                }
            });
            listaLocais.addEventListener('mouseover', e => {
                const listItem = e.target.closest('li');
                if (listItem) {
                    const targetLayer = layerReferences[listItem.dataset.id];
                    if (targetLayer?.getElement()) targetLayer.getElement().classList.add('highlight');
                }
            });
            listaLocais.addEventListener('mouseout', e => {
                const listItem = e.target.closest('li');
                if (listItem) {
                    const targetLayer = layerReferences[listItem.dataset.id];
                    if (targetLayer?.getElement()) targetLayer.getElement().classList.remove('highlight');
                }
            });

            const searchBox = document.getElementById('search-box');
            const clearSearchBtn = document.getElementById('clear-search-btn');
            function filterList() {
                const searchTerm = searchBox.value.toLowerCase();
                clearSearchBtn.classList.toggle('visible', searchTerm.length > 0);
                allListItems.forEach(item => {
                    const itemText = item.textContent.toLowerCase();
                    item.style.display = itemText.includes(searchTerm) ? 'flex' : 'none';
                });
            }
            searchBox.addEventListener('input', filterList);
            clearSearchBtn.addEventListener('click', () => {
                searchBox.value = '';
                filterList();
                searchBox.focus();
            });
        })
        .catch(error => console.error('Erro ao processar o GeoJSON:', error));
});
