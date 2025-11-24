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
});
const googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: 'Dados de imagem &copy;2025 Google'
});
osmLayer.addTo(map);

L.control.layers(
    { "Ruas": osmLayer, "Satélite": googleSat },
    null,
    { position: 'bottomright' }
).addTo(map);

// --- LÓGICA PRINCIPAL ---

// 🔥 REMOVIDO MarkerClusterGroup
// const markers = L.markerClusterGroup();

// Usar apenas o Spiderfier
const oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });

const layerReferences = {};
let allListItems = [];

// Impedir popups de fecharem quando spiderfy ativar
oms.addListener('spiderfy', () => map.closePopup());

// Abrir popup ao clicar (pelo OMS)
oms.addListener('click', (marker) => {
    L.popup()
        .setLatLng(marker.getLatLng())
        .setContent(marker.desc)
        .openOn(map);
});

fetch('pontos_turisticos.geojson')
    .then(response => response.json())
    .then(data => {

        document.getElementById('locations-count').textContent =
            `${data.features.length} pontos turísticos`;

        data.features.forEach(feature => {
            const props = feature.properties;
            const latlng = L.latLng(
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
            );

            const marker = L.marker(latlng);

            // Ícone personalizado com miniatura
            if (props.IMG) {
                const fotoUrl = props.IMG.replace(/\\/g, '/').replace(/^\//, '');
                marker.setIcon(L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="pin-body"><img src="${fotoUrl}" alt="${props.Descricao}"></div>`,
                    iconSize: [80, 90],
                    iconAnchor: [40, 105],
                    popupAnchor: [0, -105]
                }));
            }

            // Conteúdo de popup usado pelo OMS
            let popupContent = `<h3>${props.Descricao}</h3>`;
            if (props.IMG)
                popupContent += `<img src="${props.IMG.replace(/\\/g, '/').replace(/^\//, '')}" 
                                  alt="${props.Descricao}" 
                                  class="popup-foto popup-image-clickable">`;
            if (props.Historia)
                popupContent += `<div class="popup-descricao">${props.Historia}</div>`;
            if (props.Endereço)
                popupContent += `<p><strong>Endereço:</strong> ${props.Endereço}</p>`;
            if (props.IMG360)
                popupContent += `<a href="#" class="popup-360-button" data-img360="${props.IMG360.replace(/\\/g, '/').replace(/^\//, '')}">
                                    <i class="fa-solid fa-vr-cardboard"></i> Ver em 360°
                                 </a>`;

            marker.desc = popupContent;

            marker.bindTooltip(props.Descricao, { direction: 'top' });

            // Registrar na lista lateral
            const localId = props.id;
            layerReferences[localId] = marker;

            const lista = document.getElementById('lista-locais');
            const item = document.createElement('li');
            item.setAttribute('data-id', localId);
            item.innerHTML = `
                <i class="fa-solid fa-location-dot item-icon"></i>
                <div class="item-info">
                    <div class="item-title">${props.Descricao}</div>
                    <div class="item-address">${props.Endereço || ''}</div>
                </div>
            `;
            lista.appendChild(item);
            allListItems.push(item);

            // Adicionar ao OMS
            oms.addMarker(marker);

            // 🔥 MARCADOR DIRETO NO MAPA (SEM CLUSTER)
            map.addLayer(marker);
        });

        // LISTA DE EVENTOS
        const listaLocais = document.getElementById('lista-locais');

        listaLocais.addEventListener('click', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                allListItems.forEach(li => li.classList.remove('active'));
                listItem.classList.add('active');

                const target = layerReferences[listItem.dataset.id];

                if (target) {
                    // Zoom manual ao ponto
                    map.setView(target.getLatLng(), 19);

                    setTimeout(() => {
                        L.popup()
                            .setLatLng(target.getLatLng())
                            .setContent(target.desc)
                            .openOn(map);
                    }, 200);
                }

                if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
            }
        });

        listaLocais.addEventListener('mouseover', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                const target = layerReferences[listItem.dataset.id];
                if (target?.getElement()) target.getElement().classList.add('highlight');
            }
        });

        listaLocais.addEventListener('mouseout', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                const target = layerReferences[listItem.dataset.id];
                if (target?.getElement()) target.getElement().classList.remove('highlight');
            }
        });

        // BARRA DE BUSCA
        const searchBox = document.getElementById('search-box');
        const clearSearchBtn = document.getElementById('clear-search-btn');

        function filterList() {
            const term = searchBox.value.toLowerCase();
            clearSearchBtn.classList.toggle('visible', term.length > 0);
            allListItems.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
            });
        }

        searchBox.addEventListener('input', filterList);
        clearSearchBtn.addEventListener('click', () => {
            searchBox.value = "";
            filterList();
            searchBox.focus();
        });
    })
    .catch(error => console.error('Erro ao processar o GeoJSON:', error));


// --- MODAL DE IMAGEM ---
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-image-content");
const closeModalBtn = document.getElementsByClassName("modal-close")[0];

const closeModal = () => modal.style.display = "none";
closeModalBtn.onclick = closeModal;

modal.onclick = e => { if (e.target === modal) closeModal(); };

document.addEventListener('click', e => {
    if (e.target?.classList.contains('popup-image-clickable')) {
        modal.style.display = "flex";
        modalImg.src = e.target.src;
    }
});

// --- VISUALIZADOR 360 ---
const viewerContainer = document.getElementById('viewer-360-container');
const viewerDiv = document.getElementById('viewer-360');
const close360Btn = document.getElementById('viewer-360-close');
let viewerInstance = null;

const close360Viewer = () => {
    viewerContainer.style.display = 'none';
    if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
    }
};

close360Btn.onclick = close360Viewer;

document.addEventListener('click', e => {
    const btn360 = e.target.closest('.popup-360-button');
    if (btn360) {
        e.preventDefault();
        const imageUrl = btn360.dataset.img360;

        if (imageUrl) {
            viewerContainer.style.display = 'block';

            viewerInstance = new PhotoSphereViewer.Viewer({
                container: viewerDiv,
                panorama: imageUrl,
                navbar: ['zoom', 'move', 'gyroscope', 'fullscreen', 'caption'],
                defaultZoomLvl: 0,
                plugins: [
                    [PhotoSphereViewer.GyroscopePlugin, {
                        touchmove: true,
                        absolutePosition: false
                    }]
                ]
            });
        }
    }
});
