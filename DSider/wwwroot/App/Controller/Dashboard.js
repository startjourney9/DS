﻿var Tariana = angular.module('Tariana', []);
Tariana.controller("DashboardController", function ($scope) {
    jQuery('#controlContiner').hide();
    jQuery('#stopIcon').hide();
    var splittedUrl = window.location.href.split("/");
    jQuery('.projectNameContainer').text('"' + splittedUrl[splittedUrl.length - 3].replace('%20', ' ') + '"')
    PlottingDash1();
    $scope.statisticsList = [];
    //Get staistics data from web api
    $scope.getStatistics = function (dashboardTypeStatic) {
        var mSubProjects = [];
        if (dashboardTypeStatic == 3) {
            if (jQuery("#ddSubProjectsDash3").val() == null) {
                alertify.error('Select sub project.');
                return;
            }
            jQuery($("#ddSubProjectsDash3").select2().find(":selected")).each(function (Index, Val) {
                mSubProjects.push(jQuery(this).attr('mID'));
            });
        }
        else {
            mSubProjects.push(splittedUrl[splittedUrl.length - 4]);
        }
        //
        $.ajax({
            url: '/api/WebAPI_PlottingData/getDashboardStatistics',
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify(mSubProjects),
            success: function (response) {
                $scope.statisticsList = [];
                jQuery(response).each(function (Index1, Val1) {
                    jQuery(Val1.mData).each(function (Index, Val) {
                        $scope.statisticsList.push({
                            'subProject': Val1.subProjectName,
                            'capex': parseFloat(Val.capex),
                            'taxCredit': parseFloat(Val.taxCredit),
                            'carbonTax': parseFloat(Val.carbonTax),
                            'emissionMitgated': parseFloat(Val.emissionMitgated),
                            'npv': parseFloat(Val.npv),
                            'irr': parseFloat(Val.irr),
                            'supplyReliability': parseFloat(Val.supplyReliability),
                            'lcoh': parseFloat(Val.lcoh),
                            'variable': parseFloat(Val.variable),
                            'period': parseFloat(Val.period),
                            'other': parseFloat(Val.other),
                        });
                    })
                });
                $scope.$apply();
                $('.counter').each(function () {
                    $(this).prop('Counter', 0).animate({
                        Counter: $(this).text()
                    }, {
                        duration: 4000,
                        easing: 'swing',
                        step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
                });
            },
            error: function (response) {

            },
            failure: function (response) {

            }
        });

        //$scope.statisticsList = [];
        //jQuery(jQuery("#ddSubProjectsDash3").val()).each(function (Index, Val) {
        //    $scope.statisticsList.push({
        //        'subProject': Val,
        //        'capex': parseFloat(generateRandomDecimalInRangeFormatted(200, 500, 0)),
        //        'taxCredit': parseFloat(generateRandomDecimalInRangeFormatted(3, 7, 0)),
        //        'carbonTax': parseFloat(generateRandomDecimalInRangeFormatted(3, 9, 2)),
        //        'emissionMitgated': parseFloat(generateRandomDecimalInRangeFormatted(3, 9, 2)),
        //        'npv': parseFloat(generateRandomDecimalInRangeFormatted(20.5, 200.75, 2)),
        //        'irr': parseFloat(generateRandomDecimalInRangeFormatted(10, 55, 0)),
        //        'supplyReliability': parseFloat(generateRandomDecimalInRangeFormatted(100.15, 300.75, 2)),
        //        'lcoh': parseFloat(generateRandomDecimalInRangeFormatted(2, 10, 0)),
        //        'variable': parseFloat(generateRandomDecimalInRangeFormatted(10, 80, 0)),
        //        'period': parseFloat(generateRandomDecimalInRangeFormatted(10, 80, 0)),
        //        'other': parseFloat(generateRandomDecimalInRangeFormatted(10, 80, 0)),
        //    });
        //});
        //console.log($scope.statisticsList)
    };
    $scope.getStatistics(1);
    //Backward to simulation page
    $scope.backToSimulation = function () {
        window.location.href = '/Home/Simulation?project=' + splittedUrl[splittedUrl.length - 4] + '&name=' + splittedUrl[splittedUrl.length - 3] + '&folder=' + splittedUrl[splittedUrl.length - 2] + '&type=' + splittedUrl[splittedUrl.length - 1];
    }
    //Show plot by: All, Yearly, Monthly, Daily
    jQuery(document).on('click', '.plotControl', function () {
        if (jQuery(this).attr('disabled') == 'disabled') {
            return;
        }
        jQuery('.plotControl').removeClass('activeplotControl');
        jQuery(this).addClass('activeplotControl');
        if (allDataPlot2.length == 0) {
            alertify.error('Plot your data.')
            return;
        }

        jQuery('#hiddenCurrentDatePlotting').val('');
        jQuery('#spanCurrentCount').text('0');
        //
        if (jQuery(this).attr('data') == 'All') {
            jQuery('#controlContiner').hide();
            showPlotDash2ByType(allDataPlot2);
        }
        if (jQuery(this).attr('data') == 'Yearly') {
            jQuery('#controlContiner').show();
            jQuery(allDataPlot2).each(function (Index, Val) {
                const result = [...new Set(Val.mData.map(event => new Date(event.timeUTC).getFullYear()))];
                jQuery('#hiddenYearsCountPlotting').val(result.length);
                jQuery('#spanTotalCount').text(result.length);
                return false;
            });

        }
        else if (jQuery(this).attr('data') == 'Monthly') {
            jQuery('#controlContiner').show();
            var dates = [];
            jQuery(allDataPlot2).each(function (Index, Val) {
                dates = Val.mData.map(function (x) { return new Date(x.timeUTC); });
                return false;
            });
            var latest = new Date(Math.max.apply(null, dates));
            var earliest = new Date(Math.min.apply(null, dates));
            var monthesCount = (monthDiff(earliest, latest) + 1);
            jQuery('#hiddenMonthesCountPlotting').val(monthesCount);
            jQuery('#spanTotalCount').text(monthesCount)
        }
        else if (jQuery(this).attr('data') == 'Daily') {
            jQuery('#controlContiner').show();
            //var dates = allDataPlot2.map(function (x) { return new Date(x.timeUTC); })
            jQuery(allDataPlot2).each(function (Index, Val) {
                dates = Val.mData.map(function (x) { return new Date(x.timeUTC); });
                return false;
            });
            var latest = new Date(Math.max.apply(null, dates));
            var earliest = new Date(Math.min.apply(null, dates));
            var daysCount = (daysDiff(earliest, latest));
            jQuery('#hiddenDaysCountPlotting').val(daysCount);
            jQuery('#spanTotalCount').text(daysCount)
        }
        nextPlot();
    });
    //Line Chart, Stacked area Chart
    jQuery(document).on('change', 'input[name="chartType"]', function () {
        jQuery('.activeplotControl').trigger('click');
    });
});
$(document).ready(function () {
    getAllSubProjects();
    jQuery("#ddProperties").select2({
        placeholder: "Select items",
        allowClear: true
    });


});
var splittedUrl = window.location.href.split("/");
var queryStringSubProjetID = splittedUrl[splittedUrl.length - 4]
var autoPlayDash2TimeOut;
var timeAutoPlayInterval = parseInt(jQuery('#txtInterval').val());
//When click on play to plotting automatically
function autoPlay() {
    jQuery('#playIcon').hide();
    jQuery('#stopIcon').show();
    jQuery('#hiddenCurrentDatePlotting').val('');
    //
    clearInterval(autoPlayDash2TimeOut);
    //
    autoPlayDash2TimeOut = setInterval(function () {
        preapreAutoPlay();
    }, parseFloat(jQuery('#txtInterval').val()) * 1000);
}
var autoPlayCounter = 1;
//Autoplay plot
function preapreAutoPlay() {
    if (autoPlayCounter < parseFloat(jQuery('#spanTotalCount').text())) {
        nextPlot();
        jQuery('#spanCurrentCount').text(autoPlayCounter);
        autoPlayCounter += 1;
    }
    else {
        clearInterval(autoPlayDash2TimeOut);
    }
}
//Stop auto play
function stopPlot() {
    jQuery('#playIcon').show();
    jQuery('#stopIcon').hide();
    clearInterval(autoPlayDash2TimeOut);
    jQuery('#hiddenCurrentDatePlotting').val('');
    jQuery('#spanCurrentCount').text(1);
}
//To previous year, month, day
function previousPlot() {
    if (jQuery('.activeplotControl').attr('data') == 'Yearly') {
        //var dates = allDataPlot2.map(function (x) { return new Date(x.timeUTC); })
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        var mFakeDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        mFakeDate = new Date(mFakeDate.setFullYear(mFakeDate.getFullYear() - 1));
        if (mFakeDate <= earliest) {
            alertify.error("It's start date.");
            return;
        }
        var mEndDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mStartDate = new Date(mEndDate);
        mStartDate = new Date(mStartDate.setFullYear(mStartDate.getFullYear() - 2));
        var resultDataPlot = [];
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        })
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery('#hiddenCurrentDatePlotting').val(new Date(mStartDate.setFullYear(mStartDate.getFullYear() + 1)));
        showPlotDash2ByType(resultDataPlot);
    }
    else if (jQuery('.activeplotControl').attr('data') == 'Monthly') {
        //var dates = allDataPlot2.map(function (x) { return new Date(x.timeUTC); })
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        var mFakeDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        mFakeDate = new Date(mFakeDate.setMonth(mFakeDate.getMonth() - 1));
        if (mFakeDate <= earliest) {
            alertify.error("It's start date.");
            return;
        }
        var mEndDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mStartDate = new Date(mEndDate);
        mStartDate = new Date(mStartDate.setMonth(mStartDate.getMonth() - 2));
        var resultDataPlot = [];
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        })
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery('#hiddenCurrentDatePlotting').val(new Date(mStartDate.setMonth(mStartDate.getMonth() + 1)));
        showPlotDash2ByType(resultDataPlot);
    }
    else if (jQuery('.activeplotControl').attr('data') == 'Daily') {
        //var dates = allDataPlot2.map(function (x) { return new Date(x.timeUTC); })
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        var mFakeDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        mFakeDate = new Date(mFakeDate.setDate(mFakeDate.getDate() - 1));
        if (mFakeDate <= earliest) {
            alertify.error("It's start date.");
            return;
        }
        var mEndDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mStartDate = new Date(mEndDate);
        mStartDate = new Date(mStartDate.setDate(mStartDate.getDate() - 2));
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        })
        jQuery('#hiddenCurrentDatePlotting').val(new Date(mStartDate.setDate(mStartDate.getDate() + 1)));
        showPlotDash2ByType(resultDataPlot);
    }

    var currntCount = parseFloat(jQuery('#spanCurrentCount').text());
    jQuery('#spanCurrentCount').text(currntCount - 1);
}
//To next year, month, day
function nextPlot() {
    if (jQuery('.activeplotControl').attr('data') == 'Yearly') {
        //dates = Val.mData.map(function (x) { return new Date(x.timeUTC); });
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        if (new Date(jQuery('#hiddenCurrentDatePlotting').val()) > latest) {
            alertify.error('All dates surveyed.');
            return;
        }
        //
        if (jQuery('#hiddenCurrentDatePlotting').val() == '')
            jQuery('#hiddenCurrentDatePlotting').val(earliest);
        var mStartDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mEndDate = new Date(mStartDate);
        mEndDate = new Date(mEndDate.setFullYear(mEndDate.getFullYear() + 1));
        //
        var resultDataPlot = [];
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        })
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery('#hiddenCurrentDatePlotting').val(mEndDate);
        showPlotDash2ByType(resultDataPlot);
    }
    else if (jQuery('.activeplotControl').attr('data') == 'Monthly') {
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        if (new Date(jQuery('#hiddenCurrentDatePlotting').val()) > latest) {
            alertify.error('All dates surveyed.');
            return;
        }
        //
        if (jQuery('#hiddenCurrentDatePlotting').val() == '')
            jQuery('#hiddenCurrentDatePlotting').val(earliest);
        var mStartDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mEndDate = new Date(mStartDate);
        mEndDate = new Date(mEndDate.setMonth(mEndDate.getMonth() + 1));
        //
        var resultDataPlot = [];
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        });
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery('#hiddenCurrentDatePlotting').val(mEndDate);
        showPlotDash2ByType(resultDataPlot);
    }
    else if (jQuery('.activeplotControl').attr('data') == 'Daily') {
        var dates = allDataPlot2[0].mData.map(function (x) { return new Date(x.timeUTC); })
        var latest = new Date(Math.max.apply(null, dates));
        var earliest = new Date(Math.min.apply(null, dates));
        //
        if (new Date(jQuery('#hiddenCurrentDatePlotting').val()) > latest) {
            alertify.error('All dates surveyed.');
            return;
        }
        //
        if (jQuery('#hiddenCurrentDatePlotting').val() == '')
            jQuery('#hiddenCurrentDatePlotting').val(earliest);
        var mStartDate = new Date(jQuery('#hiddenCurrentDatePlotting').val());
        var mEndDate = new Date(mStartDate);
        mEndDate = new Date(mEndDate.setDate(mEndDate.getDate() + 1));
        //
        var resultDataPlot = [];
        jQuery(allDataPlot2).each(function (Index, Val) {
            var mFiltered = Val.mData.filter(d => {
                var time = new Date(d.timeUTC).getTime();
                return (mStartDate < time && time < mEndDate);
            });
            resultDataPlot.push({
                'mData': mFiltered,
                'subProjectID': Val.subProjectID,
                'subProjectName': Val.subProjectName
            });
        });
        //resultDataPlot = allDataPlot2.filter(d => {
        //    var time = new Date(d.timeUTC).getTime();
        //    return (mStartDate < time && time < mEndDate);
        //});
        jQuery('#hiddenCurrentDatePlotting').val(mEndDate);
        showPlotDash2ByType(resultDataPlot);
    }

    var currntCount = parseFloat(jQuery('#spanCurrentCount').text());
    jQuery('#spanCurrentCount').text(currntCount + 1);
}
//Compute diffrences between to dates
function daysDiff(d1, d2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(d1);
    const secondDate = new Date(d2);

    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}
//Compute diffrences between to dates
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}
//Rfresh dashboard
function doRefreshDash3() {
    if (jQuery("#ddSubProjectsDash3").val() == null) {
        alertify.error('Select sub project.');
        return;
    }
}
//Create random numbers
function generateRandomDecimalInRangeFormatted(min, max, places) {
    let value = (Math.random() * (max - min + 1)) + min;
    return Number.parseFloat(value).toFixed(places);
}
function findMax(num) {
    return Math.max.apply(null, num);
}
function findMin(num) {
    return Math.min.apply(null, num);
}
//Show plotting data to dashboard1
function showPlotDash2ByType(dataToPlot) {
    var response = dataToPlot;
    var plotType = jQuery(this).attr('data');
    var seriesData = [];
    var yAxis = [];
    var counter = 0;
    var xAxis = [];
    jQuery(response).each(function (IndexSub, ValSub) {
        if (IndexSub == 0)
            xAxis = ValSub.mData.map(a => a.timestep);
        jQuery(jQuery("#ddProperties").val()).each(function (Index, Val) {
            var data = [];
            switch (Val) {
                case 'Turbine Green Electricity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_turbine_avail);
                    break;
                case 'Solar Green Electricity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_solar_avail);
                    break;
                case 'Battery Electricity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_battery_out);
                    break;
                case 'Residual Electricity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_elec_loadbalancer_excess);
                    break;
                case 'Electrolyzer Electricity Input (MWH)':
                    data = ValSub.mData.map(a => a.pwr_electrolyzer_in);
                    break;
                case 'Electrolyzer Hydrogen Output (kg/h)':
                    data = ValSub.mData.map(a => a.h2_electrolyzer_out);
                    break;
                case 'Battery Storage (MWH)':
                    data = ValSub.mData.map(a => a.pwr_battery_storage);
                    break;
                case 'Battery Power Capacity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_battery_cap);
                    break;
                case 'Electrolyzer Power Capacity (MWH)':
                    data = ValSub.mData.map(a => a.pwr_cap_electrolyzer);
                    break;
                case 'Hydrogen Load Balancer Residual (kg/h)':
                    data = ValSub.mData.map(a => a.h2_loadbalancer_excess);
                    break;
                case 'H2 Industry (kg/h)':
                    data = ValSub.mData.map(a => a.h2_industry_demand);
                    break;
                case 'H2 Mobility (kg/h)':
                    data = ValSub.mData.map(a => a.h2_mobility_demand);
                    break;
                case 'H2 External Store Output (kg/h)':
                    data = ValSub.mData.map(a => a.h2_externalsupply_out);
                    break;
                case 'H2 Green Store Output (kg/h)':
                    data = ValSub.mData.map(a => a.h2_greenstore_out);
                    break;
                case 'H2 Direct RE (kg/h)':
                    data = ValSub.mData.map(a => a.h2_electrolyzer_out_re);
                    break;
                case 'H2 Battery (kg/h)':
                    data = ValSub.mData.map(a => a.h2_electrolyzer_out_bat);
                    break;
                case 'H2 Gray Power (kg/h)':
                    data = ValSub.mData.map(a => a.h2_electrolyzer_out_grid);
                    break;
                case 'H2 Green Storage (kg/h)':
                    data = ValSub.mData.map(a => a.h2_greenstore_out);
                    break;
                case 'H2 External (kg/h)':
                    data = ValSub.mData.map(a => a.h2_externalsupply_out);
                    break;
            }
            //
            var foundYAxsis = yAxis.findIndex(v => v.attrName === Val);
            if (foundYAxsis == -1) {
                yAxis.push({
                    attrName: Val,
                    'title': {
                        text: Val,// + '(' + ValSub.subProjectName + ')',
                        style: {
                            fontSize: '14px'
                        }
                    },
                    opposite: (counter == 0 ? false : true),
                    min: findMin(data),
                    max: findMax(data),
                    height: '100%',
                    'lineWidth': 2,
                    labels: {
                        formatter: function () {
                            return this.value;
                        },

                        style: { fontSize: "14px" }
                    },
                });
            }
            else {
                var latestMin = yAxis[foundYAxsis].min;
                var latestMax = yAxis[foundYAxsis].max;
                var currentMin = findMin(data);
                var currentMax = findMax(data);
                if (currentMax > latestMax)
                    yAxis[foundYAxsis].max = currentMax;
                if (currentMin < latestMin)
                    yAxis[foundYAxsis].min = currentMin;
            }
            seriesData.push({
                'label': {
                    'enabled': false
                },
                lineWidth: 2,
                zoneAxis: 'x',
                'yAxis': (foundYAxsis == -1 ? (yAxis.length - 1) : foundYAxsis),
                'name': Val + '(' + ValSub.subProjectName + ')',
                'keys': ['y', 'id'],
                'data': data,
                'lineWidth': 2,
                'marker': {
                    'enabled': false
                },
            });
            //
            counter++;
        });
    });

    //
    Highcharts.setOptions({
        global: {
            useUTC: true,

        }
    });
    //
    var chartType = jQuery("input[name='chartType']:checked").val();
    //
    var chart = new Highcharts.Chart({
        chart: {
            type: chartType,
            renderTo: 'container2',
            zoomType: 'xy',
        },
        xAxis: {
            title: {
                text: 'Time step (Hours)'
            },
            tickInterval: 100,
            categories: xAxis,
            labels: {
                rotation: 90,
                style: { fontSize: "14px" }
            },
        },
        title: {
            text: '',
            align: 'center',
        },
        series: seriesData,
        yAxis: yAxis,
        plotOptions: {
            series: {
                turboThreshold: 10000000,
                connectNulls: false,
                cursor: "pointer",
                pointInterval: undefined,
                pointStart: undefined,
            }
        },
    });
}
var allDataPlot2 = [];
//GEt Plotting data for dashboard
function Plotting() {
    if (jQuery("#ddSubProjects").val() == null) {
        alertify.error('Select sub project.');
        return;
    }
    if (jQuery("#ddProperties").val() == null) {
        alertify.error('Select properties.');
        return;
    }
    var mSubProjects = [];
    jQuery($("#ddSubProjects").select2().find(":selected")).each(function (Index, Val) {
        mSubProjects.push(jQuery(this).attr('mID'));
    });
    jQuery('#hiddenCurrentDatePlotting').val('');
    jQuery('.plotControl').attr('disabled', 'disabled');
    //
    $.ajax({
        url: '/api/WebAPI_PlottingData/getPlottingData',
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(mSubProjects),
        success: function (response) {
            allDataPlot2 = response;
            //showPlotDash2ByType(response);
            jQuery('.plotControl').removeAttr('disabled');
            jQuery('.activeplotControl').trigger('click');
        },
        error: function (response) {

        },
        failure: function (response) {

        }
    });

}
//Show plotting data
function showPlotDash1(dataToPlot) {
    var response = dataToPlot;
    var seriesData = [];

    var chartType = jQuery("input[name='chartTypeDash1']:checked").val();

    if (chartType === 'line')
        for (var i = 0; i < 5; i++) {
        var Val = '';
        var data = [];
        switch (i) {
            case 0:
                data = response.map(a => [new Date(a.timeUTC).getTime(), a.pwr_turbine_out])
                Val = 'PWR Turbine Out';
                break;
            case 1:
                data = response.map(a => [new Date(a.timeUTC).getTime(), a.pwr_elec_loadbalancer_to_electrolyzer])
                Val = 'PWR Elec Load Balancer To Electrolyzer';
                break;
            case 2:
                data = response.map(a => [new Date(a.timeUTC).getTime(), a.pwr_battery_storage])
                Val = 'PWR Battery Storage';
                break;
            case 3:
                data = response.map(a => [new Date(a.timeUTC).getTime(), a.pwr_battery_cap])
                Val = 'PWR Battery Capacity';
                break;
            case 4:
                data = response.map(a => [new Date(a.timeUTC).getTime(), a.h2_electrolyzer_out])
                Val = 'H2 Electrolyzer Out';
                break;
        }

        seriesData.push({
            name: Val,
            data: data,
            type: 'spline'
        })
    }

    if (chartType === 'hydration') {
        console.log('hydration');

        seriesData.push({
            name: 'Total Hydration',
            data: response.map(a => {
                var total = 0;

                Object.keys(a).filter(key => key.includes('h2_')).forEach(h2Key => {
                    total += a[h2Key] * 1.0;
                })

                return [new Date(a.timeUTC).getTime(), total];
            })
        })
    }

    var chart = Highcharts.stockChart('containerPlotDash1', {
        rangeSelector: {
            selected: 1
        },

        title: {
            text: ''
        },

        series: seriesData
    })
}
//Get plotting data for dashboard1
function PlottingDash1() {
    var splittedUrl = window.location.href.split("/");
    $.ajax({
        url: '/api/WebAPI_PlottingData/getPlottingDataForDash1/' + splittedUrl[splittedUrl.length - 4],
        type: "GET",
        contentType: 'application/json',
        success: function (response) {
            showPlotDash1(response);
        },
        error: function (response) {

        },
        failure: function (response) {

        }
    });
}
//Get all sub projects
function getAllSubProjects() {
    $.ajax({
        url: '/api/WebAPI_Projects/getAllSubProjects',
        type: "GET",
        contentType: 'application/json',
        success: function (response) {
            jQuery(response).each(function (Index, Val) {
                jQuery('#ddSubProjects,#ddSubProjectsDash3').append('<option mID="' + Val.id + '" value="' + Val.name + '">' + Val.name + '</option>');
            });
            $("#ddSubProjects,#ddSubProjectsDash3").select2({
                placeholder: "Select items",
                allowClear: true
            });
        },
        error: function (response) {

        },
        failure: function (response) {

        }
    });
}
//Add comma sign to numbers1
function addComma(number) {
    return number.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
class Slider {
    constructor(rangeElement, valueElement, options) {
        this.rangeElement = rangeElement
        this.valueElement = valueElement
        this.options = options

        // Attach a listener to "change" event
        if (this.rangeElement != null)
            this.rangeElement.addEventListener('input', this.updateSlider.bind(this))
    }
    init() {
        console.log(this.rangeElement)
        console.log(this.options)
        this.rangeElement.setAttribute('min', this.options.min)
        this.rangeElement.setAttribute('max', this.options.max)
        this.rangeElement.value = this.options.cur

        this.updateSlider()
    }
    asMoney(value) {
        return '$' + parseFloat(value)
            .toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    generateBackground(rangeElement) {
        if (this.rangeElement.value === this.options.min) {
            return
        }

        let percentage = (this.rangeElement.value - this.options.min) / (this.options.max - this.options.min) * 100
        return 'background: linear-gradient(to right, #1d9075, #1d9075 ' + percentage + '%, #d3edff ' + percentage + '%, #dee1e2 100%)'
        //'background: #1d9075';//
    }
    updateSlider(newValue) {
        var mID = this.rangeElement.id;
        jQuery('#' + mID).parent().parent().parent().parent().find('.rangeTitleMin').text(addComma(this.rangeElement.value));
        //if (typeof newValue != 'undefined')
        //    PlottingDash1();
        //this.valueElement.innerHTML = this.asMoney(this.rangeElement.value)
        this.rangeElement.style = this.generateBackground(this.rangeElement.value)
    }
}

let rangeElement = document.querySelector('.range [type="range"]');
let valueElement = document.querySelector('.range .range__value span');
//
let rangeElement2 = document.querySelector('.range2 [type="range"]');
let valueElement2 = document.querySelector('.range2 .range__value span');
//
let rangeElement4 = document.querySelector('.range4 [type="range"]');
let valueElement4 = document.querySelector('.range4 .range__value span');
//
let rangeElementBat = document.querySelector('.rangeBat [type="range"]');
let valueElementBat = document.querySelector('.rangeBat .range__value span');

let rangeElementElec = document.querySelector('.rangeElec [type="range"]');
let valueElementElec = document.querySelector('.rangeElec .range__value span');

let rangeElementGreenH2 = document.querySelector('.rangeGreenH2 [type="range"]');
let valueElementGreenH2 = document.querySelector('.rangeGreenH2 .range__value span');

let rangeElementMob1 = document.querySelector('.rangeMob1 [type="range"]');
let valueElementMob1 = document.querySelector('.rangeMob1 .range__value span');


let rangeElementMob2 = document.querySelector('.rangeMob2 [type="range"]');
let valueElementMob2 = document.querySelector('.rangeMob2 .range__value span');
var options = {
    min: 200,
    max: 2000,
    cur: 1000
}
var options2 = {
    min: 200,
    max: 2000,
    cur: 1000
}

var options4 = {
    min: 200,
    max: 2000,
    cur: 1200
}

var optionsBat = {
    min: 300,
    max: 1500,
    cur: (queryStringSubProjetID == '61e17ca2875fedde75c053f0' ? 500 : 1000)
}
var optionsElec = {
    min: 50,
    max: 400,
    cur: 100
}
var optionsGreenH2 = {
    min: 10000,
    max: 30000,
    cur: 20000
}
var optionsIndustry = {
    min: 100,
    max: 1500,
    cur: 300
}
var optionsMobility = {
    min: 100,
    max: 1500,
    cur: 600
}
if (rangeElement) {
    let slider = new Slider(rangeElement, valueElement, options)
    slider.init()
    //
    let slider2 = new Slider(rangeElement2, valueElement2, options2)
    slider2.init();
    //
    let slider4 = new Slider(rangeElement4, valueElement4, options4)
    slider4.init();
    //
    let sliderBat = new Slider(rangeElementBat, valueElementBat, optionsBat)
    sliderBat.init();
    //
    let sliderElec = new Slider(rangeElementElec, valueElementElec, optionsElec)
    sliderElec.init();
    //
    let sliderGreenH2 = new Slider(rangeElementGreenH2, valueElementGreenH2, optionsGreenH2)
    sliderGreenH2.init();
    //
    let sliderMob1 = new Slider(rangeElementMob1, valueElementMob1, optionsMobility)
    sliderMob1.init();
    //
    let sliderMob2 = new Slider(rangeElementMob2, valueElementMob2, optionsIndustry)
    sliderMob2.init();
}