const socket = io();

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Aritra's map",
}).addTo(map);

const markers = {};

socket.on("current-users", (users) => {
    Object.keys(users).forEach((id) => {
        const { latitude, longitude } = users[id];
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ${id}`)
            .openPopup();
    });
});

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });

        map.setView([latitude, longitude], 16);

        if (markers[socket.id]) {
            markers[socket.id].setLatLng([latitude, longitude]);
        } else {
            markers[socket.id] = L.marker([latitude, longitude]).addTo(map)
                .bindPopup(`You are here!`)
                .openPopup();
        }
    }, (error) => {
        console.error(error);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000    
    });
} else {
    console.error('Geolocation is not supported by this browser.');
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ${id}`)
            .openPopup();
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
