window.onload = function() {
	'use strict';

	var supportingPointColor = 'blue';
	var supportingPointRadius = 3;
	var centerColor = 'red';
	var centerRadius = 3;
	var pointColor = 'green';
	var pointRadius = 3;
	var lineColor = 'yellow';
	var textColor = 'yellow';
	var pixelsInCM = 28.346;

	var file = document.getElementById('file'); // the input element of type file
	var resetButton = document.getElementById('reset'); // the input element of type file
	var resetCenterButton = document.getElementById('reset-center'); // the input element of type file
	var canvas = document.getElementById('main-canvas');
	var drawRadiuses = document.getElementById('draw-radiuses');
	var drawCircles = document.getElementById('draw-circles');
	var downloadLink = document.getElementById('download')
	var ctx = canvas.getContext('2d'); // load context of canvas

	var supportingPoints,
		center, 
		points;

	file.onchange = reset;
	resetButton.onclick = reset;
	resetCenterButton.onclick = resetCenter;
	drawRadiuses.onchange = redraw;
	drawCircles.onchange = redraw;

	downloadLink.onclick = function() {
	    this.href = canvas.toDataURL();
    	this.download = "edited-" + file.value.split(/(\\|\/)/g).pop();
	}

	canvas.onclick = function(event) {
		var rect = canvas.getBoundingClientRect();
		var point = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
		if (supportingPoints.length < 3) {
			supportingPoints.push(point);
			if (supportingPoints.length == 3) {
				center = getCenter(
					supportingPoints[0].x, supportingPoints[0].y,
					supportingPoints[1].x, supportingPoints[1].y,
					supportingPoints[2].x, supportingPoints[2].y
				);
			}
		} else {
			points.push(point);
		}
		redraw();
	}

	function resetCenter() {
		supportingPoints = [];
		center = null;
		redraw();
	}

	function reset() {
		supportingPoints = [];
		center = null;
		points = [];
		redraw();
	}

	function redraw() {
		var img = new Image();
		img.src = URL.createObjectURL(file.files[0]); // use first selected image from input element
		img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0); // draw the image to the canvas

			for (var i = 0; i < supportingPoints.length; i++) {
				ctx.beginPath();
				ctx.strokeStyle = supportingPointColor;
				ctx.arc(supportingPoints[i].x, supportingPoints[i].y, supportingPointRadius, 0, 2 * Math.PI);
				ctx.stroke();
			}

			if (center) {
				ctx.beginPath();
				ctx.strokeStyle = centerColor;
				ctx.fillStyle = centerColor;
				ctx.arc(center.x, center.y, centerRadius, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.fill();

				if (drawCircles.checked) {
					ctx.beginPath();
					ctx.strokeStyle = supportingPointColor;
					ctx.lineWidth = 0.5;
					ctx.arc(center.x, center.y, getDistance(center.x, center.y, supportingPoints[0].x, supportingPoints[0].y), 0, 2 * Math.PI);
					ctx.stroke();
				}
			}

			for (var i = 0; i < points.length; i++) {
				var x = points[i].x;
				var y = points[i].y;

				ctx.beginPath();
				ctx.strokeStyle = pointColor;
				ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
				ctx.stroke();
			}

			if (center) {
				for (var i = 0; i < points.length; i++) {
					var x = points[i].x;
					var y = points[i].y;

					if (drawRadiuses.checked) {
						ctx.beginPath();
						ctx.strokeStyle = lineColor;
						ctx.moveTo(center.x, center.y);
						ctx.lineTo(x, y);
						ctx.stroke();
					}

					if (drawCircles.checked) {
						ctx.beginPath();
						ctx.strokeStyle = pointColor;
						ctx.lineWidth = 0.5;
						ctx.arc(center.x, center.y, getDistance(center.x, center.y, x, y), 0, 2 * Math.PI);
						ctx.stroke();
					}

					ctx.font = "16px serif";
					ctx.textBaseline = "middle";
					ctx.fillStyle = textColor;
					ctx.fillText(
						(getDistance(x, y, center.x, center.y) / pixelsInCM).toFixed(3) + "cm", 
						x + Math.sign(x - center.x) * 10, 
						y + Math.sign(y - center.y) * 15
					);
				}
			}
		}
	}

	function getCenter(xa, ya, xb, yb, xc, yc) {
		var d = 2 * (xa * (yb - yc) + xb * (yc - ya) + xc * (ya - yb));
		var xo = - (
			ya * (xb * xb + yb * yb - xc * xc - yc * yc) +
			yb * (xc * xc + yc * yc - xa * xa - ya * ya) +
			yc * (xa * xa + ya * ya - xb * xb - yb * yb)
		) / d;
		var yo = (
			xa * (xb * xb + yb * yb - xc * xc - yc * yc) +
			xb * (xc * xc + yc * yc - xa * xa - ya * ya) +
			xc * (xa * xa + ya * ya - xb * xb - yb * yb)
		) / d;
		return {
			x: xo,
			y: yo
		}
	}

	function getDistance(x1, y1, x2, y2) {
		var dx = x1 - x2;
		var dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	}
}