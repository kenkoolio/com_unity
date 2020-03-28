
// <reference path="./p5.d.ts" />

// hack code to scoot the timeline down under the above dom element
var navbar = document.getElementById("navbar");
var body = navbar.parentNode;
var padding = navbar.offsetHeight;
body.style.paddingTop = String(padding) + "px";


var first = true; // draw once and then wait for mouse press.
var timelineHeight = 80;
var lineBorderPixels = 10;
var selectorUpper;
var selectorLower;
var gradient;
var dateLine;
var dragging = false; // true when mouse dragging in process.
var startX = 0; // to track mouse dragging
var selectLock = null; // when null, allows items to be selected and dragged. When item is in process of being dragged, gets set to pointer to item.

var visibleMinDate;
var zoomLevel = 1; // 1 = close enough to view individual days clearly, 2 = months view, 3 = years view, 4 = decades view
const zoom1SegmentWidth = 6;


function setup() {
    textFont('Georgia');
    //textFont('Consolas');

    cnv = createCanvas(windowWidth, timelineHeight);
    cnv.parent('timeline'); // dom element with ID = timeline

    // create gradient for fun
    gradient = createGraphics(windowWidth, timelineHeight);
    gradient.background(color('rgba(255, 255, 255, 0)')); // clear
    setXGradient(gradient, 0, 0, windowWidth / 9, timelineHeight, color('rgba(25, 25, 25, 1)'), color('rgba(25, 25, 25, 0)'));
    setXGradient(gradient, windowWidth - windowWidth / 9, 0, windowWidth / 9, timelineHeight, color('rgba(25, 25, 25, 0)'), color('rgba(25, 25, 25, 1)'));

    // create selectors
    const segmentBorderMiddle = Math.floor(windowWidth / 2 / zoom1SegmentWidth) * zoom1SegmentWidth + 1.5;
    let pu = segmentBorderMiddle - zoom1SegmentWidth;
    let pl = segmentBorderMiddle;
    selectorLower = new Selector(pu, 15, 0.5, 0.5);
    selectorUpper = new Selector(pl, timelineHeight - 15, timelineHeight - 0.5, timelineHeight - 0.5)

    // create the dateline
    let today = new Date();
    let daysVisible = width / 6;
    let minDate = addDays(today, -1 * daysVisible)
    //let mindate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    
    let maxDate = addDays(today, 2 * daysVisible)
    //let maxdate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    dateLine = new DateLine(minDate, maxDate);
}

function setXGradient(image, x, y, w, h, color1, color2, axis) { // borrowed from https://p5js.org/examples/color-linear-gradient.html
    image.noFill();
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
        let inter = map(i, x, x + w, 0, 1);
        let c = lerpColor(color1, color2, inter);
        image.stroke(c);
        image.line(i, y, i, y + h);
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

class Selector {
    constructor(x1, y1, y2, y3) {
        this.tipX = x1;
        this.tipY = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.snagged = false;

        this.clickDiameter = 15;
        this.lastStepDragged = false;
    }

    dragMod(draggingMouseX, draggingMouseY)
    {
        if (dragging == false || selectLock == null) {
            this.snagged = false;
        }

        if ((selectLock == null || selectLock == this) && (this.snagged == true || dist(this.tipX, this.tipY, draggingMouseX, draggingMouseY) < this.clickDiameter))
        {
            this.tipX = draggingMouseX - 0.5;
            this.snagged = true;

            selectLock = this;
            this.lastStepDragged = true;
        }
        else
        {
            if (this.lastStepDragged)
            {
                // perform snapping
                if (zoomLevel == 1)
                {
                    this.tipX = Math.floor(this.tipX / zoom1SegmentWidth) * zoom1SegmentWidth + 0.5;
                }

                // if on-top of another selector, snap to next line.

                this.lastStepDragged = false;
            }
        }            
    }

    show() {
        fill(color('black'));
        stroke(color('black'));
        triangle(this.tipX, this.tipY, this.tipX - 7.5, this.y2, this.tipX + 7.5, this.y3)
        line(this.tipX, 0, this.tipX, timelineHeight)
    }
}

class DateLine {
    constructor(dateLow, dateHigh) // format expected: '2020-3-28'
    {
        this.x = -width;
        this.y = 0;
        this.dateLow = dateLow;
        this.dateHigh = dateHigh;
        this.lastStepDragged = false;
        
        this.recreate();
    }

    recreate(update = false) {
        // if this.x is not original, then we must have dragged, calculate new dates if forced to do so
        if (update)
        {
            if (zoomLevel == 1)
            {
                const daysChanged = (this.x + width)/zoom1SegmentWidth;
                this.dateLow = addDays(this.dateLow, -daysChanged);
                this.dateHigh = addDays(this.dateHigh, -daysChanged);
            }
            this.x = -width;
        }
        const cleanSegmentWidth = Math.floor(width / zoom1SegmentWidth) * zoom1SegmentWidth * 3;
        this.image = createGraphics(cleanSegmentWidth, timelineHeight);

        let dl = this.image;
        let currDate = new Date(this.dateLow);
        let currPixel = 0.5; // if stroke weight is odd, you must offset by half pixel to fill pixel.
        dl.stroke(0);
        dl.fill(0);
        dl.strokeWeight(1);
        dl.textFont('Verdana');
        let month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        if (zoomLevel == 1) { // days view
            //const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
            // one day per zoom1SegmentWidth pixels
            for(; currPixel < dl.width; currPixel += zoom1SegmentWidth) 
            {
                
                // if day 0 of year, add year tag and long tick
                if (currDate.getMonth() == 0 && currDate.getDate() == 1)
                {
                    const year = String(currDate.getFullYear());
                    dl.strokeWeight(0);
                    dl.textSize(16);
                    dl.text(year, currPixel + 3, 15)
                    dl.strokeWeight(1);
                    dl.line(currPixel, timelineHeight - lineBorderPixels * 4, currPixel, timelineHeight - lineBorderPixels);
                }
                // if day 0 of month, add month tag and medium tick and month name
                dl.textSize(12);
                if (currDate.getDate() == 1)
                {
                    //const month = currDate.toLocaleString('default', { month: 'long' });
                    //const month = formatter.format(currDate);
                    const month = month_names[currDate.getMonth()];
                    dl.strokeWeight(0);
                    dl.text(month, currPixel + 3, timelineHeight - lineBorderPixels * 4 + 1)
                    dl.strokeWeight(1);
                    dl.line(currPixel, timelineHeight - lineBorderPixels * 3, currPixel, timelineHeight - lineBorderPixels);
                }
                // else add short tick
                else{
                    dl.line(currPixel, timelineHeight - lineBorderPixels * 2, currPixel, timelineHeight - lineBorderPixels);
                }
                // console.log(currDate.getMonth());
                // console.log(currDate.getDate());
                // console.log(currDate);
                currDate = addDays(currDate, 1);
            }
        }
    }

    show(draggingMouseX) {
        if (dragging && (selectLock == null || selectLock == this)) {
            selectLock = this;

            this.x = this.x + draggingMouseX - startX;
            startX = draggingMouseX;

            this.lastStepDragged = true;
        }
        else
            this.lastStepDragged = false;
        
        image(this.image, this.x, this.y);
    }
}

function drawDateLine(draggingMouseX) {

    // draw the dates & ticks
    dateLine.show(draggingMouseX);

    // draw a line
    stroke(200);
    strokeWeight(2);
    //line(0, lineBorderPixels, windowWidth, lineBorderPixels); // upper line
    line(0, timelineHeight - lineBorderPixels, windowWidth, timelineHeight - lineBorderPixels); // lower line
    strokeWeight(1);

    // put marks where there are entries from the database
    drawEntries();
}

function drawEntries() {
    // grab list of entry dates in specified range from database

    // draw lines for each entry on timeline.
}

//////////////////// mouse event handling
// when mouse is pressed, set dragging if within canvas
function mousePressed(targetX, targetY, scanDiameter) {
    if (mouseX >= 0 && mouseY >= 0 && mouseX <= windowWidth && mouseY <= timelineHeight) {
        dragging = true;
        startX = mouseX;
    }
}
// when mouse is released, clear all selection locks and inform loop that no longer dragging.
function mouseReleased(){
    dragging = false;
    // if snapping to an element during drag, perform snapping to location here

    selectLock = null;
}
// same as mousePressed
function touchStarted()
{
    mousePressed();
}
// same as mouseReleased
function touchEnded()
{
    mouseReleased();
}
//////////////////// end of mouse event handling

// main drawing loop. Canvas is blanked between draws and redrawn.
function draw() {
    let mx, my = -99; // last mouse position while dragging, set here to bogus value.
    if(dragging) {
        mx = mouseX;
        my = mouseY;
    }

    if (dragging || first || dateLine.lastStepDragged || selectorLower.lastStepDragged || selectorUpper.lastStepDragged) { // prevent unnecessary redraws.
        first = false;
        stroke(0);
        fill(0);
        background(240);

        // mod selectors if dragging or we need to snap to a tic after a drag. This will also lock the dragger if selected.
        selectorLower.dragMod(mx, my);
        selectorUpper.dragMod(mx, my);
        
        if (!dragging && dateLine.lastStepDragged)
        {
            dateLine.recreate(true);
        }
        drawDateLine(mx);

        // draw selectors
        selectorLower.show();
        selectorUpper.show();
        // shade region between selectors
        fill('rgba(0,0,0, 0.1)');
        stroke('rgba(0,0,0, 0.1)');
        rect(selectorUpper.tipX, selectorUpper.tipY, selectorLower.tipX - selectorUpper.tipX, selectorLower.tipY - selectorUpper.tipY);

        // shade with gradient to make it seem like a round dial
        image(gradient, 0, 0);
    }
}