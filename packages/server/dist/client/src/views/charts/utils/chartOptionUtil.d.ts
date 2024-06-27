export declare const getLonghuListOption: (xAxisData: any, yAxisData: any, legendData: any) => {
    color: string[];
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    grid: {
        top: string;
        left: string;
        right: string;
        bottom: string;
        containLabel: boolean;
    };
    toolbox: {
        feature: {
            saveAsImage: {
                show: boolean;
            };
        };
    };
    legend: {
        data: any;
    };
    xAxis: {
        type: string;
        axisTick: {
            alignWithLabel: boolean;
        };
        data: any;
    }[];
    yAxis: {
        type: string;
        name: any;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
    }[];
    series: ({
        name: any;
        type: string;
        stack: string;
        yAxisIndex: number;
        label: {
            show: boolean;
            fontSize: number;
            position: string;
            color?: undefined;
        };
        emphasis: {
            focus: string;
        };
        data: any;
    } | {
        name: any;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            color: string;
            position: string;
            fontSize?: undefined;
        };
        stack?: undefined;
        emphasis?: undefined;
    } | {
        name: any;
        type: string;
        yAxisIndex: number;
        data: any;
        stack?: undefined;
        label?: undefined;
        emphasis?: undefined;
    })[];
};
export declare const getFundsChartOption: (xAxisData: any, yAxisData: any) => {
    color: string[];
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    grid: {
        right: number;
        x2: number;
        y2: number;
        x: number;
        y: number;
    };
    toolbox: {
        feature: {
            saveAsImage: {
                show: boolean;
            };
        };
    };
    legend: {
        data: string[];
    };
    xAxis: {
        type: string;
        axisTick: {
            alignWithLabel: boolean;
        };
        data: any;
    }[];
    yAxis: ({
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
        axisLabel?: undefined;
    } | {
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
        axisLabel: {
            formatter: string;
        };
    })[];
    series: ({
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            color: string;
            position: string;
        };
        lineStyle?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        lineStyle: {
            width: number;
            type: string;
        };
        label?: undefined;
    })[];
};
export declare const getIndexChartOption: (xAxisData: any, yAxisData: any) => {
    color: string[];
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    grid: {
        right: number;
        x2: number;
        y2: number;
        x: number;
        y: number;
    };
    toolbox: {
        feature: {
            saveAsImage: {
                show: boolean;
            };
        };
    };
    legend: {
        data: string[];
    };
    xAxis: {
        type: string;
        axisTick: {
            alignWithLabel: boolean;
        };
        data: any;
    }[];
    yAxis: ({
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        min: (value: any) => number;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
        show?: undefined;
    } | {
        show: boolean;
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        min: (value: any) => number;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
    })[];
    series: ({
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            color: string;
            position: string;
        };
        lineStyle?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label?: undefined;
        lineStyle?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        lineStyle: {
            width: number;
            type: string;
        };
        label?: undefined;
    })[];
};
export declare const getMarketChartOption: (xAxisData: any, yAxisData: any) => {
    color: string[];
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    grid: {
        right: number;
        x2: number;
        y2: number;
        x: number;
        y: number;
    };
    toolbox: {
        feature: {
            saveAsImage: {
                show: boolean;
            };
        };
    };
    legend: {
        data: string[];
    };
    xAxis: {
        type: string;
        axisTick: {
            alignWithLabel: boolean;
        };
        data: any;
    }[];
    yAxis: ({
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
        axisLabel?: undefined;
    } | {
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
        axisLabel: {
            formatter: string;
        };
    })[];
    series: ({
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            color: string;
            position: string;
        };
        stack?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label?: undefined;
        stack?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            color: string;
            position: string;
        };
        stack: string;
    })[];
};
export declare const getShortTermChartOption: (xAxisData: any, yAxisData: any) => {
    color: string[];
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    grid: {
        x2: number;
        y2: number;
        x: number;
        y: number;
    };
    toolbox: {
        feature: {
            saveAsImage: {
                show: boolean;
            };
        };
    };
    legend: {
        data: string[];
    };
    xAxis: {
        type: string;
        axisTick: {
            alignWithLabel: boolean;
        };
        data: any;
    }[];
    yAxis: {
        type: string;
        name: string;
        position: string;
        alignTicks: boolean;
        axisLine: {
            show: boolean;
            lineStyle: {
                color: string;
            };
        };
    }[];
    series: ({
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            position: string;
            color: string;
            fontSize?: undefined;
        };
        lineStyle?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label?: undefined;
        lineStyle?: undefined;
    } | {
        name: string;
        type: string;
        yAxisIndex: number;
        data: any;
        label: {
            show: boolean;
            position: string;
            fontSize: number;
            color: string;
        };
        lineStyle: {
            width: number;
            type: string;
        };
    })[];
};
export declare const getSubFundsChartOption: (xAxisData: any, series: any, legendData: any) => {
    tooltip: {
        trigger: string;
        axisPointer: {
            type: string;
        };
    };
    color: string[];
    grid: {
        top: string;
        left: string;
        right: string;
        bottom: string;
        containLabel: boolean;
    };
    yAxis: {
        type: string;
    }[];
    xAxis: {
        type: string;
        axisTick: {
            show: boolean;
        };
        data: any;
    }[];
    series: any;
};
