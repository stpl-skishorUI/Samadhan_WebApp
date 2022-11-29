import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  userObj = new Array();

  private httpObj: any = {
    type: '',
    url: '',
    options: Object
  };

  disableCloseFlag:boolean = true;

  constructor(private http: HttpClient) {}

  getBaseurl(url: string) {
    switch (url) {
      // For Demo
      case 'samadhanMiningService': return 'https://samadhan-api.mahamining.com/'; break;

      // For Live
      // case 'samadhanMiningService': return 'http://samadhanwebservice.samadhanosmanabad.in/'; break;

      default: return ''; break;
    }
  }

  getHttp(): any {
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }

  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any) {
    try {
      //this.userObj = JSON.parse(sessionStorage.loggedInDetails);
    } catch (e) { }
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.getBaseurl(baseUrl) + url;
    if (isHeader) {
      let tempObj: any = {
        // "Authorization": "Bearer " + this.userObj.responseData3.accessToken // token set
      };
      this.httpObj.options.headers = new HttpHeaders(tempObj);
    }

   obj !== false ? this.httpObj.options.body = obj :  this.httpObj.options.body = false;
   params !== false ? this.httpObj.options.params = params :   this.httpObj.options.params = false;
  }

  clearHttp() {
    this.httpObj.type = '';
    this.httpObj.url = '';
    this.httpObj.options = {};
  }
}
