import React from 'react';
import { Cookies } from 'react-cookie';
import { RailwayList } from './railway/RailwayList';
import { RailwayProps, TrainData, RailwayMap } from './railway/RailwayMap';

export const API_ENDPOINT = "https://kram.nyamikan.net/metro_delay_now/api/v1"

interface State {
  cookies: Cookies;
  railways: RailwayProps[];
  selectRailway?: RailwayProps;
  trainData?: TrainData;
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { cookies: new Cookies(), railways: [], selectRailway: undefined, trainData: undefined };
  }
  // railway: Railway = {
  //   id: "Ginza",
  //   name: "銀座線"
  // };

  // stations: Station[] = [
  //   {
  //     id: "Shibuya",
  //     name: "渋谷",
  //     stationCode: "G01"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "表参道",
  //     stationCode: "G02"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "外苑前",
  //     stationCode: "G02"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "青山一丁目",
  //     stationCode: "G02"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "赤坂見附",
  //     stationCode: "G02"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "溜池山王",
  //     stationCode: "G02"
  //   },
  //   {
  //     id: "Omotesando",
  //     name: "虎ノ門",
  //     stationCode: "G02"
  //   },
  // ];

  componentDidMount() {
    fetch(`${API_ENDPOINT}/railways`)
      .then((response) => {
        return response.json();
      }).then((responseJson) => {
        this.setState({ railways: responseJson });
        this.railwayClick(
          this.state.cookies.get('railway') ||
          responseJson[0].railway.id
        );
      });

    setInterval(() => this.updateRailway(), 15000);
  }

  railwayClick(id: string) {
    this.state.cookies.set('railway', id, { maxAge: 60*60*24*7, secure: true, sameSite: 'strict' })
    this.setState({ selectRailway: this.state.railways.find(railway => railway.railway.id === id), trainData: undefined });
    fetch(`${API_ENDPOINT}/trains/${id}`)
      .then((response) => {
        return response.json();
      }).then((responseJson) => {
        this.setState({ trainData: responseJson });
      });
  }

  updateRailway() {
    fetch(`${API_ENDPOINT}/trains/${this.state.selectRailway?.railway.id}`)
      .then((response) => {
        return response.json();
      }).then((responseJson) => {
        this.setState({ trainData: responseJson });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="mui-appbar">
          <table style={{ width: '100%' }}>
            <tbody>
              <tr style={{ verticalAlign: 'middle' }}>
                <td className="mui--appbar-height mui--text-nowrap">メトロ遅延なう</td>
                <td className="mui--appbar-height">
                  {
                    this.state.railways.length === 0 ?
                    "読込中..." :
                    (<RailwayList railways={ this.state.railways } railwayClick={ (id: string) => this.railwayClick(id) } />)
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mui-container-fluid">
          { this.state.selectRailway ? 
            (<RailwayMap
                railway={ this.state.selectRailway.railway }
                stations={ this.state.selectRailway.stations }
                trainData={ this.state.trainData } />) :
            "読込中..."  
          }
        </div>
        <div className="mui--divider-top">
          東京メトロの事情により、予告なく本Webシステムの提供をとりやめることがあります。<br />
          遅延時間は時刻表と列車位置に基づく推定値で、非公式です。
        </div>
      </div>
    );
  }
}

export default App;