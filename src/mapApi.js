const mapApiKey = 'fefb4bbb-3c15-4081-81e6-f10f43279928';
const dictApiKey = 'ruosle8764';
const centerPoint = [37.61556, 55.75222];
const catalogApiUrl = "https://catalog.api.2gis.com/3.0/items";
const routingApiUrl = "https://routing.api.2gis.com/carrouting/6.0.0/global";
const mapgl = window.mapgl;

let map = undefined;
let currentMarker = undefined;
let startMarker = undefined;
let destinationMarker = undefined;
let directions = [];
let startDirection = undefined;

const labelConfig = {
    offset: [0, -75],
    image: {
        url: 'https://docs.2gis.com/img/mapgl/tooltip.svg',
        size: [100, 40],
        padding: [10, 10, 20, 10],
    },
    fontSize: 16
};

const createMapInstance = () => {
    map = new mapgl.Map('map-container', {
        key: mapApiKey,
        center: centerPoint,
        zoom: 11,
        lang: "ru",
    });
};

const findPlace = async (query) => {
    const url = new URL(catalogApiUrl);
    url.searchParams.append('key', dictApiKey);
    url.searchParams.append('sort_point', centerPoint.join(','));
    url.searchParams.append('q', query);
    url.searchParams.append('fields', 'items.point');
    const response = await fetch(url);
    const places = await response.json();
    const place = places.result ? places.result.items[0] : null;
    console.log(place);
    return place;
};

const buildRouteToStartPoint = () => {
    if (startDirection) startDirection.clear();
    if (currentMarker) {
        const routeToStartPoint = new mapgl.Directions(map, {
            directionsApiKey: mapApiKey,
        });

        routeToStartPoint.pedestrianRoute({
            points: 
                [currentMarker.getCoordinates(), startMarker.getCoordinates()]
        });

        startDirection = routeToStartPoint;
    }
};

const setCurrentPlaceMarker = (place) => {
    console.log(place);
    if (!place) {
        alert('Не удалось найти место по вашему запросу', 'warning');
    } else if (!currentMarker) {
        currentMarker = new mapgl.Marker(map, {
            coordinates: [place.point.lon, place.point.lat],
            label: {
                ...labelConfig,
                text: 'Вы находитесь здесь'
            }
        });

        if (startMarker) buildRouteToStartPoint();
    } else {
        currentMarker.setCoordinates([place.point.lon, place.point.lat]);
        if (startMarker) buildRouteToStartPoint();
    }
};

const setStartPlaceMarker = (coords) => {
    console.log('startm', coords);
    if (!startMarker) {
        startMarker = new mapgl.Marker(map, {
            coordinates: [coords[0], coords[1]],
            label: {
                text: 'Начало маршрута',
                ...labelConfig
            }
        });
    } else {
        startMarker.setCoordinates([coords[0], coords[1]]);
    }
};

const setDestinationPlaceMarker = (coords) => {
    if (!destinationMarker) {
        destinationMarker = new mapgl.Marker(map, {
            coordinates: [coords[0], coords[1]],
            label: {
                text: 'Конец маршрута',
                ...labelConfig
            }
        });
    } else {
        destinationMarker.setCoordinates([coords[0], coords[1]]);
    }
};

const createDirections = async (coords) => {
    directions.map(el => el.clear());
    directions = [];
    const routeChunks = [];
    for (let i = 1; i < coords.length; i += 9) {
        routeChunks.push(coords.slice(i - 1, i + 9));
    }
    window.chunks = routeChunks;

    for (let i = 0; i < routeChunks.length; i++) {
        directions.push(
            new mapgl.Directions(map, {
                directionsApiKey: mapApiKey,
            })
        );

        await directions[i].pedestrianRoute({
            points: routeChunks[i]
        });

        // hide lable on every marker
        for (let m = 0; m < routeChunks[i].length; m++) {
            directions[i].ppnaDrawer.markers[m].setLabel('');
        }
    }
};

const buildRoute = async (coords, type) => {
    if (type === 'point') {
        buildRouteToStartPoint();
    } else {
        await createDirections(coords);
        buildRouteToStartPoint();
    }

    console.log(directions);
};

const selectRouteHandler = (coords) => {
    if (typeof(coords[0]) == 'number') {
        setStartPlaceMarker(coords);
        buildRoute(coords, 'point');
    } else if (coords[0].length == 2) {
        setStartPlaceMarker(coords[0]);
        setDestinationPlaceMarker(coords[coords.length - 1]);
        buildRoute(coords, 'route');
    } else {
        let joined = [...coords[0], ...coords[1]];
        console.log(joined);
        setStartPlaceMarker(joined[0]);
        setDestinationPlaceMarker(joined[joined.length - 1]);
        buildRoute(joined, 'route');
    }
};

const attachPlaceSearchHandler = () => {
    const search = document.querySelector('.place-input');
    const input = search.children[0];
    const button = search.children[1];

    button.onclick = async () => {
        const place = await findPlace(input.value);
        console.log(place);
        setCurrentPlaceMarker(place);
        console.log('invoked');
    };
};

window.addEventListener('load', () => {
    createMapInstance();
    attachPlaceSearchHandler();
});