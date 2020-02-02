import React from 'react';
import Moment from 'moment';
import { API_ENDPOINT } from '../App';

export type Station = {
  id: string;
  name: string;
  stationCode: string;
}

export type Railway = {
  id: string;
  name: string;
}

export type RailwayProps = {
  railway: Railway;
  stations: Station[];
  trainData?: TrainData;
}

export type TrainData = {
  date: string;
  trains: Train[];
}

type Train = {
  id: string;
  trainType: string;
  starting: string;
  terminal: string;
  direction: string;
  current: string;
  next?: string;
  delay?: number;
}

export class RailwayMap extends React.PureComponent<RailwayProps> {
  isUp(train: Train): boolean {
    // FIXME: 判定精度がやや低いので、手動でデータを差し込んだほうがいいかも
    let index = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") == train.direction.replace(/.+\./, "") );
    if (index == 0) { return true; }
    else if (index == this.props.stations.length - 1) { return false; }

    if (train.direction.includes("Honancho")) { return true; }
    if (train.direction.includes("Mitaka")) { return true; }

    let currentIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.starting.replace(/.+\./, "") );
    if (currentIndex < 0) { currentIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.current.replace(/.+\./, "")); }
    let directionIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.terminal.replace(/.+\./, "") );
    if (directionIndex < 0) { directionIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.direction.replace(/.+\./, "") ); }
    if (directionIndex < 0) { directionIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.next?.replace(/.+\./, "")); }
    if (directionIndex < 0) { directionIndex = this.props.stations.findIndex(station => station.id.replace(/.+\./, "") === train.current.replace(/.+\./, "")); }
    return currentIndex > directionIndex;
  }

  isDown(train: Train): boolean {
    return !this.isUp(train);
  }

  trainType(type: string): string {
    var dict: any = {
      'odpt.TrainType:TokyoMetro.Unknown': '不明',
      'odpt.TrainType:TokyoMetro.Local': '各停',
      'odpt.TrainType:TokyoMetro.Express': '急行',
      'odpt.TrainType:TokyoMetro.Rapid': '快速',
      'odpt.TrainType:TokyoMetro.SemiExpress': '準急',
      'odpt.TrainType:TokyoMetro.TamaExpress': '多摩急行',
      'odpt.TrainType:TokyoMetro.HolidayExpress': '土休急行',
      'odpt.TrainType:TokyoMetro.CommuterSemiExpress': '通勤準急',
      'odpt.TrainType:TokyoMetro.Extra': '臨時',
      'odpt.TrainType:TokyoMetro.RomanceCar': '特急ロマンスカー',
      'odpt.TrainType:TokyoMetro.RapidExpress': '快速急行',
      'odpt.TrainType:TokyoMetro.CommuterExpress': '通勤急行',
      'odpt.TrainType:TokyoMetro.LimitedExpress': '特急',
      'odpt.TrainType:TokyoMetro.CommuterLimitedExpress': '通勤特急',
      'odpt.TrainType:TokyoMetro.CommuterRapid': '通勤快速',
      'odpt.TrainType:TokyoMetro.ToyoRapid': '東葉快速',
      'odpt.TrainType:TokyoMetro.F-Liner': 'Fライナー',
      'odpt.TrainType:TokyoMetro.S-TRAIN': 'S-TRAIN'
    };
    return dict[type] || type.replace(/.+\./, "");
  }

  terminal(terminal: string): string {
    let dict: any = {
      'odpt.Station:JR-East.Joban.Abiko': '我孫子',
      'odpt.Station:JR-East.Joban.Toride': '取手',
      'odpt.Station:JR-East.Joban.Kashiwa': '柏',
      'odpt.Station:JR-East.Joban.Matsudo': '松戸',
      'odpt.Station:JR-East.Chuo.Mitaka': '三鷹',
      'odpt.Station:JR-East.ChuoChikatetsuTozai.Tsudanuma': '津田沼',
      'odpt.Station:Toei.Mita.Mita': '三田',
      'odpt.Station:Toei.Mita.Shibakoen': '芝公園',
      'odpt.Station:Toei.Mita.Onarimon': '御成門',
      'odpt.Station:Toei.Mita.Uchisaiwaicho': '内幸町',
      'odpt.Station:Toei.Mita.Hibiya': '日比谷',
      'odpt.Station:Toei.Mita.Otemachi': '大手町',
      'odpt.Station:Toei.Mita.Jimbocho': '神保町',
      'odpt.Station:Toei.Mita.Suidobashi': '水道橋',
      'odpt.Station:Toei.Mita.Kasuga': '春日',
      'odpt.Station:Toei.Mita.Hakusan': '白山',
      'odpt.Station:Toei.Mita.Sengoku': '千石',
      'odpt.Station:Toei.Mita.Sugamo': '巣鴨',
      'odpt.Station:Toei.Mita.NishiSugamo': '西巣鴨',
      'odpt.Station:Toei.Mita.ShinItabashi': '新板橋',
      'odpt.Station:Toei.Mita.Itabashikuyakushomae': '板橋区役所前',
      'odpt.Station:Toei.Mita.Itabashihoncho': '板橋本町',
      'odpt.Station:Toei.Mita.Motohasunuma': '本蓮沼',
      'odpt.Station:Toei.Mita.ShimuraSanchome': '志村三丁目',
      'odpt.Station:Toei.Mita.Hasune': '蓮根',
      'odpt.Station:Toei.Mita.Nishidai': '西台',
      'odpt.Station:Toei.Mita.Takashimadaira': '高島平',
      'odpt.Station:Toei.Mita.ShinTakashimadaira': '新高島平',
      'odpt.Station:Toei.Mita.NishiTakashimadaira': '西高島平',
      'odpt.Station:SaitamaRailway.SaitamaRailway.UrawaMisono': '浦和美園',
      'odpt.Station:SaitamaRailway.SaitamaRailway.Hatogaya': '鳩ヶ谷',
      'odpt.Station:ToyoRapidRailway.ToyoRapid.ToyoKatsutadai': '東葉勝田台',
      'odpt.Station:ToyoRapidRailway.ToyoRapid.YachiyoMidorigaoka': '八千代緑が丘',
      'odpt.Station:Odakyu.Tama.Karakida': '唐木田',
      'odpt.Station:Odakyu.Odawara.HonAtsugi': '本厚木',
      'odpt.Station:Odakyu.Odawara.HakoneYumoto': '箱根湯本',
      'odpt.Station:Odakyu.Odawara.Ebina': '海老名',
      'odpt.Station:Odakyu.Odawara.Isehara': '伊勢原',
      'odpt.Station:Odakyu.Odawara.SeijogakuenMae': '成城学園前',
      'odpt.Station:Odakyu.Odawara.MukogaokaYuen': '向ヶ丘遊園',
      'odpt.Station:Odakyu.Odawara.SagamiOno': '相模大野',
      'odpt.Station:Odakyu.Enoshima.KataseEnoshima': '片瀬江ノ島',
      'odpt.Station:Tobu.Nikko.MinamiKurihashi': '南栗橋',
      'odpt.Station:Tobu.Isesaki.Kuki': '久喜',
      'odpt.Station:Tobu.Isesaki.Takenotsuka': '竹ノ塚',
      'odpt.Station:Tobu.Isesaki.KitaKasukabe': '北春日部',
      'odpt.Station:Tobu.Isesaki.KitaKoshigaya': '北越谷',
      'odpt.Station:Tobu.Isesaki.TobuDoubutuKouen': '東武動物公園',
      'odpt.Station:Tobu.Tojo.Kawagoeshi': '川越市',
      'odpt.Station:Tobu.Tojo.Asaka': '朝霞',
      'odpt.Station:Tobu.Tojo.Asakadai': '朝霞台',
      'odpt.Station:Tobu.Tojo.Shiki': '志木',
      'odpt.Station:Tobu.Tojo.Yanasegawa': '柳瀬川',
      'odpt.Station:Tobu.Tojo.Mizuhodai': 'みずほ台',
      'odpt.Station:Tobu.Tojo.Tsuruse': '鶴瀬',
      'odpt.Station:Tobu.Tojo.Fujimino': 'ふじみ野',
      'odpt.Station:Tobu.Tojo.KamiFukuoka': '上福岡',
      'odpt.Station:Tobu.Tojo.Shingashi': '新河岸',
      'odpt.Station:Tobu.Tojo.Kawagoe': '川越',
      'odpt.Station:Tobu.Tojo.Kasumigaseki': '霞ヶ関',
      'odpt.Station:Tobu.Tojo.Tsurugashima': '鶴ヶ島',
      'odpt.Station:Tobu.Tojo.Wakaba': '若葉',
      'odpt.Station:Tobu.Tojo.Sakado': '坂戸',
      'odpt.Station:Tobu.Tojo.KitaSakado': '北坂戸',
      'odpt.Station:Tobu.Tojo.Takasaka': '高坂',
      'odpt.Station:Tobu.Tojo.HigashiMatsuyama': '東松山',
      'odpt.Station:Tobu.Tojo.ShinrinKoen': '森林公園',
      'odpt.Station:Tobu.Tojo.Ogawamachi': '小川町',
      'odpt.Station:Tokyu.Toyoko.Hiyoshi': '日吉',
      'odpt.Station:Tokyu.Toyoko.MusashiKosugi': '武蔵小杉',
      'odpt.Station:Tokyu.Toyoko.Yokohama': '横浜',
      'odpt.Station:Tokyu.Toyoko.Kikuna': '菊名',
      'odpt.Station:Tokyu.Toyoko.Motosumiyoshi': '元住吉',
      'odpt.Station:Tokyu.Meguro.Okusawa': '奥沢',
      'odpt.Station:Tokyu.Meguro.Hiyoshi': '日吉',
      'odpt.Station:Tokyu.Meguro.Motosumiyoshi': '元住吉',
      'odpt.Station:Tokyu.Meguro.MusashiKosugi': '武蔵小杉',
      'odpt.Station:Tokyu.DenEnToshi.FutakoTamagawa': '二子玉川',
      'odpt.Station:Tokyu.DenEnToshi.Nagatsuta': '長津田',
      'odpt.Station:Tokyu.DenEnToshi.Saginuma': '鷺沼',
      'odpt.Station:Tokyu.DenEnToshi.ChuoRinkan': '中央林間',
      'odpt.Station:Minatomirai.Minatomirai.MotomachiChukagai': '元町・中華街',
      'odpt.Station:Seibu.Ikebukuro.ShinSakuradai': '新桜台',
      'odpt.Station:Seibu.Ikebukuro.Nerima': '練馬',
      'odpt.Station:Seibu.Ikebukuro.Nakamurabashi': '中村橋',
      'odpt.Station:Seibu.Ikebukuro.Fujimidai': '富士見台',
      'odpt.Station:Seibu.Ikebukuro.NerimaTakanodai': '練馬高野台',
      'odpt.Station:Seibu.Ikebukuro.ShakujiiKoen': '石神井公園',
      'odpt.Station:Seibu.Ikebukuro.OizumiGakuen': '大泉学園',
      'odpt.Station:Seibu.Ikebukuro.Hoya': '保谷',
      'odpt.Station:Seibu.Ikebukuro.Hibarigaoka': 'ひばりヶ丘',
      'odpt.Station:Seibu.Ikebukuro.HigashiKurume': '東久留米',
      'odpt.Station:Seibu.Ikebukuro.Kiyose': '清瀬',
      'odpt.Station:Seibu.Ikebukuro.Akitsu': '秋津',
      'odpt.Station:Seibu.Ikebukuro.Tokorozawa': '所沢',
      'odpt.Station:Seibu.Ikebukuro.NishiTokorozawa': '西所沢',
      'odpt.Station:Seibu.Ikebukuro.Kotesashi': '小手指',
      'odpt.Station:Seibu.Ikebukuro.Sayamagaoka': '狭山ヶ丘',
      'odpt.Station:Seibu.Ikebukuro.MusashiFujisawa': '武蔵藤沢',
      'odpt.Station:Seibu.Ikebukuro.InariyamaKoen': '稲荷山公園',
      'odpt.Station:Seibu.Ikebukuro.Irumashi': '入間市',
      'odpt.Station:Seibu.Ikebukuro.Bushi': '仏子',
      'odpt.Station:Seibu.Ikebukuro.Motokaji': '元加治',
      'odpt.Station:Seibu.Ikebukuro.Hanno': '飯能',
      'odpt.Station:Seibu.SeibuChichibu.SeibuChichibu': '西武秩父',
      'odpt.Station:TokyoMetro.MarunouchiBranch.Honancho': '方南町',
      'odpt.Station:TokyoMetro.MarunouchiBranch.NakanoFujimicho': '中野富士見町',
    };

    return (
      dict[terminal] ||
      this.props.stations.find(station => station.id.replace(/.+\./, "") == terminal.replace(/.+\./, "") )?.name ||
      terminal.replace(/.+\./, "")
    );
  }

  label(train: Train): string {
    return `${this.trainType(train.trainType)} ${this.terminal(train.terminal)}`
  }

  delayLabel(train: Train): string {
    return `${(train.delay || 0) !== 0 ? `+${train.delay}` : "" }`
  }

  delayClass(train: Train): string {
    let delay = train.delay || 0
    if (delay >= 10) { return "-dark" }
    else if (delay >= 5) { return "" }
    else if (delay >= 1) { return "-light" }
    return "";
  }

  render() {
    return (
      <div>
        <div className="mui--appbar-line-height">
          <span className="mui--text-subhead">
            { this.props.railway.name }線
            { this.props.trainData ? ` (${ Moment().diff(Moment(this.props.trainData.date), 'seconds', false) }秒前の情報)` : ""}
          </span>
        </div>
        { this.props.trainData ? 
          <div>
            { this.props.stations.map((station) => 
              <div className="">
                <div className="mui-row mui--divider-top"> 
                  <div className="mui-col-xs-4">
                    { this.props.trainData?.trains.filter(train => train.current == station.id && !train.next && this.isUp(train)).map(train => (
                        <div>■{ this.label(train) }&nbsp;<span className={ "mui--bg-accent" + this.delayClass(train) + " mui--text-light" }>{ this.delayLabel(train) }</span></div>
                      ))
                    }
                  </div>
                  <div className="mui-col-xs-4 mui--text-center mui--bg-primary mui--text-light">
                    { station.name }
                  </div>
                  <div className="mui-col-xs-4">
                    { this.props.trainData?.trains.filter(train => train.current == station.id && !train.next && this.isDown(train)).map(train => (
                        <div>■{ this.label(train) }&nbsp;<span className={ "mui--bg-accent" + this.delayClass(train) + " mui--text-light" }>{ this.delayLabel(train) }</span></div>
                      ))
                    }
                  </div>
                </div>
                <div className="mui-row mui--divider-top"> 
                  <div className="mui-col-xs-4">
                    { this.props.trainData?.trains.filter(train => train.next == station.id && this.isUp(train)).map(train => (
                        <div>▲{ this.label(train) }&nbsp;<span className={ "mui--bg-accent" + this.delayClass(train) + " mui--text-light" }>{ this.delayLabel(train) }</span></div>
                      ))
                    }
                  </div>
                  <div className="mui-col-xs-4 mui--text-center"><br /></div>
                  <div className="mui-col-xs-4">
                    { this.props.trainData?.trains.filter(train => train.current == station.id && train.next && this.isDown(train)).map(train => (
                        <div>▼{ this.label(train) }&nbsp;<span className={ "mui--bg-accent" + this.delayClass(train) + " mui--text-light" }>{ this.delayLabel(train) }</span></div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div> :
          "読込中..."
        }
      </div>
    );
  }
}