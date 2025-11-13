Mapa interativo dos pontos turísticos de Pitangui/MG. Explore locais históricos, veja fotos, endereços e faça um tour virtual com imagens em 360°. Desenvolvido com Leaflet.js e Photo Sphere Viewer, o projeto oferece uma experiência rica e responsiva para descobrir as belezas da Sétima Vila do Ouro.

Este projeto foi feito para uma disciplina do Instituto Tecnológico de Agropecuária de Pitangui (ITAP)

# Mapa Interativo de Pontos Turísticos de Pitangui

## Explore as belezas da Sétima Vila do Ouro de Minas Gerais


Este projeto é uma aplicação web interativa desenvolvida para exibir e explorar os pontos turísticos da cidade histórica de Pitangui, MG. A plataforma combina um mapa dinâmico com uma interface moderna e responsiva, permitindo aos usuários descobrir locais, visualizar fotos, obter informações e até mesmo fazer um tour virtual com imagens em 360°.

---

## ✨ Funcionalidades Principais

*   **Mapa Interativo:** Visualização dos pontos turísticos em um mapa dinâmico com marcadores personalizados.
*   **Barra Lateral Inteligente:** Lista de todos os locais, com busca em tempo real e sincronização com o mapa.
*   **Design Responsivo:** Interface totalmente adaptada para uma experiência de uso perfeita em desktops, tablets e smartphones.
*   **Agrupamento de Marcadores:** Pontos próximos são agrupados de forma inteligente em níveis de zoom mais baixos para um mapa mais limpo.
*   **Popups Detalhados:** Ao clicar em um ponto, um popup exibe o nome, foto, endereço e descrição histórica do local.
*   **Visualização de Imagens:** As fotos dos locais podem ser ampliadas em tela cheia para melhor visualização.
*   **Tour Virtual 360°:** Suporte para visualização de imagens panorâmicas (360°) do interior de locais selecionados, proporcionando uma experiência imersiva.
*   **Interatividade Avançada:**
    *   Passar o mouse sobre um item na lista destaca e amplia o pino correspondente no mapa.
    *   Clicar em um pino no mapa destaca e rola a lista para o item correspondente.
*   **Troca de Mapa Base:** Opção para alternar entre a visualização de ruas (OpenStreetMap) e satélite (Google).

---

## 🛠️ Tecnologias Utilizadas

*   **HTML5:** Estrutura semântica da aplicação.
*   **CSS3:** Estilização avançada, layout com Flexbox e design responsivo com Media Queries.
*   **JavaScript (ES6+):** Lógica principal da aplicação, manipulação do DOM e interatividade.
*   **Leaflet.js:** Biblioteca de código aberto para a criação de mapas interativos.
*   **Leaflet.markercluster:** Plugin para agrupar marcadores no mapa.
*   **Photo Sphere Viewer:** Biblioteca para a exibição de imagens panorâmicas em 360°.
*   **GeoJSON:** Formato padrão para armazenar os dados geográficos e as informações dos pontos turísticos.
*   **Font Awesome:** Biblioteca de ícones para a interface.
*   **Google Fonts:** Para uma tipografia moderna e legível.

---

## 🚀 Como Executar o Projeto Localmente

Para testar ou desenvolver o projeto em sua máquina local, você precisa de um servidor web simples. Não é possível abrir o `index.html` diretamente no navegador devido às políticas de segurança (CORS) que bloqueiam o carregamento do arquivo GeoJSON.

1.  **Pré-requisito:** Ter o [Python](https://www.python.org/downloads/ ) instalado.

2.  **Clone ou baixe este repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    ```

3.  **Navegue até a pasta do projeto:**
    ```bash
    cd seu-repositorio
    ```

4.  **Inicie um servidor local com Python:**
    *   Se você usa Python 3:
        ```bash
        python -m http.server 8080
        ```
    *   Se você usa Python 2:
        ```bash
        python -m SimpleHTTPServer 8080
        ```

5.  **Abra o navegador:**
    Acesse a URL [http://localhost:8080](http://localhost:8080 ) e a aplicação será carregada.
