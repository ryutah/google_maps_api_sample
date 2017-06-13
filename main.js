const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const API_KEY = "APIKEY"
const APIURI = `https://maps.googleapis.com/maps/api/geocode/json?&key=${API_KEY}`;

function initAutocomplete() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -33.8688,
      lng: 151.2195
    },
    zoom: 18,
    mapTypeId: 'roadmap'
  });

  const mapMoveTo = (lat, lng) => {
    map.setCenter({
      lat: Number(lat),
      lng: Number(lng)
    });
  };

  // Create the search box and link it to the UI element.
  const input = document.querySelector('#pac-input');
  const searchBox = new google.maps.places.SearchBox(input);
  const result = document.querySelector("#result");

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', () => {
    const createAddressComponentsDOM = (addresses) => {
      const doms = addresses.map((address, index) => {
        const type = address.types.join(",");
        return `
          <tr>
            <th>${type}</th>
            <td>${address.long_name}</td>
          </tr>
        `;
      });
      return `
        <h5>Address Components</h5>
        <table class="result_table">
          ${doms.join("\n")}
        </table>
      `;
    };

    const createResultDOM = (r, index) => {
      return `
        <div id="${r.place_id}">
          <h4>${LABELS[index % LABELS.length]} : ${r.formatted_address}</h4>
          ${createAddressComponentsDOM(r.address_components)}
          <h5>Location : ${r.geometry.location.lat}, ${r.geometry.location.lng}(${r.geometry.location_type})</h5>
          <button class="move_location" lat="${r.geometry.location.lat}" lng="${r.geometry.location.lng}">移動</button>
        </div>
      `;
    };

    const renderResults = (results) => {
      const resultDOMS = results.map(createResultDOM);
      result.innerHTML = resultDOMS.join("\n");
    };

    const clearMarker = () => {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
    };

    const createMarker = (result, index) => {
      const loc = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      };

      return new google.maps.Marker({
        position: loc,
        label: LABELS[index % LABELS.length],
        map: map
      });
    };

    const addMarkers = (results) => {
      results.forEach((result, index) => {
        const marker = createMarker(result, index);
        markers.push(marker);
      });
    };

    const address = encodeURI(input.value);
    const uri = `${APIURI}&address=${address}`;

    fetch(uri).then((response) => {
      return response.json();
    }).then((json) => {
      console.log(json);
      if (json.status !== "OK") {
        alert("Place not found");
        return;
      }

      renderResults(json.results);

      clearMarker();
      addMarkers(json.results);

      mapMoveTo(json.results[0].geometry.location.lat, json.results[0].geometry.location.lng);

      const moveLocations = document.querySelectorAll(".move_location");
      moveLocations.forEach((moveLocation) => {
        moveLocation.addEventListener("click", (event) => {
          mapMoveTo(event.target.attributes.lat.value, event.target.attributes.lng.value);
        });
      })
    });
  });

}

initAutocomplete();
