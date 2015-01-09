
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);

        if (id == 'deviceready') {
            app.drawChart();
        }
    },

    drawChart: function() {

        var chartEl = document.getElementById('chart');
        var resultsEl = document.getElementById('results');
        var frequency = 100; // ms
        var options = { frequency: frequency };
        var appData = [];
        var chartData = [];

        var watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, options);
        chartEl.addEventListener('click', function(e) {
            if (watchID) {
                navigator.accelerometer.clearWatch(watchID);
                watchID = null;
            } else {
                watchID = navigator.accelerometer.watchAcceleration(accelerometerSuccess, accelerometerError, options);
            }
        });

        var chart = new Sparkline(chartEl, {width: 300, minValue: -5, maxValue: 25});

        function accelerometerError() {
            console.log('Failed to load accelerometer');
            resultsEl.innerHTML = 'Failed to load accelerometer';
        }

        function avgVariance(data) {
            var v10, v60, vAll, i, variance;
            v10 = v60 = vAll = i = 0;

            if (data.length < 2) {
                return {'v10': 0, 'v60': 0, 'vAll': 0};
            }

            for (i = 0; i < data.length - 1; i++) {
                variance = Math.abs(data[i] - data[i + 1]);
                if (i > data.length - 100) {
                    v10 += variance;
                }
                if (i > data.length - 600) {
                    v60 += variance;
                }
                vAll += variance;
            }
            return {
                'v10': v10 / Math.min(data.length - 1, 100),
                'v60': v60 / Math.min(data.length - 1, 600),
                'vAll': vAll / data.length - 1
            };
        }

        function accelerometerSuccess(acceleration) {
            var str = 'Acceleration X: ' + Math.round(acceleration.x * 100) / 100 + ', ' +
                      'Y: ' + Math.round(acceleration.y * 100) / 100 + ', ' +
                      'Z: ' + Math.round(acceleration.z * 100) / 100 + '<br />';

            var x = acceleration.x;
            var y = acceleration.y;
            var z = acceleration.z;
            var gForce = Math.sqrt( (x*x) + (y*y) + (z*z) );

            appData.push(gForce);
            chartData.push(gForce);

            var variance = avgVariance(appData);

            str += '10-sec: ' + Math.round(variance.v10 * 100) / 100 + ', ' +
                   '60-sec: ' + Math.round(variance.v60 * 100) / 100 + ', ' +
                   'Total variance: ' + Math.round(variance.vAll * 100) / 100 + '<br />';

            resultsEl.innerHTML = str;

            if (chartData.length > 50) {
                chartData.shift();
            }
            chart.draw(chartData);
        }
    }
};
