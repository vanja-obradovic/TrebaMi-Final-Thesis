import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "../styles/map.module.scss";
import * as ReactDOM from "react-dom/client";
import { GeoPoint } from "@firebase/firestore";

interface mapProps {
  locationMarker: boolean;
  setMarkerCoords: (location: GeoPoint) => void;
  popup?: React.ReactNode;
  markerCords?: GeoPoint;
  lastGeoPoint?;
}

const Map = (props: mapProps) => {
  const { locationMarker, setMarkerCoords, popup, markerCords, lastGeoPoint } =
    props;

  const mapElement = useRef();
  const [map, setMap] = useState<tt.Map>();
  const marker = useRef<tt.Marker>();

  const el = document.createElement("div");
  el.innerHTML = "hello";

  const popupDiv = document.createElement("div");
  popupDiv.className = styles.popup;

  const root = ReactDOM.createRoot(popupDiv);
  root.render(popup);

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

      if (locationMarker)
        mapObject
          .on("dblclick", (e) => {
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
                  setMarkerCoords(
                    new GeoPoint(
                      marker.current.getLngLat().lat,
                      marker.current.getLngLat().lng
                    )
                  );
                })
                .setPopup(
                  new tt.Popup().setDOMContent(popupDiv).addTo(mapObject)
                )
                .togglePopup();
              mapObject.jumpTo({
                center: {
                  lat: marker.current.getLngLat().lat,
                  lng: marker.current.getLngLat().lng,
                },
                zoom: 15,
              });
            } else if (lastGeoPoint) {
              marker.current = new tt.Marker({
                draggable: true,
              })
                .setLngLat([lastGeoPoint._long, lastGeoPoint._lat])
                .addTo(mapObject)
                .on("dragend", () => {
                  setMarkerCoords(
                    new GeoPoint(
                      marker.current.getLngLat().lat,
                      marker.current.getLngLat().lng
                    )
                  );
                })
                .setPopup(
                  new tt.Popup().setDOMContent(popupDiv).addTo(mapObject)
                )
                .togglePopup();
              mapObject.jumpTo({
                center: {
                  lat: marker.current.getLngLat().lat,
                  lng: marker.current.getLngLat().lng,
                },
                zoom: 15,
              });
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
