import { React, type AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis';
import FeatureLayer from "esri/layers/FeatureLayer";
import Graphic from "esri/Graphic";
const { useState } = React;
import { CalciteButton } from 'calcite-components';

const Widget = (props: AllWidgetProps<any>) => {
  const [selectedProv, setSelectedProv] = useState<number>();
  //const [listProv, setListProv] = useState<number>();
  const [selectedConcello, setSelectedConcello] = useState<number>();
  const [listConcello, setListConcello] = useState<[]>();
  const [selectedParroquia, setSelectedParroquia] = useState<number>();
  const [listParroquia, setListParroquia] = useState<[]>();
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>();;

  // La función jmvChange se ejecuta cada vez que cambiemos el mapa en setting.tsx
  const activeViewChangeHandler = (jmv: JimuMapView) => {
    // Comprobar que tenemos jmv
    if (jmv) {
      // Si tenemos jmv, lo guardamos en el estado con la función setJimuMapView
      setJimuMapView(jmv);
    }
  };

  const provinciasLayer = new FeatureLayer({
    url: "https://ideg.xunta.gal/servizos/rest/services/LimitesAdministrativos/LimitesAdministrativos/MapServer/12"
  });

  const concellosLayer = new FeatureLayer({
    url: "https://ideg.xunta.gal/servizos/rest/services/LimitesAdministrativos/LimitesAdministrativos/MapServer/18"
  });

  const chooseProv = (evt) => {
    setSelectedProv(evt.target.value);
    setListConcello([]);
    setListParroquia([]);
    // Obtener lista de concellos por provincia
    const queryParams = provinciasLayer.createQuery();
    queryParams.where = `CODPROV = ${evt.target.value}`;

    provinciasLayer.queryFeatures(queryParams)
      .then((results) => setListConcello(results.features));
  }

  const chooseConcello = (evt) => {
    setSelectedConcello(evt.target.value);
    setListParroquia([]);

    // Obtener parroquias
    const queryParams = concellosLayer.createQuery();
    queryParams.where = `CODCONC = ${evt.target.value}`;

    concellosLayer.queryFeatures(queryParams)
      .then((results) => {
        console.log('concello', results)
        setListParroquia(results.features)});
  }

  const chooseParroquia = (evt) => {
    setSelectedParroquia(evt.target.value);

    const queryParams = concellosLayer.createQuery();
    queryParams.where = `CODPARRO = ${evt.target.value}`;

    concellosLayer.queryFeatures(queryParams)
    .then((results) => console.log('parroquias',results));
  }

  const simpleFillSymbolConcello = {
    type: "simple-fill",
    color: [0,122,194,1],
    outline: {
      cap: "round",
      color: [0,122,194,1],
      join: "round",
      miterLimit: 1,
      style: "solid",
      width: 2
    },
    style: "forward-diagonal"
  }

  const simpleFillSymbolParroquia = {
    type: "simple-fill",
    color: [197,135,195,0.8],
    outline: {
      cap: "round",
      color: [194,0,178,1],
      join: "round",
      miterLimit: 1,
      style: "solid",
      width: 2
    },
    style: "solid"
  }

  const goToConcello = () => {
    const queryParams = provinciasLayer.createQuery();
    queryParams.where = `CODCONC = ${selectedConcello}`;
    provinciasLayer.queryFeatures(queryParams)
    .then(result => {
      const geom = result.features[0].geometry;
      jimuMapView.view.goTo(geom);
      drawGeometry(geom, simpleFillSymbolConcello);
    });
  }

  const drawGeometry = (geometry, symbol) => {
    jimuMapView.view.graphics.removeAll();

    const polygonGraphic = new Graphic({
      geometry,
      symbol
    });
    jimuMapView.view.graphics.add(polygonGraphic)
  }

  const goToParroquia = () => {
    const queryParams = concellosLayer.createQuery();
    queryParams.where = `CODPARRO = ${selectedParroquia}`;
    concellosLayer.queryFeatures(queryParams)
    .then(result => {
      const geom = result.features[0].geometry;
      jimuMapView.view.goTo(geom);
      drawGeometry(geom, simpleFillSymbolParroquia);
    });
  }

  return (
    <div className="widget-demo jimu-widget m-2">
       {
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length == 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}
          />
        )
      }

      <h1>Parroquias de Galicia</h1>
      <label>Provincia</label>
      <br />
      <select onChange={chooseProv}>
        <option selected disabled>Selecciona una provincia</option>
        <option value="27">Lugo</option>
        <option value="36">Pontevedra</option>
        <option value="15">A Coruña</option>
        <option value="32">Ourense</option>
      </select>


      {/* Opción de concello */}
      {listConcello?.length > 0 && (
        <div>
          <br />
          <label>Concello</label>
          <br />
          <select onChange={chooseConcello} style={{marginRight: "20px"}}>
            <option value="" selected disabled>Selecciona un concello</option>
            {listConcello.map((concello) => (
              <option value={concello.attributes.CODCONC}>
                {concello.attributes.CONCELLO}
              </option>
            ))}
          </select>

          <CalciteButton icon-start="pin-tear" onClick={goToConcello}></CalciteButton>
        </div>
      )}

      {/* Opción de parroquias */}
      {listParroquia?.length > 0 && (
        <div>
          <br />
          <label>Parroquia</label>
          <br />
          <select onChange={chooseParroquia} style={{marginRight: "20px"}}>
            <option value="" selected disabled>Selecciona una parroquia</option>
            {listParroquia.map((parroquia) => (
              <option value={parroquia.attributes.CODPARRO}>
                {parroquia.attributes.PARROQUIA}
              </option>
            ))}
          </select>
          <CalciteButton icon-start="pin-tear" onClick={goToParroquia}></CalciteButton>

        </div>
      )}

    </div>
  )
}

export default Widget
