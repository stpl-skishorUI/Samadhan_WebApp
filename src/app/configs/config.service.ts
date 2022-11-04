import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  dialogBoxWidth = ['320px', '400px', '700px', '1024px'];  // Set angular material dialog box width

  disableCloseBtnFlag: boolean = true// When click on body material dialog box is not closed flag

  pageSize: number = 10; // Angular material data table page size limt

  matFormField: string | any = 'legacy'; // Reactive form fill appearance

  matFormFieldFilter: string | any = 'legacy'; // Reactive form fill filter appearance

  //------------------------------------------ Maps Settings  starte heare -------------------------------------------//

  lat =22.9868;

  long = 87.8550;

  zoom: number = 12;

  viewType: string = 'roadmap';

  static googleApiObj: object = { // google api key
    apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
    language: 'en',
    libraries: ['drawing', 'places']
  };

  //------------------------------------------ Maps Settings  starte heare -------------------------------------------//

  //--------------------------------------- dialog Data obj start heare ------------------------------------------//

  static dialogObj: object = {
    p1:'',
    p2:'',
    cardTitle:'',
    successBtnText:'',
    cancelBtnText:'',
    dialogIconClose:'',
    inputType:false,
    inputTypeLable:''
  }

}
