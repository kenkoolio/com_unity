
// <reference path="./p5.d.ts" />

// hack code to scoot the timeline down under the above dom element
// var navbar = document.getElementById("navbar");
// var body = navbar.parentNode;
// var padding = navbar.offsetHeight;
// body.style.paddingTop = String(padding) + "px";


var first = true; // draw once and then wait for mouse press.
var timelineHeight = 80;
var lineBorderPixels = 10;
var selectorUpper;
var selectorLower;
var selectors = [];
var gradient;
var dateLine;
var dragging = false; // true when mouse dragging in process.
var startX = 0; // to track mouse dragging
var selectLock = null; // when null, allows items to be selected and dragged. When item is in process of being dragged, gets set to pointer to item.

var visibleMinDate;
var zoomLevel = 1; // 1 = close enough to view individual days clearly, 2 = months view, 3 = years view, 4 = decades view
const zoom1SegmentWidth = 6;

var month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function setup() {
    textFont('Georgia');
    //textFont('Consolas');

    cnv = createCanvas(windowWidth, timelineHeight);
    cnv.parent('timeline'); // dom element with ID = timeline
    cnv.position(0, 50, 'fixed');
    // create gradient for fun
    gradient = createGraphics(width, timelineHeight);
    gradient.background(color('rgba(255, 255, 255, 0)')); // clear
    setXGradient(gradient, 0, 0, width / 9, timelineHeight, color('rgba(25, 25, 25, 1)'), color('rgba(25, 25, 25, 0)'));
    setXGradient(gradient, width - width / 9, 0, width / 9, timelineHeight, color('rgba(25, 25, 25, 0)'), color('rgba(25, 25, 25, 1)'));

    // create selectors
    const segmentBorderMiddle = Math.floor(width / 2 / zoom1SegmentWidth) * zoom1SegmentWidth;
    let pu = segmentBorderMiddle + zoom1SegmentWidth;
    let pl = segmentBorderMiddle - zoom1SegmentWidth;
    selectorLower = new Selector(pu, 15, 0.5, 0.5);
    selectorUpper = new Selector(pl, timelineHeight - 15, timelineHeight - 0.5, timelineHeight - 0.5)
    selectors.push(selectorLower);
    selectors.push(selectorUpper);


    // create the dateline
    let today = new Date();
    let daysVisible = width / 6;
    let daysLeftOfToday = Math.floor(daysVisible / 2);
    let daysRightOfToday = Math.ceil(daysVisible / 2);
    let minDate = addDays(today, -1 * (daysVisible + daysLeftOfToday));
    let maxDate = addDays(today, daysVisible + daysRightOfToday);
    dateLine = new DateLine(minDate, maxDate);

    // additional hack in case selectors land in the wrong place
    let lowerSelectedDate = selectorLower.getDate();
    if (lowerSelectedDate.toISOString() != today.toISOString()) {
        selectorLower.tipX += zoom1SegmentWidth;
        selectorUpper.tipX += zoom1SegmentWidth;
    }
}

// returns an array with a from date and a to date.
function selectedDates() {
    let dArr = [];
    let lDate = selectorLower.getDate();
    let hDate = selectorUpper.getDate();
    if (hDate < lDate) {
        let temp = lDate;
        lDate = hDate;
        hDate = temp;
    }
    dArr.push(lDate); // to return Date objects
    dArr.push(hDate);
    dArr.push(lDate.toISOString().substring(0, 10)); // to return string of format '2020-3-28'
    dArr.push(hDate.toISOString().substring(0, 10));

    return dArr;
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
        this.lastStepDragged = true;
    }

    dragMod(draggingMouseX, draggingMouseY)
    {
        if (dragging == false || selectLock == null) {
            this.snagged = false;
        }

        if ((selectLock == null || selectLock == this) && (this.snagged == true || dist(this.tipX, this.tipY, draggingMouseX, draggingMouseY) < this.clickDiameter))
        {
            if (draggingMouseX >= 8 && draggingMouseX <= (width - 8)) // don't allow selector off-screen
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
                    this.tipX = Math.round(this.tipX / zoom1SegmentWidth) * zoom1SegmentWidth + 0.5;

                    // if on-top of another selector, snap to next line.
                    for (let s of selectors)
                    {
                        if (s !== this)
                        {
                            if (s.tipX === this.tipX)
                            {
                                this.tipX += zoom1SegmentWidth;
                            }
                        }
                    }
                }

                // for debug, print current date
                // let dateString = this.getDate().toISOString().substring(0, 10);
                // text(dateString, this.tipX + 1, this.tipY);

                this.lastStepDragged = false;

                // refresh shown messages;
                refreshMessages();
            }
        }
    }

    show() {
        fill(color('black'));
        stroke(color('black'));
        triangle(this.tipX, this.tipY, this.tipX - 7.5, this.y2, this.tipX + 7.5, this.y3)
        line(this.tipX, 0, this.tipX, timelineHeight)
    }

    getDate() {
        let segmentRelative = 0;
        if (zoomLevel == 1)
        {
            segmentRelative = Math.ceil(this.tipX / zoom1SegmentWidth);
        }
        //console.log(segmentRelative);
        let thisDate = dateLine.getDate(segmentRelative);
        return thisDate;
    }
}

class DateLine {
    constructor(dateLow, dateHigh) // format expected: '2020-3-28'
    {
        this.dateLow = dateLow;
        this.dateHigh = dateHigh;
        this.lastStepDragged = false;

        // some of this code repeated in recreate function
        this.cleanSegments = Math.floor(width / zoom1SegmentWidth);
        this.cleanSegmentWidth = this.cleanSegments * zoom1SegmentWidth;
        this.x = -this.cleanSegmentWidth;
        this.y = 0;

        this.cleanSegments = Math.floor(width / zoom1SegmentWidth);
        this.cleanSegmentWidth = this.cleanSegments * zoom1SegmentWidth;

        this.recreate();
    }

    getDate(relativeSegment = 0) {
        if (relativeSegment !== 0)
            relativeSegment += this.cleanSegments - 1;
        let relativeDate = addDays(this.dateLow, relativeSegment);
        return relativeDate;
    }

    recreate(update = false) {
        // if this.x is not original, then we must have dragged, calculate new dates if forced to do so
        if (update)
        {
            if (zoomLevel == 1)
            {
                const daysChanged = (this.x + this.cleanSegmentWidth)/zoom1SegmentWidth;
                this.dateLow = addDays(this.dateLow, -daysChanged);
                this.dateHigh = addDays(this.dateHigh, -daysChanged);
            }
            this.x = -this.cleanSegmentWidth;
        }

        // create blank canvas to hold refreshed image
        // this.newImage = createGraphics(this.cleanSegmentWidth * 3, timelineHeight);
        //let dl = this.newImage;
        this.image = createGraphics(this.cleanSegmentWidth * 3, timelineHeight);
        let dl = this.image;
        dl.stroke(0);
        dl.fill(0);
        dl.strokeWeight(1);
        dl.textFont('Verdana');

        // if this is the first refresh, image needs to be shown before the update
        // if (this.image === undefined)
        //     this.image = this.newImage;
        
        // set the lowest date retreived from the database so we know where to start iterating.
        let currDate = new Date(this.dateLow);

        // get counts of all entries in range from server
        //Open the POST request
        let req = new XMLHttpRequest();
        let sdatelow = this.dateLow.toISOString().substring(0, 10);
        let sdatehigh = this.dateHigh.toISOString().substring(0, 10);
        let route = "/date-count?start='" + sdatelow + "'&end='" + sdatehigh + "'";
        //console.log(route);
        req.open("GET", route, true);
        req.onreadystatechange = function()
            {
            if (req.readyState == 4 && req.status == 200)
            {
                // get messages from database
                let messages = JSON.parse(req.responseText);
                let messageMap = {};
                let maxMessage = 5;
                let currPixel = 0.5; // if stroke weight is odd, you must offset by half pixel to fill pixel.

                for (let m of messages) {
                    messageMap[m[0]] = m[1];
                    if (m[1] > maxMessage)
                        maxMessage = m[1];
                }

                if (zoomLevel == 1) { // days view
                    //const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                    // one day per zoom1SegmentWidth pixels
                    for(; currPixel < dl.width; currPixel += zoom1SegmentWidth)
                    {
                        let curDateString = currDate.toISOString().substring(0, 10);
                        // add indicators for days with messages
                        if (messageMap[curDateString])
                        {
                            //colorMode(HSL, 255);
                            dl.colorMode(HSL, 255);
                            let dayHue = map(messageMap[curDateString], 1, maxMessage, 80, 0); // 180 to start at light blue, 120 to start at green
                            //let dayLum = map(messageMap[curDateString], 1, maxMessage, 180, 255);
                            let dayLum = map(messageMap[curDateString], 1, maxMessage, 0, 180);
                            //console.log(dayHue);
                            let dayColor = dl.color(0, dayLum, 150);
                            dl.stroke(dayColor);
                            dl.strokeWeight(1);
                            dl.fill(dayColor)
                            dl.rect(currPixel+0.5, lineBorderPixels, 5, timelineHeight - 2 * lineBorderPixels);
                            dl.stroke(0);
                            dl.fill(0);
                            dl.strokeWeight(1);
                            //colorMode(RGB, 255);
                            dl.colorMode(RGB, 255);
                        }

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

                this.image = dl; // here if we ever switch to using a separate refresh canvas.
                first = true;
            }
            // else
            // {
            //     console.log("Error getting entries for timeline.")
            // }
            };
        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        //req.setRequestHeader("Content-Type", "application/json");
        req.responseType = ''; // treat as text
        req.send();
    }

    show(draggingMouseX) {
        if (dragging && (selectLock == null || selectLock == this)) {
            selectLock = this;

            this.x = this.x + draggingMouseX - startX;
            startX = draggingMouseX;

            this.lastStepDragged = true;
        }
        else {
            this.lastStepDragged = false;
            // refresh shown messages;
            refreshMessages();
        }

        image(this.image, this.x, this.y);
    }
}

function drawDateLine(draggingMouseX) {

    // draw the dates & ticks
    dateLine.show(draggingMouseX);

    // draw a line
    stroke(200);
    strokeWeight(2);
    //line(0, lineBorderPixels, width, lineBorderPixels); // upper line
    line(0, timelineHeight - lineBorderPixels, width, timelineHeight - lineBorderPixels); // lower line
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
    if (mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= timelineHeight) {
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

//Helper function to add cells of the passed type to table
function appendCellOfType(parent, type, label) {
    let cell = document.createElement(type);
    if (label != null)
        cell.innerText = label;
    parent.appendChild(cell);

    return cell; // in case it needs to be referenced.
}

function firePlayer(entryName) {
    $('#saved_audio').attr("src", "static/" + entryName);
}

function refreshMessages () {
    let tableContainer = document.getElementById("dynoTable");

    // remove old table
    if (tableContainer.hasChildNodes())
        tableContainer.removeChild(tableContainer.firstElementChild);
    
    // create new table
    let table = appendCellOfType(tableContainer, "table");
    table.classList.add("text_message");
    let tbody = appendCellOfType(table, "tbody");

    // grab selected dates
    let dates = selectedDates();
    let lowDate = dates[2];
    let highDate = dates[3];

    // create an array of all rows's bubbles so we can decolorize them upon selection
    let allBubbles = [];

    // grab messages and populate table
    let req = new XMLHttpRequest();
    let route = "/messages-in-range?start='" + lowDate + "'&end='" + highDate + "'";
    console.log(lowDate, highDate);
    req.open("GET", route, true);
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        let messages = JSON.parse(req.responseText);

        for (let entry of messages) {
            console.log(entry);
            let emojinum = entry[3];
            let emojistring =  String.fromCodePoint(emojinum); // convert to hex string
            let datetime = entry[1];
            let name = (entry[4])? entry[4] : "Anonymous";
            let age = entry[5];
            let location = entry[6];
            let messageID = entry[0];
    
            let bubbleText =
                name + "\n" +
                datetime + "\n";
            if (age != null) {
                 bubbleText += "age " + age + "\n";
            }
            if (location != null) {
                bubbleText += location;
            }
    
            let row = appendCellOfType(tbody, "tr");

            // attache message ID and hide from view.
            let hiddenMessageID = appendCellOfType(row, "td", messageID);
            hiddenMessageID.style = "display:none;";

            let emoji = appendCellOfType(row, "td", emojistring); // replace 1 with emoji
            emoji.classList.add("mood");
    
            // add emoji, message element [3]
    
            let bubble = appendCellOfType(row, "td");
            let bubbleTextArea = appendCellOfType(bubble, "p", bubbleText);
            bubbleTextArea.classList.add("from-them");
            let bubbleButtonContainer = appendCellOfType(row, "td");
            let bubbleButton = appendCellOfType(bubbleButtonContainer, "button", "Listen");
            bubbleButton.classList.add("btn");
            bubbleButton.classList.add("btn-primary");
            bubbleButton.classList.add("btn-sm");

            allBubbles.push(bubbleTextArea);
            row.addEventListener("click", () => {
                for (let bubble of allBubbles)
                {
                    bubble.style.backgroundColor = "#E5E5EA";
                    bubble.style.color = "black";
                    // bubble.classList.remove("from-me");
                    // bubble.classList.add("from-them");
                }
                
                bubbleTextArea.style.backgroundColor = "#0B93F6";
                bubbleTextArea.style.color = "white";
                //bubbleTextArea.classList.add("from-me");
                firePlayer(entry[2]);
            }, false);
    
            // missing modal thing from justin's code
        }
      }
    }
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    req.responseType = ''; // treat as text
    req.send();
}