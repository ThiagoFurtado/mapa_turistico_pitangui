// Este evento só vai disparar DEPOIS que TUDO na página (imagens, scripts, etc.) for carregado.
window.onload = function() {
    console.log('[TESTE] O evento window.onload foi disparado. A página está 100% carregada.');

    // Agora, vamos verificar se a variável existe.
    if (typeof OverlappingMarkerSpiderfier !== 'undefined') {
        console.log('%c[TESTE] SUCESSO! A variável "OverlappingMarkerSpiderfier" foi encontrada!', 'color: green; font-weight: bold;');
        
        // Se ela existe, vamos tentar criar uma instância para ter certeza.
        try {
            // Para criar o OMS, precisamos de um mapa. Vamos criar um mapa temporário para o teste.
            const map = L.map('map').setView([-19.685, -44.89], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo(map);

            const oms = new OverlappingMarkerSpiderfier(map);
            console.log('%c[TESTE] SUCESSO! Uma instância do OMS foi criada com sucesso.', 'color: green; font-weight: bold;');
            
            // Se chegamos até aqui, podemos dizer com segurança que o problema foi resolvido
            // e podemos restaurar o código completo da aplicação dentro deste bloco 'window.onload'.
            console.log('%c[DIAGNÓSTICO] O problema era a ordem de carregamento dos scripts. A solução é envolver todo o código da aplicação dentro de "window.onload = function() { ... };"', 'color: blue;');


        } catch (e) {
            console.error('%c[TESTE] FALHA! A variável existe, mas não é um construtor. Erro:', 'color: red; font-weight: bold;', e);
        }

    } else {
        console.error('%c[TESTE] FALHA! A variável "OverlappingMarkerSpiderfier" NÃO foi encontrada.', 'color: red; font-weight: bold;');
    }
};
