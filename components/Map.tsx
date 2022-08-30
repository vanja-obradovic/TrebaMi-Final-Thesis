import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "../styles/map.module.scss";
import * as ReactDOM from "react-dom/client";
import { Map, Marker } from "@tomtom-international/web-sdk-maps";
import AdCard from "./AdCard";
import { Coords, Location } from "../models/Location";
import CustomMapMarker from "./CustomMapMarker";
import { AdvertisementCard, ProductSubCat } from "../models/Advertisement";
import useArray from "../hooks/useArray";

interface mapProps {
  locationMarker: boolean;
  setLocation?: (location: Location) => void;
  popup?: React.ReactNode;
  markerCords?: Coords;
  markersWPopups?: AdvertisementCard[];
}

const Map = (props: mapProps) => {
  const { locationMarker, setLocation, popup, markerCords, markersWPopups } =
    props;

  const mapElement = useRef<HTMLDivElement>();
  const [map, setMap] = useState<Map>();
  const marker = useRef<Marker>();
  const {
    push: addMarker,
    array: markers,
    clear: arrClear,
  } = useArray<Marker>([]);

  const options = {
    key: process.env.NEXT_PUBLIC_TOMTOM,
    language: "en-GB",
  };

  const getBoundingBoxOfCoords = (
    coords: Coords[]
  ): [number, number, number, number] => {
    const lats = coords.map((item) => item.lat);
    const lngs = coords.map((item) => item.lng);

    const minLat = Math.min(...lats),
      minLng = Math.min(...lngs);
    const maxLat = Math.max(...lats),
      maxLng = Math.max(...lngs);

    return [minLng, minLat, maxLng, maxLat];
  };

  useEffect(() => {
    const initMap = async () => {
      console.log(mapElement);
      const tt = await import("@tomtom-international/web-sdk-maps");
      const { services } = await import(
        "@tomtom-international/web-sdk-services"
      );

      const mapObject = mapElement.current
        ? tt
            .map({
              key: process.env.NEXT_PUBLIC_TOMTOM,
              container: mapElement.current,
              clickTolerance: 15,
              bounds: [
                [18.82982, 42.2452243971],
                [22.9860185076, 46.1717298447],
              ],
            })
            .addControl(
              new tt.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: false,
              })
                .on("geolocate", (e: any) => {
                  if (locationMarker) {
                    services
                      .reverseGeocode({
                        ...options,
                        position: {
                          lat: e.coords.latitude,
                          lng: e.coords.longitude,
                        },
                      })
                      .then((res) => {
                        // console.log(res);

                        const locationInfo = res.addresses[0];
                        setLocation({
                          coords: locationInfo.position,
                          countrySecondarySubdivision:
                            locationInfo.address.countrySecondarySubdivision,
                          municipality: locationInfo.address.municipality,
                        });
                      });
                  }
                })
                .on("error", (e: any) => {
                  toast.error(
                    e.code === 1
                      ? "Niste dali dozvolu za automatsko lociranje"
                      : ""
                  );

                  // fetch(
                  //   "https://ipgeolocation.abstractapi.com/v1/?api_key="
                  // ).then((data) => {
                  //   data.json().then((res) => {
                  //   });
                  // });
                  // }
                })
            )
        : null;
      mapObject?.addControl(new tt.FullscreenControl());
      mapObject?.addControl(
        new tt.NavigationControl({ showExtendedRotationControls: true })
      );

      if (locationMarker) {
        mapObject?.on("dblclick", (e) => {
          e.preventDefault();
          // setMarkerCoords(new GeoPoint(e.lngLat.lat, e.lngLat.lng));
          services
            .reverseGeocode({ ...options, position: e.lngLat })
            .then((res) => {
              const locationInfo = res.addresses[0];
              setLocation({
                coords: locationInfo.position,
                countrySecondarySubdivision:
                  locationInfo.address.countrySecondarySubdivision,
                municipality: locationInfo.address.municipality,
              });
            });
          marker.current?.remove();
          marker.current = new tt.Marker({
            draggable: true,
          })
            .setLngLat(e.lngLat)
            .addTo(mapObject)
            .on("dragend", (e: any) => {
              services
                .reverseGeocode({ ...options, position: e.target._lngLat })
                .then((res) => {
                  // console.log(res);
                  const locationInfo = res.addresses[0];
                  setLocation({
                    coords: locationInfo.position,
                    countrySecondarySubdivision:
                      locationInfo.address.countrySecondarySubdivision,
                    municipality: locationInfo.address.municipality,
                  });
                });
            });
          // .setPopup(new tt.Popup().setDOMContent(popupDiv).addTo(mapObject))
          // .togglePopup();
        });
      }

      mapObject?.on("load", () => {
        if (markerCords) {
          marker.current = new tt.Marker({
            draggable: locationMarker,
          })
            .setLngLat(markerCords)
            .addTo(mapObject);
          if (locationMarker) {
            marker.current.on("dragend", (e: any) => {
              services
                .reverseGeocode({ ...options, position: e.target._lngLat })
                .then((res) => {
                  const locationInfo = res.addresses[0];
                  setLocation({
                    coords: locationInfo.position,
                    countrySecondarySubdivision:
                      locationInfo.address.countrySecondarySubdivision,
                    municipality: locationInfo.address.municipality,
                  });
                });
            });
          }
          // marker.current
          //   .setPopup(
          //     new tt.Popup({
          //       closeOnMove: true,
          //       closeOnClick: true,
          //     })
          //       .setDOMContent(popupDiv)
          //       .addTo(mapObject)
          //       .on("open", (e) => {
          //       })
          //   )
          //   .togglePopup();

          mapObject?.jumpTo({
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
  }, [mapElement]);

  useEffect(() => {
    if (markersWPopups) {
      const bounds = getBoundingBoxOfCoords(
        markersWPopups.map((item) => item.provider.location.coords)
      );
      const markeri = async () => {
        markers.forEach((item) => item.remove());
        arrClear();
        if (markersWPopups.length) {
          const tt = await import("@tomtom-international/web-sdk-maps");
          const popUPs = markersWPopups.map((marker) => {
            const popupDiv = document.createElement("div");
            popupDiv.className = styles.popup;
            const root = ReactDOM.createRoot(popupDiv);
            root.render(<AdCard {...marker} mapCard={true}></AdCard>);
            return popupDiv;
          });
          const customMarkers = markersWPopups.map((marker) => {
            const markerDiv = document.createElement("div");
            const root = ReactDOM.createRoot(markerDiv);
            root.render(
              <CustomMapMarker type={marker.subcategory as ProductSubCat} />
            );
            return markerDiv;
          });
          popUPs.forEach((popUP, index) => {
            addMarker(
              new tt.Marker({ draggable: false, element: customMarkers[index] })
                .setLngLat(markersWPopups[index].provider.location.coords)
                .addTo(map)
                .setPopup(
                  new tt.Popup({ closeOnClick: true })
                    .setDOMContent(popUP)
                    .on("open", (e: any) => {
                      console.log(e);
                      map.panTo(e.target._lngLat, {
                        offset: [50, 0],
                      });
                    })
                    .on("close", (e: any) => {
                      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
                    })
                )
            );
          });
          map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        }
      };
      if (map) markeri();
    }
  }, [markersWPopups, map]);

  return <div ref={mapElement} className={styles.mapDiv}></div>;
};

export default Map;

// const SearchBox = await import(
//   "@tomtom-international/web-sdk-plugin-searchbox"
// );
// const ttSearchBox = new SearchBox.default(services, {
//   idleTimePress: 100,
//   minNumberOfCharacters: 0,
//   searchOptions: {
//     key: "eBXlMwdCvb3fyihhln6FAMi87pwNIet1",
//     language: "en-GB",
//   },
//   autocompleteOptions: {
//     key: "eBXlMwdCvb3fyihhln6FAMi87pwNIet1",
//     language: "en-GB",
//   },
//   noResultsMessage: "No results found.",
// });
// map.addControl(ttSearchBox, "top-left");
// ttSearchBox.on("tomtom.searchbox.resultsfound", function (data) {
// console.log(data);
// });
