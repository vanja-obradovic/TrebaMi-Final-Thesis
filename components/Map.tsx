import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "../styles/map.module.scss";
import * as ReactDOM from "react-dom";
import { GeoPoint } from "@firebase/firestore";

interface mapProps {
  locationMarker: boolean;
  setMarkerCoords: ({ lat, lng }) => void;
  popup: React.ReactNode;
  markerCords?: GeoPoint;
}

const Map = (props: mapProps) => {
  const { locationMarker, setMarkerCoords, popup, markerCords } = props;

  const mapElement = useRef();
  const [map, setMap] = useState<tt.Map>();
  const marker = useRef<tt.Marker>();

  const popupDiv = document.createElement("div");
  popupDiv.className = styles.popup;
  ReactDOM.render(popup, popupDiv);

  useEffect(() => {
    const initMap = async () => {
      const tt = await import("@tomtom-international/web-sdk-maps");

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
              setMarkerCoords({
                lng: e.coords.longitude,
                lat: e.coords.latitude,
              });
            })
            .on("error", (e: any) => {
              toast.error(
                e.code === 1 ? "Niste dali dozvolu za automatsko lociranje" : ""
              );
            })
        );

      if (locationMarker)
        mapObject
          .on("dblclick", (e) => {
            setMarkerCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
            marker.current?.remove();
            marker.current = new tt.Marker({
              draggable: true,
            })
              .setLngLat(e.lngLat)
              .addTo(mapObject)
              .on("dragend", () => {
                setMarkerCoords({
                  lng: marker.current.getLngLat().lng,
                  lat: marker.current.getLngLat().lat,
                });
              })
              .setPopup(new tt.Popup().setDOMContent(popupDiv).addTo(mapObject))
              .togglePopup();
          })
          .on("load", () => {
            mapObject.fitBounds([
              [18.82982, 42.2452243971],
              [22.9860185076, 46.1717298447],
            ]);
            if (markerCords) {
              marker.current = new tt.Marker({
                draggable: true,
              })
                .setLngLat([markerCords.longitude, markerCords.latitude])
                .addTo(mapObject)
                .on("dragend", () => {
                  setMarkerCoords({
                    lng: marker.current.getLngLat().lng,
                    lat: marker.current.getLngLat().lat,
                  });
                })
                .setPopup(
                  new tt.Popup().setDOMContent(popupDiv).addTo(mapObject)
                )
                .togglePopup();
            }
          });
      setMap(mapObject);
    };
    initMap();
    return () => map?.remove();
  }, []);

  return <div ref={mapElement} className={styles.mapDiv}></div>;
};

export default Map;
