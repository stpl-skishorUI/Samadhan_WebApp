import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfigService } from 'src/app/configs/config.service';
import { ApiService } from 'src/app/core/service/api.service';
import { CommonApiService } from 'src/app/core/service/common-api.service';
import { CommonMethodService } from 'src/app/core/service/common-method.service';
import { ErrorHandlerService } from 'src/app/core/service/error-handler.service';
import { ExcelService } from 'src/app/core/service/excel_Pdf.service';
import { FormsValidationService } from 'src/app/core/service/forms-validation.service';
import { WebStorageService } from 'src/app/core/service/web-storage.service';
import { SamadhanReportComponent } from '../samadhan-report/samadhan-report.component';

@Component({
  selector: 'app-department-report',
  templateUrl: './department-report.component.html',
  styleUrls: ['./department-report.component.css']
})
export class DepartmentReportComponent implements OnInit {

  filterForm!: FormGroup;
  displayedColumns: string[] = ['srNo', 'departmentname', 'received', 'open', 'accepted', 'resolved','rejected','partialResolved','transfered'];
  dataSource: any;
  totalPages: any;
  pageNo = 1;
  pageSize = 10;
  officeDepReportArray=new Array();
  departmentArray = new Array();
  userId:any;
  getUrl:any;
  reportArray=new Array();
  
  constructor(
    private apiService: ApiService,
    public error: ErrorHandlerService,
    private spinner: NgxSpinnerService,
    public configService: ConfigService,
    public validation: FormsValidationService,
    public localStrorageData: WebStorageService,
    public commonService: CommonApiService,
    public dialog: MatDialog,
    public commonMethod: CommonMethodService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private pdf_excelService : ExcelService,
    private router:Router
  ) {}

  ngOnInit(): void {
     this.getUrl = this.router.url.split('/')[1];
    this.userId = this.localStrorageData.getUserId();
    this.filterform();
    this.getOfficerDepartmentReport();
    this.getDepartment();
  }

  filterform() {
    this.filterForm = this.fb.group({
      searchdeptId: [0],
      fromDate: [''],
      toDate: ['']
    })
  }


  getDepartment() {
    this.departmentArray = [];
    this.commonService.getAllDepartment().subscribe({
      next: (response: any) => {
        this.departmentArray.push(...response);
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    })
  }

  getOfficerDepartmentReport() {
    this.spinner.show();
    let formData = this.filterForm.value;
    formData.fromDate = formData.fromDate ? this.datePipe.transform(formData.fromDate, 'yyyy/MM/dd') : '';
    formData.toDate = formData.toDate ? this.datePipe.transform(formData.toDate, 'yyyy/MM/dd') : '';

    if(formData.fromDate){
      if(!formData.toDate){
        this.commonMethod.matSnackBar('Please select end date', 1);
        this.spinner.hide();
        return
      } 
    }

    this.officeDepReportArray=[];
    let obj = formData.searchdeptId + '&userid='+ this.userId + '&fromDate='+ formData.fromDate + '&toDate='+ formData.toDate
    this.apiService.setHttp('get','api/ShareGrievances/OfficerDepartmentReport?searchdeptId=' + obj,false,false,false,'samadhanMiningService');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
           this.reportArray=res.responseData;
           this.dataSource = new MatTableDataSource(this.reportArray);
          // this.dataSource = new MatTableDataSource(this.reportArray);
          // this.officeDepReportArray = res.responseData.map((ele: any, index: any) => {
          //   ele.deptId = index + 1;
          //   delete ele.isDeleted
          //   return ele
          // });
          
          this.reportArray.map((ele: any, index: any) => {
          let obj={
            'srno':index+1,
            'depertmentName':ele.departmentname,
            'received':ele.received,
            'opened':ele.openn,
            'rejected':ele.rejected,
            'resolved':ele.resolved,
            'accepted':ele.accepted,
            'partialResloved':ele.partialResloved,
            'transfered':ele.transfered
          }
            this.officeDepReportArray.push(obj);
         });
              
          console.log(this.officeDepReportArray);
          this.totalPages = res.responseData1.pageCount;
          this.reportArray=[];
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.dataSource = [];
          this.reportArray=[];
         
          this.totalPages = 0;
        }
      },
      error: (error: any) => {
        this.error.handelError(error.status);
        this.spinner.hide();
      },
    });
  }

  pageChanged(event: any) {
    this.pageNo = event.pageIndex + 1;
    this.getOfficerDepartmentReport();
  }

  clearFilter() {
    this.filterform();
    this.pageNo = 1;
    this.getOfficerDepartmentReport();
  }

  downloadExcel() {
    // let keyValue = this.officeDepReportArray.map((value: any) => Object.keys(value));
    // let keyData = keyValue[0]; // key Name

    let fromdate:any;
    let todate:any;
    let checkFromDateFlag: boolean = true;
    let checkToDateFlag: boolean = true;
    let formData = this.filterForm.value;
    formData.fromDate = formData.fromDate ? this.datePipe.transform(formData.fromDate, 'yyyy/MM/dd') : '';
    formData.toDate = formData.toDate ? this.datePipe.transform(formData.toDate, 'yyyy/MM/dd') : '';

    let ValueData = this.officeDepReportArray.reduce(
      (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)],
      []
    );// Value Name
    let keyPDFHeader = ["SrNo", "Department Name","Receive","Open", "Accept", "Resolve","Reject","Partial Resolve","Transfer"];
    

    let objData:any = {
      'topHedingName': 'Department Report',
      'createdDate': 'Created on:'+this.datePipe.transform(new Date(), 'dd/MM/yyyy hh:mm a')
    }

    checkFromDateFlag = formData.fromDate == '' || formData.fromDate == null || formData.fromDate == 0 || formData.fromDate == undefined ? false : true;
    checkToDateFlag =  formData.toDate == '' ||  formData.toDate == null ||  formData.toDate == 0 ||  formData.toDate == undefined ? false : true;
    if (formData.fromDate &&  formData.toDate && checkFromDateFlag && checkToDateFlag) {
      fromdate = new Date(formData.fromDate);
      todate = new Date( formData.toDate);
      objData.timePeriod = 'From Date:' + this.datePipe.transform(fromdate, 'dd/MM/yyyy') + ' To Date: ' + this.datePipe.transform(todate, 'dd/MM/yyyy');
    }

    this.pdf_excelService.generateExcel(keyPDFHeader, ValueData, objData);
  }

  downloadPdf() {
    let fromdate:any;
    let todate:any;
    let checkFromDateFlag: boolean = true;
    let checkToDateFlag: boolean = true;
    let formData = this.filterForm.value;
    formData.fromDate = formData.fromDate ? this.datePipe.transform(formData.fromDate, 'yyyy/MM/dd') : '';
    formData.toDate = formData.toDate ? this.datePipe.transform(formData.toDate, 'yyyy/MM/dd') : '';

    let keyPDFHeader = ["SrNo", "Department Name", "Receive","Open", "Accept", "Resolve","Reject","Partial Resolve","Transfer"];
    let ValueData = this.officeDepReportArray.reduce(
      (acc: any, obj: any) => [...acc, Object.values(obj).map((value) => value)],
      []
    );// Value Name
 

    let objData:any = {
      'topHedingName': 'Department Report',
      'createdDate': 'Created on:'+this.datePipe.transform(new Date(), 'dd/MM/yyyy hh:mm a')
    }

    checkFromDateFlag = formData.fromDate == '' || formData.fromDate == null || formData.fromDate == 0 || formData.fromDate == undefined ? false : true;
    checkToDateFlag =  formData.toDate == '' ||  formData.toDate == null ||  formData.toDate == 0 ||  formData.toDate == undefined ? false : true;
    if (formData.fromDate &&  formData.toDate && checkFromDateFlag && checkToDateFlag) {
      fromdate = new Date(formData.fromDate);
      todate = new Date( formData.toDate);
      objData.timePeriod = 'From Date:' + this.datePipe.transform(fromdate, 'dd/MM/yyyy') + ' To Date: ' + this.datePipe.transform(todate, 'dd/MM/yyyy');
    }
    this.pdf_excelService.downLoadPdf(keyPDFHeader, ValueData, objData);
  }

  getDetailsReport(ele:any,eleFlag:any){
    console.log(ele);
    let obj={
      'url':this.getUrl,
      'flag':eleFlag,
      'deptId':ele.deptId
    }

    const dialogRef = this.dialog.open(SamadhanReportComponent, {
      width: '100%',
      height:'650px',
      data:obj,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((_result: any) => {
      
    }); 
  }

}
