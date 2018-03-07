import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/timer';
import { Crypto } from '../crypto';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-crypto-price',
  templateUrl: './crypto-price.component.html',
  styleUrls: ['./crypto-price.component.css']
})
export class CryptoPriceComponent implements OnInit {

  cryptos: Crypto[];
  public cryData: any[];

  private receiveData: any;
  private cryptoNames: string[];
  private cryptoImages1x: string[];
  private cryptoImages2x: string[];
  private cryptoLastPrices: number[];
  private cryptoPriceCompare: number[];

  private showloader: boolean = false;
  private subscription: Subscription;
  private timer: Observable<any>;

  private _searchText: string = "";
  private _sortValue = null;
  private _sortName = null;
  private _loading = true;
  private _current = 1;
  private _index = 1;
  private _changeIndex = false;
  private _pageSize = 20;
  private _sortMap = {
    name   : null,
    symbol : null
  };

  private input_id: string = "";

  constructor(
    private _data: DataService,
    private _message: NzMessageService
  ) { }

  sort(sortName: string, sortEvent: string) {
    this._sortValue = sortEvent;
    this._sortName = sortName;
    //console.log(this._sortValue);
    Object.keys(this._sortMap).forEach(key => {
      if ( key !== sortName ) {
        this._sortMap[key] = null;
      } else {
        this._sortMap[key] = sortEvent;
      }
    });
    this.refreshData();
  }

  onSearch(text: string): void {
    let result:boolean = this._data.filter(text);
    if (!result) {
        // Display message when no coins are found and reset search input
        this._message.create('warning','We couldn’t find any coins for ' + text);
        this._searchText = "";
    }
    this.refreshData(true);
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData(reset:boolean = false) {
    // When page size changed, reset pagination index to 1
    if (reset) {
      this._current = 1;
      this._sortName = null;
      this._sortValue = null;
    }

    this._loading = true;
    // Sort dataset before get
    this._data.sortData(this._sortName, this._sortValue);

    this.cryData = [];
    this.cryptoLastPrices = [];
    this.cryptoPriceCompare = [];
    this.cryptoNames = this._data.getNamesFull();
    this.cryptoImages1x = this._data.getImages1xFull();
    this.cryptoImages2x = this._data.getImages2xFull();

    this._data.getPricesFull()
      .subscribe(res => {
        this.receiveData = res.DISPLAY;
        //console.log(this.receiveData);

        let coinKeys: any = Object.keys(this.receiveData);
        let coinValues: any = Object.values(this.receiveData);

        // Price compare first time check
        if (this.cryptoLastPrices.length === 0) {
          for (let _i = 0; _i < coinKeys.length; _i++) {
            this.cryptoLastPrices[_i] = parseFloat((coinValues[_i].USD.PRICE).substring(2).replace(/,/g, ''));
            this.cryptoPriceCompare[_i] = (parseFloat((coinValues[_i].USD.PRICE).substring(2).replace(/,/g, '')) -
              this.cryptoLastPrices[_i]);
          }
        } else {
          for (let _i = 0; _i < coinKeys.length; _i++) {
            this.cryptoPriceCompare[_i] = (parseFloat((coinValues[_i].USD.PRICE).substring(2).replace(/,/g, '')) -
              this.cryptoLastPrices[_i]);
          }
        }
        //console.log(this.cryptoLastPrices);

        for (let _i = 0; _i < coinKeys.length; _i++) {
          this.cryData[coinKeys[_i]] = {
            image1x: this.cryptoImages1x[_i],
            image2x: this.cryptoImages2x[_i],
            name: this.cryptoNames[_i],
            symbol: coinKeys[_i],
            price: coinValues[_i].USD.PRICE,
            marketCap: coinValues[_i].USD.MKTCAP,
            change24: coinValues[_i].USD.CHANGE24HOUR,
            change24Num: parseFloat((coinValues[_i].USD.CHANGE24HOUR).substring(2).replace(/,/g, '')),
            priceCompare: this.cryptoPriceCompare[_i]
          }

          this.cryptoLastPrices[_i] = parseFloat((coinValues[_i].USD.PRICE).substring(2).replace(/,/g, ''));
          this.cryptos = JSON.parse(JSON.stringify(Object.values(this.cryData)));

        }
        //console.log(Object.values(this.cryData));
        this._loading = false;
        this.setTimer();
      });
  }

  setTimer() {
    // set showloader to true to show colored div on view
    this.showloader = true;
    this.timer = Observable.timer(1500);

    this.subscription = this.timer.subscribe(() => {
      // set showloader to false to hide colored div from view after 1.5 seconds
      this.showloader = false;
    });
  }

  addId() {
    this.input_id = "focusWidth";
  }

  removeId() {
    this.input_id = "";
  }

  sendEvent = () => {
    (<any>window).ga('send', 'event', {
      eventCategory: 'Links and Buttons',
      eventLabel: 'CoinlistToDetail',
      eventAction: 'click',
      eventValue: 20
    });
  }

}
