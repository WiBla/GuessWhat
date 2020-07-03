const $canvas = $('#canvas');
const ctx = $canvas[0].getContext('2d');

width = 800;
height = 600;
window.hist = [];
window.mouse = {
	x: 0,
	y: 0,
	pressed: false,
	tool: "pencil",
};
window.brushSize = 10;

lib = {
  getColor: function(event) {
    let color = ctx.getImageData(mouse.x, mouse.y, -1, -1).data;
  	color = "#" + ("000000" + this.rgbToHex(color[0], color[1], color[2])).slice(-6);

  	$('#color')[0].value = color;
  },
  rgbToHex: function(r, g, b) {
  	return ((r << 16) | (g << 8) | b).toString(16);
  },
};

function redraw() {
  ctx.clearRect(0, 0, width, height);

  ctx.lineJoin = "round";

  hist.forEach((move, i, moves) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = move.color;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = move.brushSize;
    ctx.beginPath();

    if (['pencil', 'eraser'].indexOf(move.tool) > -1) {
      if (move.pressed && i)
        ctx.moveTo(moves[i-1].x, moves[i-1].y);
      else
        ctx.moveTo(move.x, move.y);
    }

    switch (move.tool) {
      case 'fill':
        ctx.fillRect(0, 0, width, height);
      break;

      case 'pencil':
        ctx.lineTo(move.x, move.y);
      break;

      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(move.x, move.y);
      break;
    }

    ctx.closePath();
    ctx.stroke();
  });
}

function useTool(tool) {
	if (tool === "clear") {
		ctx.clearRect(0, 0, width, height);
		hist = [];
		redraw();
	} else if (tool === "fill") {
		hist.push({ tool: 'fill', color: $('#color').val(), brushSize:0 });
		redraw();
	}
}

$('document').ready(() => {
	$canvas.attr('width', width);
	$canvas.attr('height', height);

	$('#brushSize').change((e) => {
		brushSize = $(e.target).val();
	});

	$canvas.mousedown((down) => {
		mouse.pressed = true;

		const x = down.offsetX;
		const y = down.offsetY;
		const tool = mouse.tool;
		const color = $('#color').val();

		hist.push({ x,y,pressed:false,tool,color,brushSize });

		redraw();
	});
	$canvas.mousemove((move) => {
		const x = move.offsetX;
		const y = move.offsetY;
		const tool = mouse.tool;
		const color = $('#color').val();
		mouse = { x,y,pressed: mouse.pressed, tool: mouse.tool };

		switch (tool) {
			case 'line':
			case 'rect-fill':
			case 'rect-stroke':
			case 'circle-fill':
			case 'circle-stroke':
				redraw();
			break;

			case 'color-picker':
				if (mouse.pressed) {
					lib.getColor(move);
				}
			break;

			default:
				if (mouse.pressed) {
					hist.push({ x,y,pressed:true,tool,color,brushSize });

					redraw();
				}
			break;
		}
	});
	$canvas.mouseup(() => mouse.pressed = false);
	$canvas.mouseleave(() => mouse.pressed = false);
});
