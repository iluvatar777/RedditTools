"use strict"

const loadChart = function(fullname) {
	return $.ajax({
        url: "/api/postdata/" + fullname
    }).then(function(data) {

    	console.log('series data recieved');
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
		        },
		        responsive: false
		    }
		});
       console.log(data);
    });
};

$(document).ready(function() {

    $.ajax({
        url: "/api/posts/60"
   	}).then(function(data) {
    	console.log('series recieved');

    	data = $.parseJSON(data);
    	console.log(data);
		for (let i = 0; i < data.length; i++) {
			console.log(data[i]);
			$('#series').append($('<option>', {value: data[i].fullname, text: data[i].subreddit + ' ' + data[i].fullname + ' (' + data[i].count + ')'}));
		}
    });

   	loadChart('t3_65gs9n');

});