let recd_button = document.getElementById("record_button");
let rec_symbol = document.getElementById("record_symbol");


//record button toggle on and off
$( "#record_button" ).click(function() {
	if($( "#record_button" ).hasClass("btn btn-danger")){
		$( "#record_button" ).removeClass("btn btn-danger");
		$( "#record_button" ).addClass("btn btn-info");
		$( "#record_symbol" ).removeClass("glyphicon glyphicon-record");
		$( "#record_symbol" ).addClass("glyphicon glyphicon-stop");
	}else{
		$( "#record_button" ).removeClass("btn btn-info");
		$( "#record_button" ).addClass("btn btn-danger");
		$( "#record_symbol" ).removeClass("glyphicon glyphicon-stop");		
		$( "#record_symbol" ).addClass("glyphicon glyphicon-record");
	}	
});