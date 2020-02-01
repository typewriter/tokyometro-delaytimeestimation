import React from 'react';
import { Station, Railway, RailwayMap } from './railway/RailwayMap';

const App = () => {
  let railway: Railway = {
    id: "Ginza",
    name: "銀座線"
  };
  let stations: Station[] = [
    {
      id: "Shibuya",
      name: "渋谷",
      stationCode: "G01"
    },
    {
      id: "Omotesando",
      name: "表参道",
      stationCode: "G02"
    },
    {
      id: "Omotesando",
      name: "外苑前",
      stationCode: "G02"
    },
    {
      id: "Omotesando",
      name: "青山一丁目",
      stationCode: "G02"
    },
    {
      id: "Omotesando",
      name: "赤坂見附",
      stationCode: "G02"
    },
    {
      id: "Omotesando",
      name: "溜池山王",
      stationCode: "G02"
    },
    {
      id: "Omotesando",
      name: "虎ノ門",
      stationCode: "G02"
    },
  ];

  return (
    <div className="App">
      <div className="mui-appbar">
        <table style={{ width: '100%' }}>
          <tr style={{ verticalAlign: 'middle' }}>
            <td className="mui--appbar-height">メトロ遅延なう</td>
          </tr>
        </table>
      </div>
      <div className="mui-container-fluid">
        <RailwayMap railway={railway} stations={stations} />
      </div>

    </div>
  );
}

export default App;
