
// <reference path="./p5.d.ts" />

// hack code to scoot the timeline down under the above dom element
// var navbar = document.getElementById("navbar");
// var body = navbar.parentNode;
// var padding = navbar.offsetHeight;
// body.style.paddingTop = String(padding) + "px";


var first = true; // draw once and then wait for mouse press.
var timelineHeight = 80;
var selectorUpper;
var selectorLower;
var dragging = false; // true when mouse dragging in process.
var selectLock = null; // when null, allows items to be selected and dragged. When item is in process of being dragged, gets set to pointer to item.

var visibleMinDate;
var zoomLevel = 2; // 1 = close enough to view individual days clearly, 2 = close enough to see months clearly, 3 = years view, 4 = decades view

function setup() {

    textFont('Georgia');

    cnv = createCanvas(windowWidth, timelineHeight);
    cnv.parent('timeline'); // dom element with ID = timeline

    // create selectors
    let pu = windowWidth/2;
    let pl = windowWidth/2;
    selectorLower = new Selector(pu, 15, 0.5, 0.5);
    selectorUpper = new Selector(pl, timelineHeight - 15, timelineHeight - 0.5, timelineHeight - 0.5)

}

class Selector {
    constructor(x1, y1, y2, y3) {
        this.tipX = x1;
        this.tipY = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.snagged = false;

        this.clickDiameter = 15;
    }

    show(draggingX, draggingY) {
        if (dragging == false || selectLock == null) {
            this.snagged = false;
        }

        if ((selectLock == null || selectLock == this) && (this.snagged == true || dist(this.tipX, this.tipY, draggingX, draggingY) < this.clickDiameter))
        {
            this.tipX = draggingX;
            this.snagged = true;

            selectLock = this;
        }

        fill(color('black'));
        stroke(color('black'));
        triangle(this.tipX, this.tipY, this.tipX - 7.5, this.y2, this.tipX + 7.5, this.y3)
        line(this.tipX, 0, this.tipX, timelineHeight)
    }
}

function drawDateLine() {
    stroke(200);
    strokeWeight(2);
    line(0, 10, windowWidth, 10);
    line(0, timelineHeight - 10.5, windowWidth, timelineHeight - 10.5);
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
    if (mouseX >= 0 && mouseY >= 0 && mouseX <= windowWidth && mouseY <= timelineHeight)
        dragging = true;
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

    if (dragging || first) { // prevent unnecessary redraws.
        first = false;
        stroke(0);
        fill(0);
        background(240);
        
        drawDateLine();

        // draw selectors
        selectorLower.show(mx, my);
        selectorUpper.show(mx, my);
        // shade region between selectors
        fill('rgba(0,0,0, 0.1)');
        stroke('rgba(0,0,0, 0.1)');
        rect(selectorUpper.tipX, selectorUpper.tipY, selectorLower.tipX - selectorUpper.tipX, selectorLower.tipY - selectorUpper.tipY);
    }
}