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

// --- LÓGICA PRINCIPAL (VERSÃO REFATORADA) ---

const layerReferences = {};
let allListItems = [];
let individualMarkersLayer = L.featureGroup(); // Camada para marcadores individuais
let spiderfier = new L.OMS(map); // Inicializa o novo plugin Spiderfier

// Nível de zoom para trocar as camadas
const SPIDERFY_ZOOM_LEVEL = 18;

fetch('pontos_turisticos.geojson')
    .then(response => response.json())
    .then(data => {
        document.getElementById('locations-count').textContent = `${data.features.length} pontos turísticos`;

        // Criamos os marcadores individuais e os adicionamos ao Spiderfier
        data.features.forEach(feature => {
            const props = feature.properties;
            const latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            const marker = L.marker(latlng);

            if (props.IMG) {
                const fotoUrl = props.IMG.replace(/\\/g, '/').replace(/^\//, '');
                const iconWidth = 80;
                const iconHeight = 90;
                marker.setIcon(L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="pin-body"><img src="${fotoUrl}" alt="${props.Descricao}"></div>`,
                    iconSize: [iconWidth, iconHeight],
                    iconAnchor: [iconWidth / 2, iconHeight + 15],
                    popupAnchor: [0, -(iconHeight + 15)]
                }));
            }

            let popupContent = `<h3>${props.Descricao}</h3>`;
            if (props.IMG) {
                let fotoUrlPopup = props.IMG.replace(/\\/g, '/').replace(/^\//, '');
                popupContent += `<img src="${fotoUrlPopup}" alt="${props.Descricao}" class="popup-foto popup-image-clickable">`;
            }
            if (props.Historia) popupContent += `<div class="popup-descricao">${props.Historia}</div>`;
            if (props.Endereço) popupContent += `<p><strong>Endereço:</strong> ${props.Endereço}</p>`;
            if (props.IMG360) {
                let img360Url = props.IMG360.replace(/\\/g, '/').replace(/^\//, '');
                popupContent += `<a href="#" class="popup-360-button" data-img360="${img360Url}"><i class="fa-solid fa-vr-cardboard"></i> Ver em 360°</a>`;
            }
            marker.bindPopup(popupContent);
            marker.bindTooltip(props.Descricao, { direction: 'top' });

            const localId = props.id;
            layerReferences[localId] = marker;
            
            // Adiciona o marcador à camada de marcadores individuais e ao spiderfier
            individualMarkersLayer.addLayer(marker);
            spiderfier.addMarker(marker);

            const lista = document.getElementById('lista-locais');
            const item = document.createElement('li');
            item.setAttribute('data-id', localId);
            item.innerHTML = `<i class="fa-solid fa-location-dot item-icon"></i><div class="item-info"><div class="item-title">${props.Descricao}</div><div class="item-address">${props.Endereço || ''}</div></div>`;
            lista.appendChild(item);
            allListItems.push(item);

            marker.on('click', () => {
                allListItems.forEach(li => li.classList.remove('active'));
                const activeListItem = document.querySelector(`#lista-locais li[data-id='${localId}']`);
                if (activeListItem) {
                    activeListItem.classList.add('active');
                    activeListItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });

        // Lógica de troca de camadas baseada no zoom
        function updateLayers() {
            const currentZoom = map.getZoom();
            if (currentZoom >= SPIDERFY_ZOOM_LEVEL) {
                if (!map.hasLayer(individualMarkersLayer)) {
                    console.log("ZOOM >= 18: Mostrando marcadores individuais com Spiderfy.");
                    map.addLayer(individualMarkersLayer);
                }
            } else {
                if (map.hasLayer(individualMarkersLayer)) {
                    console.log("ZOOM < 18: Escondendo marcadores individuais.");
                    map.removeLayer(individualMarkersLayer);
                }
            }
        }

        map.on('zoomend', updateLayers);
        updateLayers(); // Chama a função uma vez para definir o estado inicial

        // --- Lógica de Eventos da Lista (simplificada) ---
        const listaLocais = document.getElementById('lista-locais');
        listaLocais.addEventListener('click', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                allListItems.forEach(li => li.classList.remove('active'));
                listItem.classList.add('active');
                const targetLayer = layerReferences[listItem.dataset.id];
                if (targetLayer) {
                    map.setView(targetLayer.getLatLng(), SPIDERFY_ZOOM_LEVEL);
                    targetLayer.openPopup();
                }
                if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
            }
        });
        // ... (eventos de mouseover e mouseout continuam iguais) ...
    })
    .catch(error => console.error('Erro ao processar o GeoJSON:', error));

// ... (todo o resto do código para modal e 360 continua igual) ...
