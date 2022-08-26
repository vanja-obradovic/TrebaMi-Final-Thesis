import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "../styles/map.module.scss";
import * as ReactDOM from "react-dom/client";
import { GeoPoint } from "@firebase/firestore";
// import SearchBox from "@tomtom-international/web-sdk-plugin-searchbox";
import { Map, Marker } from "@tomtom-international/web-sdk-maps";
// import { services } from "@tomtom-international/web-sdk-services";
import AdCard from "./AdCard";

interface mapProps {
  locationMarker: boolean;
  setMarkerCoords?: (location: GeoPoint) => void;
  popup?: React.ReactNode;
  markerCords?: { _long; _lat };
  // lastGeoPoint?: { _long; _lat };
}

const Map = (props: mapProps) => {
  const { locationMarker, setMarkerCoords, popup, markerCords } = props;

  const mapElement = useRef();
  const [map, setMap] = useState<Map>();
  const marker = useRef<Marker>();

  // const el = document.createElement("div");
  // el.innerHTML = "hello";

  useEffect(() => {
    const popupDiv = document.createElement("div");
    popupDiv.className = styles.popup;
    const root = ReactDOM.createRoot(popupDiv);
    root.render(popup);
    const initMap = async () => {
      const tt = await import("@tomtom-international/web-sdk-maps");
      const { services } = await import(
        "@tomtom-international/web-sdk-services"
      );

      const mapObject = tt
        .map({
          key: "eBXlMwdCvb3fyihhln6FAMi87pwNIet1",
          container: mapElement.current,
          clickTolerance: 15,
        })
        .addControl(
          new tt.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: false,
          })
            .on("geolocate", (e: any) => {
              if (locationMarker)
                setMarkerCoords(
                  new GeoPoint(e.coords.latitude, e.coords.longitude)
                );
            })
            .on("error", (e: any) => {
              toast.error(
                e.code === 1 ? "Niste dali dozvolu za automatsko lociranje" : ""
              );
            })
        );
      mapObject.addControl(new tt.FullscreenControl());
      mapObject.addControl(
        new tt.NavigationControl({ showExtendedRotationControls: true })
      );

      if (locationMarker) {
        mapObject.on("dblclick", (e) => {
          e.preventDefault();
          setMarkerCoords(new GeoPoint(e.lngLat.lat, e.lngLat.lng));

          marker.current?.remove();
          marker.current = new tt.Marker({
            draggable: true,
          })
            .setLngLat(e.lngLat)
            .addTo(mapObject)
            .on("dragend", () => {
              setMarkerCoords(
                new GeoPoint(
                  marker.current.getLngLat().lat,
                  marker.current.getLngLat().lng
                )
              );
            })
            .setPopup(new tt.Popup().setDOMContent(popupDiv).addTo(mapObject))
            .togglePopup();
        });
      }
      mapObject.on("load", () => {
        mapObject.fitBounds([
          [18.82982, 42.2452243971],
          [22.9860185076, 46.1717298447],
        ]);
        if (markerCords) {
          console.log(markerCords);
          marker.current = new tt.Marker({
            draggable: locationMarker,
          })
            .setLngLat([markerCords._long, markerCords._lat])
            .addTo(mapObject);
          if (locationMarker) {
            marker.current.on("dragend", () => {
              setMarkerCoords(
                new GeoPoint(
                  marker.current.getLngLat().lat,
                  marker.current.getLngLat().lng
                )
              );
            });
          }
          marker.current
            .setPopup(new tt.Popup().setDOMContent(popupDiv).addTo(mapObject))
            .togglePopup();

          mapObject.jumpTo({
            center: {
              lat: marker.current.getLngLat().lat,
              lng: marker.current.getLngLat().lng,
            },
            zoom: 15,
          });
        }
        // else if (lastGeoPoint) {
        //   marker.current = new tt.Marker({
        //     draggable: true,
        //   })
        //     .setLngLat([lastGeoPoint._long, lastGeoPoint._lat])
        //     .addTo(mapObject)
        //     .on("dragend", () => {
        //       setMarkerCoords(
        //         new GeoPoint(
        //           marker.current.getLngLat().lat,
        //           marker.current.getLngLat().lng
        //         )
        //       );
        //     })
        //     .setPopup(
        //       new tt.Popup().setDOMContent(popupDiv).addTo(mapObject)
        //     )
        //     .togglePopup();
        // mapObject.jumpTo({
        //   center: {
        //     lat: marker.current.getLngLat().lat,
        //     lng: marker.current.getLngLat().lng,
        //   },
        //   zoom: 15,
        // });
        // }
      });
      setMap(mapObject);

      // const ttSearchBox = new SearchBox(services, {
      //   idleTimePress: 100,
      //   minNumberOfCharacters: 0,
      //   searchOptions: {
      //     key: "",
      //     language: "en-GB",
      //   },
      //   autocompleteOptions: {
      //     key: "",
      //     language: "en-GB",
      //   },
      //   noResultsMessage: "No results found.",
      // });
      // map.addControl(ttSearchBox, "top-left");
      // ttSearchBox.on("tomtom.searchbox.resultsfound", function (data) {
      //   console.log(data);
      // });
    };
    initMap();
    return () => map?.remove();
  }, []);

  return <div ref={mapElement} className={styles.mapDiv}></div>;
};

export default Map;
