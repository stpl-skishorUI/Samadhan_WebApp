import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, _MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/core/service/api.service';
import { CommonMethodService } from 'src/app/core/service/common-method.service';
import { ErrorHandlerService } from 'src/app/core/service/error-handler.service';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { ApexNonAxisChartSeries, ApexResponsive, ApexChart, ApexPlotOptions, ApexYAxis, ApexAnnotations, ApexFill, ApexStroke, ApexGrid } from "ng-apexcharts";
import { ChartComponent } from "ng-apexcharts"
import { NgxSpinnerService } from 'ngx-spinner';
import { WebStorageService } from 'src/app/core/service/web-storage.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  // labels: any;
  // dataLabels: ApexDataLabels;
  // legend: ApexLegend;
  // title: ApexTitleSubtitle

  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: any; //ApexXAxis;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {

  displayedColumns: string[] = ['srNo', 'department', 'totalGrievances', 'open', 'accepted', 'resolved', 'partialResolved', 'transferred'];
  dataSource: any;
  data: any;
  pageNumber: number = 1;
  totalRows: any;
  totalGrievance: any;
  percentages = new Array();
  departmants = new Array();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild("chart") chart!: ChartComponent
  public chartOptions!: Partial<ChartOptions> | any;
  constructor(
    private apiService: ApiService,
    private commonMethod: CommonMethodService,
    private error: ErrorHandlerService,
    private spinner: NgxSpinnerService,
    private localStrorageData: WebStorageService
  ) {

  }

  ngOnInit(): void {
    this.getData();
    this.bindTable();
    this.getChartData();
  }

  getData() {
    this.apiService.setHttp('get', "api/DashboardWeb/GetAll?userid=" + this.localStrorageData.getUserId(), false, false, false, 'samadhanMiningService');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.data = res.responseData;
        } else {
          this.dataSource = []
          if (res.statusCode != "404") {
            this.commonMethod.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethod.matSnackBar(res.statusMessage, 1);
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    });
  }

  bindTable() {
    this.spinner.show()
    this.apiService.setHttp('get', "api/DashboardWeb/StatusWiseGrievanceReceived?userid=" + this.localStrorageData.getUserId() + "&pageno=" + this.pageNumber + "&pagesize=" + 10, false, false, false, 'samadhanMiningService');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.dataSource = new MatTableDataSource(res.responseData.responseData1);
          this.totalRows = res.responseData.responseData2.pageCount;
          this.dataSource.sort = this.sort;
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.dataSource = []
          if (res.statusCode != "404") {
            this.commonMethod.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethod.matSnackBar(res.statusMessage, 1);
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    });
  }

  pageChanged(event: any) {
    this.pageNumber = event.pageIndex + 1;
    this.bindTable();
  }

  getChartData() {
    this.apiService.setHttp('get', "api/DashboardWeb/TotalGrievancesReceived?userid=" + this.localStrorageData.getUserId(), false, false, false, 'samadhanMiningService');
    this.apiService.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.totalGrievance = res.responseData;
          this.departmants = this.totalGrievance.map((ele: any) => ele['name']);
          this.percentages = this.totalGrievance.map((ele: any) => ele.percentage);
          this.lolipopChart(this.totalGrievance);
          // this.displayChart();

        } else {
          if (res.statusCode != "404") {
            this.commonMethod.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethod.matSnackBar(res.statusMessage, 1);
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    });
  }

  lolipopChart(redData:any) {
    am4core.useTheme(am4themes_animated);
    am4core.addLicense("ch-custom-attribution");
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    let data:any[] = [];
    redData.map((ele:any)=>{
      data.push({ category: ele?.name, value: ele.percentage });
    })

    chart.data = data;
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.minGridDistance = 15;
    categoryAxis.renderer.grid.template.location = 2;
    categoryAxis.renderer.grid.template.strokeDasharray = "1,3";
    categoryAxis.renderer.labels.template.rotation = -90;
    categoryAxis.renderer.labels.template.horizontalCenter = "middle";
    categoryAxis.renderer.labels.template.fontSize = 12;
    categoryAxis.renderer.cellStartLocation = 0.5
    categoryAxis.renderer.cellEndLocation = 0.5
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    let label = categoryAxis.renderer.labels.template;
    label.truncate = true;
    label.maxWidth = 150;

    let valueAxis: any = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.tooltip.disabled = true;
    valueAxis.renderer.ticks.template.disabled = true;
    valueAxis.renderer.axisFills.template.disabled = true;

    let series: any = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryX = "category";
    series.dataFields.valueY = "value";
    series.tooltipText = "{valueY.value}%";
    series.sequencedInterpolation = true;
    series.fillOpacity = 0;
    series.strokeOpacity = 1;
    series.strokeDashArray = "1,3";
    series.columns.template.width = 0.01;
    series.tooltip.pointerOrientation = "horizontal";

    let bullet = series.bullets.create(am4charts.CircleBullet);bullet
    chart.cursor = new am4charts.XYCursor();
    chart.scrollbarX = new am4core.Scrollbar();
  }


  // displayChart() {
  //   this.chartOptions = {
  //     series: [
  //       {
  //         name: "Percentage",
  //         data: this.percentages
  //       }
  //     ],
  //     annotations: {
  //       points: [
  //         {
  //           x: "Departments",
  //           seriesIndex: 0,
  //           label: {
  //             borderColor: "#775DD0",
  //             offsetY: 0,
  //             style: {
  //               color: "#fff",
  //               background: "#775DD0"
  //             },
  //           }
  //         }
  //       ]
  //     },
  //     chart: {
  //       height: 350,
  //       type: "bar"
  //     },
  //     plotOptions: {
  //       bar: {
  //         columnWidth: '15px',
  //         endingShape: "rounded",
  //         background: "#b83058"
  //       }
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     grid: {
  //       borderColor: '#b83058',
  //       row: {
  //         colors: ["#efc6c6", "#f3d5de"],
  //       }
  //     },
  //     xaxis: {
  //       labels: {
  //         rotate: -30
  //       },
  //       categories: this.departmants,
  //       tickPlacement: "on"
  //     },
  //     fill: {
  //       type: "gradient",
  //       gradient: {
  //         shade: "light",
  //         type: "horizontal",
  //         shadeIntensity: 0.25,
  //         gradientToColors: undefined,
  //         inverseColors: true,
  //         opacityFrom: 0.85,
  //         opacityTo: 0.85,
  //         stops: [50, 0, 100],
  //         colorStops: [
  //           {
  //             offset: 0,
  //             color: "#b83058",
  //             opacity: 1
  //           },]
  //       }
  //     }
  //   };
  // }
}





