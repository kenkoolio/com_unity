//need to add document load ready

//initialize button view sections
// let start_view = document.getElementById('rec_start_view').style.visibility; //start button
// let stop_view = document.getElementById('rec_stop_view').style.visibility; //stop button
$('#btnStart').click(function() {
   $('#rec_start_view').hide();
   $('#rec_stop_view').show();
});

$('#btnStop').click(function() {
   $('#rec_stop_view').hide();
   $('#rec_start_view').show();
});



//initialize button variables
let start = document.getElementById('btnStart'); //start button
let stop = document.getElementById('btnStop'); //stop button
let player = document.getElementById('save'); //audio player
let audio = document.querySelector('audio'); //hidden recording audio
let chunks = []; //store audio data in array or chunks

//RECORDING MODULE//
//limit to audio only
let constraint = {audio: true};

navigator.mediaDevices.getUserMedia(constraint)
.then(function(stream) {
    //connect the media stream to the first video element
    audio.srcObject = stream;
    let mediaRecorder = new MediaRecorder(stream);
        
    //start recording on clicking start button
    start.addEventListener('click', (ev)=>{
        mediaRecorder.start();
    })

    //stop recording on clicking stop button
    stop.addEventListener('click', (ev)=>{
        mediaRecorder.stop();
    });

    //storing stream data into chunks array
    mediaRecorder.ondataavailable = function(ev) {
        chunks.push(ev.data);
    }
    //send blob data to player audio
    mediaRecorder.onstop = (ev)=>{
        let blob = new Blob(chunks, { 'type' : 'audio/ogg;' });
        chunks = []; //clear chunk array to inital state
        player.src = window.URL.createObjectURL(blob);
    }

})
//Error Handling
.catch(function(err) { 
    console.log(err.name, err.message); 
});