// 1. Inicializar o mapa
const map = L.map('map').setView([-19.685, -44.89], 18); // Zoom mais próximo

// 2. Adicionar uma camada de mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
} ).addTo(map);

// 3. Criar o OverlappingMarkerSpiderfier (OMS)
const oms = new OverlappingMarkerSpiderfier(map);
console.log('%c[TESTE] OMS Criado.', 'color: green;');

// 4. Criar dois marcadores padrão na MESMA coordenada
const testCoord = [-19.6828, -44.8898]; // Coordenada da Igreja Matriz

const marker1 = L.marker(testCoord);
marker1.desc = 'Marcador de Teste 1';

const marker2 = L.marker(testCoord);
marker2.desc = 'Marcador de Teste 2';

// 5. Adicionar os marcadores ao mapa e ao OMS
map.addLayer(marker1);
map.addLayer(marker2);

oms.addMarker(marker1);
oms.addMarker(marker2);
console.log('%c[TESTE] 2 marcadores padrão adicionados ao OMS.', 'color: purple;');

// 6. Adicionar o listener de clique ao OMS
oms.addListener('click', function(marker) {
    console.log('%c[TESTE] Evento de clique do OMS disparado!', 'color: blue;');
    L.popup().setLatLng(marker.getLatLng()).setContent(marker.desc).openOn(map);
});

oms.addListener('spiderfy', function(markers) {
    console.log('%c[TESTE] Evento SPIDERFY disparado!', 'color: blue; font-weight: bold;');
});
