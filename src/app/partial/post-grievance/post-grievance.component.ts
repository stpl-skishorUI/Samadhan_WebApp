import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { CommonApiService } from 'src/app/core/service/common-api.service';
import { ErrorHandlerService } from 'src/app/core/service/error-handler.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonMethodService } from 'src/app/core/service/common-method.service';
import { ApiService } from 'src/app/core/service/api.service';
import { FormsValidationService } from 'src/app/core/service/forms-validation.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from 'src/app/configs/config.service';
import { WebStorageService } from 'src/app/core/service/web-storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
// import { FileUploadService } from 'src/app/core/service/file-upload.service';
@Component({
  selector: 'app-post-grievance',
  templateUrl: './post-grievance.component.html',
  styleUrls: ['./post-grievance.component.css']
})
export class PostGrievanceComponent implements OnInit {
  stateArray:any[]=[];
  filterFrm!:FormGroup;
  postGrievanceForm!:FormGroup;
  districtArray=new Array();
  talukaArray=new Array();
  villageArray=new Array();
  departmentArray=new Array();
  officeArray=new Array();
  statusArray=new Array();
  natureOfGrievance=new Array();
  postGrivanceData=new Array();
  totalRows:number=0;
  dataSource:any;
  pageNumber:number=1;
  displayedColumns: string[] = [ 'srno','name', 'taluka','village', 'department','office','status', 'action','button','select'];
  registerBy= [{ value:0, type: 'Self' }, { value:1, type: 'Others' }];
  selection = new SelectionModel<Element>(true, []);
  urls=new Array();
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(public commonMethod: CommonMethodService,
    public apiService: ApiService,
    public validation: FormsValidationService,
    public error: ErrorHandlerService,
    public dialog: MatDialog,
    public configService: ConfigService,
    public commonApi: CommonApiService,
    public localStrorageData: WebStorageService,
    private fb: FormBuilder,
    // private uploadFilesService:FileUploadService,
    private spinner: NgxSpinnerService
    ) { }

  ngOnInit(): void {
    this.filterForm();
    this.defaultForm();
    this.getDistrict();
    this.getTaluka(1);
    this.getStatus();
    this.getDepartment();
    this.getGrievance();
    this.bindTable();
  }


  filterForm() {
    this.filterFrm = this.fb.group({
      talukaId: [0],
      villageId: [0],
      deptId: [0],
      officeId: [0],
      statusId:[0],
      textSearch: ['']
    })
  }

  defaultForm(){
    this.postGrievanceForm= this.fb.group({
      isSelfGrievance:[0,[Validators.required]],
      otherCitizenName:[''],
      otherCitizenMobileNo:[''],
      otherCitizenAddress:[''],
      districtId:['',[Validators.required]],
      talukaId:['',[Validators.required]],
      villageId:['',[Validators.required]],
      deptId:['',[Validators.required]],
      officeId:['',[Validators.required]],
      natureGrievanceId:['',[Validators.required]],
      grievanceDescription:['',[Validators.required]]
    })
  }
 
  get f(){
    return this.postGrievanceForm.controls;
  }

  ngAfterViewInit() {
    let formValue: any = this.filterFrm.controls['textSearch'].valueChanges;
    formValue.pipe(filter(() => this.filterFrm.valid),
      debounceTime(1000),
      distinctUntilChanged()).subscribe(() => {
        this.pageNumber = 1;
        this.bindTable();
        this.totalRows > 10 && this.pageNumber == 1 ? this.paginator?.firstPage() : '';
      });
  }

  filterData() {
    this.pageNumber = 1;
    this.bindTable();
  }

  pageChanged(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.bindTable();
  }


  getState() {
    this.stateArray = [];
    this.commonApi.getAllState().subscribe({
      next: (response: any) => {
       this.stateArray.push({ 'value': 0, 'text': 'Select State' }, ...response);
       console.log( this.stateArray);
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getDistrict(){
    this.districtArray = [];
    // const id = this.userFrm.value.stateId;
    this.commonApi.getAllDistrict().subscribe({
      next: (response: any) => {
        this.districtArray.push(...response);
        this.districtArray.length == 1 ? this.postGrievanceForm.controls['districtId'].setValue(this.districtArray[0].id):'';
        this.getTaluka(1);
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getTaluka(distId:number){
    this.talukaArray = [];
    this.commonApi.getTalukabyDistId(distId).subscribe({
      next: (response: any) => {
       this.talukaArray.push( ...response);
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getVillage(talId:number){
    if(talId==0){
      return;
     }
    this.villageArray = [];
    this.commonApi.getVillageByTalukaId(talId).subscribe({
      next: (response: any) => {
       this.villageArray.push( ...response);       
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getDepartment() {
    this.departmentArray = [];
    this.commonApi.getAllDepartment().subscribe({
      next: (response: any) => {
        this.departmentArray.push(...response);
        // this.isEdit ? (this.userFrm.controls['deptId'].setValue(this.updatedObj?.deptId), this.getOffice(this.updatedObj?.deptId)) : '';
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getOffice(deptNo:number) {
    if(deptNo==0){
     return;
    }
     this.officeArray = [];
     this.commonApi.getOfficeByDeptId(deptNo).subscribe({
       next: (response: any) => {
         this.officeArray.push(...response);
        //  this.isEdit ? (this.userFrm.controls['officeId'].setValue(this.updatedObj.officeId)) : '';
       },
       error: ((error: any) => { this.error.handelError(error.status) })
     })
   }

   getStatus(){
    this.statusArray = [];
    this.commonApi.getAllStatus().subscribe({
      next: (response: any) => {
        this.statusArray.push(...response);
        // this.isEdit ? (this.userFrm.controls['deptId'].setValue(this.updatedObj?.deptId), this.getOffice(this.updatedObj?.deptId)) : '';
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
   }
   
   getGrievance(){
    this.natureOfGrievance = [];
    this.commonApi.getAllNatureOfGrievance().subscribe({
      next: (response: any) => {
        this.natureOfGrievance.push(...response);
        // this.isEdit ? (this.userFrm.controls['deptId'].setValue(this.updatedObj?.deptId), this.getOffice(this.updatedObj?.deptId)) : '';
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
   }
   //#region  clear filter  fn Start here
  clearFilter(flag: any) {
    switch (flag) {
      case 'taluka':
        this.filterFrm.controls['villageId'].setValue(0);
        // this.filterFrm.controls['textSearch'].setValue('');
        break;
        case 'department':
        this.filterFrm.controls['officeId'].setValue(0);
        // this.filterFrm.controls['textSearch'].setValue('');
        break;
      default:
    }

  }
  //#endregion clear filter  fn end here

   bindTable(){
    this.spinner.show()
    let formValue = this.filterFrm.value;
    let paramList: string = "?pageno=" + this.pageNumber+ "&pagesize=" + 10 +"&TalukaId="+ formValue.talukaId +"&VillageId="+ formValue.villageId+ "&DeptId=" + formValue.deptId + "&OfficeId=" + formValue.officeId + "&StatusId="+ formValue.statusId;
    this.commonMethod.checkDataType(formValue.textSearch.trim()) == true ? paramList += "&Textsearch=" + formValue.textSearch : '';
    this.apiService.setHttp('get', "samadhan/Grievance/GetAllGrievance" + paramList, false, false, false, 'samadhanMiningService');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
           this.postGrivanceData = res.responseData.responseData1;
          this.dataSource = new MatTableDataSource(this.postGrivanceData);
          this.dataSource.sort = this.sort;
          this.totalRows = res.responseData.responseData2[0].pageCount;
          this.pageNumber == 1 ? this.paginator?.firstPage() : '';
          this.spinner.hide();
        } else {
        
          this.spinner.hide();
          this.dataSource = []
          this.totalRows = 0;
          if (res.statusCode != "404") {
            this.commonMethod.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethod.matSnackBar(res.statusMessage, 1);
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    });
   }

   isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;

  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  documentUpload(event:any){
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
              var reader = new FileReader();

              reader.onload = (event:any) => {
                console.log(event.target.result);
                 this.urls.push(event.target.result); 
              }

              reader.readAsDataURL(event.target.files[i]);
      }
  }
}

  onSubmit(){
    if(this.postGrievanceForm.invalid){
      return
    }
  }
}

