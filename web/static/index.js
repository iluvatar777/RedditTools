"use strict"

$(document).ready(function() {
    $.ajax({
        url: "/api/postdata/t3_6bm55g"
    }).then(function(data) {
    	const ctx = 'myChart';
    	var scatterChart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        datasets: $.parseJSON(data)
	    },
	    options: {
	        scales: {
	            xAxes: [{
	                type: 'linear',
	                position: 'bottom'
	            }]
	        }
	    }
	});



       consol.log(data);
    });
});