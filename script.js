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
const markers = L.markerClusterGroup();
const layerReferences = {};
let allListItems = [];

fetch('pontos_turisticos.geojson')
    .then(response => response.json())
    .then(data => {
        document.getElementById('locations-count').textContent = `${data.features.length} pontos turísticos`;

        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                const marker = L.marker(latlng);
                let fotoUrl = feature.properties.IMG;
                if (fotoUrl) {
                    fotoUrl = fotoUrl.replace(/\\/g, '/').replace(/^\//, '');
                    const img = new Image();
                    img.src = fotoUrl;
                    img.onload = function () {
                        const minSize = 70;
                        const ratio = this.width / this.height;
                        const imageWidth = ratio > 1 ? minSize * ratio : minSize;
                        const imageHeight = ratio > 1 ? minSize : minSize / ratio;
                        const iconWidth = imageWidth + 8;
                        const iconHeight = imageHeight + 8;
                        marker.setIcon(L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class="pin-body"><img src="${fotoUrl}" alt="${feature.properties.Descricao}"></div>`,
                            iconSize: [iconWidth, iconHeight],
                            iconAnchor: [iconWidth / 2, iconHeight + 15],
                            popupAnchor: [0, -(iconHeight + 15)]
                        }));
                    };
                }
                return marker;
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
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
                layer.bindPopup(popupContent);
                layer.bindTooltip(props.Descricao, { direction: 'top' });

                const localId = props.id;
                layerReferences[localId] = layer;
                const lista = document.getElementById('lista-locais');
                const item = document.createElement('li');
                item.setAttribute('data-id', localId);
                item.innerHTML = `<i class="fa-solid fa-location-dot item-icon"></i><div class="item-info"><div class="item-title">${props.Descricao}</div><div class="item-address">${props.Endereço || ''}</div></div>`;
                lista.appendChild(item);
                allListItems.push(item);

                layer.on('click', () => {
                    allListItems.forEach(li => li.classList.remove('active'));
                    const activeListItem = document.querySelector(`#lista-locais li[data-id='${localId}']`);
                    if (activeListItem) {
                        activeListItem.classList.add('active');
                        activeListItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                });
            }
        });

        markers.addLayer(geoJsonLayer);
        map.addLayer(markers);

        const listaLocais = document.getElementById('lista-locais');
        listaLocais.addEventListener('click', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                allListItems.forEach(li => li.classList.remove('active'));
                listItem.classList.add('active');
                const targetLayer = layerReferences[listItem.dataset.id];
                if (targetLayer) markers.zoomToShowLayer(targetLayer, () => targetLayer.openPopup());
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

        // --- LÓGICA DA BARRA DE BUSCA (VERSÃO FINAL CORRIGIDA) ---
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

// --- LÓGICA DO MODAL DE IMAGEM (LIGHTBOX) ---
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

// --- LÓGICA DO VISUALIZADOR 360 ---
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
    const button360 = e.target.closest('.popup-360-button');
    if (button360) {
        e.preventDefault();
        const imageUrl = button360.dataset.img360;
        if (imageUrl) {
            viewerContainer.style.display = 'block';
            viewerInstance = new PhotoSphereViewer.Viewer({
                container: viewerDiv,
                panorama: imageUrl,
                navbar: [
                    'zoom',
                    'move',
                    'gyroscope',
                    'fullscreen',
                    'caption'
                ],
                defaultZoomLvl: 0,
                plugins: [
                    [PhotoSphereViewer.GyroscopePlugin, {
                        touchmove: true,
                        absolutePosition: false,
                    }]
                ]
            });
        }
    }
});
