"use strict";
/*
    This applies specfically to the HTML canvas element with id = grid

    We create to sets of lines, major and minor, to draw,

    drawGrid()
        This gets the canvas element by id
        sets the line options:
            small gray lines are 10 px appart
            larger black lines are 100 px appart

    drawGridLines()
        does the drawing of the lines 

    The bottom of the file calls drawGrid()
    We only want this to draw once
*/


function drawGrid() {
    var cnv = document.getElementById("grid");
    var gridOptions = {
        minorLines: {
            separation: 10,
            color: '#DCDCDC'
        },
        majorLines: {
            separation: 100,
            color: '#000000'
        }
    };
    drawGridLines(cnv, gridOptions.minorLines);
    drawGridLines(cnv, gridOptions.majorLines);
    return;
}
function drawGridLines(cnv, lineOptions) {
    var iWidth = cnv.width;
    var iHeight = cnv.height;
    var ctx = cnv.getContext("2d");
    ctx.strokeStyle = lineOptions.color;
    ctx.beginPath();
    var iCount = null;
    var i = null;
    var x = null;
    var y = null;
    iCount = Math.floor(iWidth / lineOptions.separation);
    for (i = 0; i <= iCount; i++) {
        x = (i * lineOptions.separation);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, iHeight);
        ctx.stroke();
    }
    iCount = Math.floor(iHeight / lineOptions.separation);
    for (i = 0; i <= iCount; i++) {
        y = (i * lineOptions.separation);
        ctx.moveTo(0, y);
        ctx.lineTo(iWidth, y);
        ctx.stroke();
    }
    ctx.closePath();
    return;
}
drawGrid()