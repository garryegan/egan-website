(async function() {
    const res = await fetch("/api/maps-key");
    const { key } = await res.json();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap&libraries=marker`;
    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
})();
