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

// --- LÓGICA PRINCIPAL (VERSÃO DE DEPURAÇÃO) ---

// ==================================================================
// PASSO 1 DE DEPURAÇÃO: O OMS está sendo criado?
// ==================================================================
let oms; // Declaramos a variável aqui para ser acessível globalmente no script
try {
    oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true });
    console.log('%c[DEBUG 1] SUCESSO: OverlappingMarkerSpiderfier (OMS) foi criado.', 'color: green; font-weight: bold;');
    
    oms.addListener('spiderfy', (markers) => {
        console.log('%c[DEBUG 3] EVENTO: "spiderfy" foi disparado!', 'color: blue; font-weight: bold;');
        map.closePopup();
    });

    oms.addListener('unspiderfy', (markers) => {
        console.log('%c[DEBUG 3] EVENTO: "unspiderfy" foi disparado!', 'color: orange; font-weight: bold;');
    });

    oms.addListener('click', (marker) => {
        console.log('%c[DEBUG 3] EVENTO: "click" do OMS foi disparado.', 'color: blue; font-weight: bold;');
        L.popup().setLatLng(marker.getLatLng()).setContent(marker.desc).openOn(map);
    });

} catch (e) {
    console.error('%c[DEBUG 1] FALHA: Não foi possível criar o OverlappingMarkerSpiderfier. Erro:', 'color: red; font-weight: bold;', e);
}


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
                
                if (feature.properties.IMG) {
                    const fotoUrl = feature.properties.IMG.replace(/\\/g, '/').replace(/^\//, '');
                    marker.setIcon(L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="pin-body"><img src="${fotoUrl}" alt="${feature.properties.Descricao}"></div>`,
                        iconSize: [80, 90],
                        iconAnchor: [40, 105],
                        popupAnchor: [0, -105]
                    }));
                }
                
                // ==================================================================
                // PASSO 2 DE DEPURAÇÃO: Os marcadores estão sendo registrados?
                // ==================================================================
                if (oms) {
                    oms.addMarker(marker);
                } else {
                    console.error('%c[DEBUG 2] FALHA: Tentativa de adicionar marcador, mas o OMS não existe.', 'color: red; font-weight: bold;');
                }
                
                return marker;
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                let popupContent = `<h3>${props.Descricao}</h3>`;
                if (props.IMG) popupContent += `<img src="${props.IMG.replace(/\\/g, '/').replace(/^\//, '')}" alt="${props.Descricao}" class="popup-foto popup-image-clickable">`;
                if (props.Historia) popupContent += `<div class="popup-descricao">${props.Historia}</div>`;
                if (props.Endereço) popupContent += `<p><strong>Endereço:</strong> ${props.Endereço}</p>`;
                if (props.IMG360) popupContent += `<a href="#" class="popup-360-button" data-img360="${props.IMG360.replace(/\\/g, '/').replace(/^\//, '')}"><i class="fa-solid fa-vr-cardboard"></i> Ver em 360°</a>`;
                
                layer.desc = popupContent;
                layer.bindTooltip(props.Descricao, { direction: 'top' });

                const localId = props.id;
                layerReferences[localId] = layer;
                const lista = document.getElementById('lista-locais');
                const item = document.createElement('li');
                item.setAttribute('data-id', localId);
                item.innerHTML = `<i class="fa-solid fa-location-dot item-icon"></i><div class="item-info"><div class="item-title">${props.Descricao}</div><div class="item-address">${props.Endereço || ''}</div></div>`;
                lista.appendChild(item);
                allListItems.push(item);

                layer.on('spiderfiedclick', () => {
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

        // ==================================================================
        // PASSO 2 DE DEPURAÇÃO (Continuação): Quantos marcadores foram registrados?
        // ==================================================================
        if (oms) {
            const trackedMarkers = oms.getMarkers();
            console.log(`%c[DEBUG 2] INFO: ${trackedMarkers.length} marcadores foram registrados no OMS.`, 'color: purple; font-weight: bold;');
        }

        // --- Lógica de Eventos da Lista ---
        const listaLocais = document.getElementById('lista-locais');
        listaLocais.addEventListener('click', e => {
            const listItem = e.target.closest('li');
            if (listItem) {
                allListItems.forEach(li => li.classList.remove('active'));
                listItem.classList.add('active');
                const targetLayer = layerReferences[listItem.dataset.id];
                if (targetLayer) {
                    markers.zoomToShowLayer(targetLayer, () => {
                        setTimeout(() => {
                            L.popup().setLatLng(targetLayer.getLatLng()).setContent(targetLayer.desc).openOn(map);
                        }, 100);
                    });
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

        // --- Lógica da Barra de Busca ---
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
                navbar: ['zoom', 'move', 'gyroscope', 'fullscreen', 'caption'],
                defaultZoomLvl: 0,
                plugins: [[PhotoSphereViewer.GyroscopePlugin, { touchmove: true, absolutePosition: false }]]
            });
        }
    }
});
