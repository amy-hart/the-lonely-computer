// Declairing variables

var accessToken = "b9852c6b3a48456293da37d0741f75be",
baseUrl = "https://api.api.ai/v1/",
$speechInput,
$recBtn,
recognition,
messageRecording = "Recording...",
messageCouldntHear = "I couldn't hear you, could you say that again?",
messageInternalError = "Oh no, there has been an internal server error",
messageSorry = "I'm sorry, I don't have the answer to that yet.";


voices = window.speechSynthesis.getVoices();

// JS bits

$(document).ready(function() {

	// Define text input used for speech/ question - Either by typing into the box, or by being populated with converted speech input
	$speechInput = $("#speech-input");
	
	// Define speech record button	
	$recBtn = $("#record-button");
	

	// If user presses the enter key run the send function
	$speechInput.keypress(function(event) {
		if (event.which == 13) {
    		event.preventDefault();
    		send();
    	}
  	});

  	// Listen for clicks on record button - If already recording pause recording
	$recBtn.on("click", function(event) {
		switchRecognition();
	});

	// Show or hide JSON response for debugging
	$(".debug__btn").on("click", function() {
		$(this).next().toggleClass("is-active");
		return false;
	});

	//CALCULATE PADDING FOR EDGAR_INNER

	function verticallyAlignEdgar() {
		var outerHeight = $("#edgar_outer").height();
		var innerHeight = $("#edgar_inner").height();
		var difference = (outerHeight - innerHeight);
		var edgarInnerMargin = (difference / 2);
		$(edgar_inner).css("margin-top", edgarInnerMargin);
		$(edgar_inner).css("margin-bottom", edgarInnerMargin);
	};	

	verticallyAlignEdgar();

	window.onresize = function() {
    	verticallyAlignEdgar();
	};

});

// HTML5 Speech Recognition stuffs

function startRecognition() {
	recognition = new webkitSpeechRecognition();
	recognition.continuous = false;
	recognition.interimResults = false;

	// Runs when recording from the user's microphone begins. We use a function called respond() to display our message that tells the user we are listening to them. We will cover the respond() function in more detail soon. updateRec() switches the text for our recording button from "Stop" to "Speak".    
	recognition.onstart = function(event) {
		respond(messageRecording);
		updateRec();
	};

	// Runs when we have a result from the voice recognition. We parse the result and set our text field to use that result via setInput() (this function just adds the text to the input field and then runs our send() function).
	recognition.onresult = function(event) {
		recognition.onend = null;

		var text = "";
		  for (var i = event.resultIndex; i < event.results.length; ++i) {
		    text += event.results[i][0].transcript;
		  }
		setInput(text);
		stopRecognition();
	};

	// Runs when the voice recognition ends. We set this to null in recognition.onresult to prevent it running if we have a successful result — this way, if recognition.onend runs, we know the voice recognition API has not understood the user. If the function does run, we respond to the user to tell them we did not hear them correctly.
	recognition.onend = function() {
		respond(messageCouldntHear);
		stopRecognition();
	};
	// Sets the language we are looking for
	recognition.lang = "en-GB";
	// Starts the voice recognition
	recognition.start();
}
  
// This stops our recognition and sets it to null. Then, it updates the button to show that we are not recording anymore.  
function stopRecognition() {
	if (recognition) {
		recognition.stop();
		recognition = null;
	}
	updateRec();
}

function switchRecognition() {
	if (recognition) {
		stopRecognition();
	} else {
		startRecognition();
	}
}

function setInput(text) {
	$speechInput.val(text);
	send();
}

function updateRec() {
	$recBtn.text(recognition ? "Stop" : "Speak");
}

function send() {
	var text = $speechInput.val();
	$.ajax({
	    type: "POST",
	    url: baseUrl + "query",
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    headers: {
	    	"Authorization": "Bearer " + accessToken
	    },
    	data: JSON.stringify({query: text, lang: "en", sessionId: "yaydevdiner"}),

	    success: function(data) {
	    	prepareResponse(data);
	    },
		error: function() {
			respond(messageInternalError);
		}
	});
}

function prepareResponse(val) {
	var debugJSON = JSON.stringify(val, undefined, 2),
    spokenResponse = val.result.speech;

	respond(spokenResponse);
	debugRespond(debugJSON);
}

function debugRespond(val) {
	$("#response").text(val);
}



	

function respond(val) {
	

	if (val == "") {
		val = messageSorry;
	}

	if (val !== messageRecording) {
		console.log("Entered IF");
		var msg = new SpeechSynthesisUtterance();
		voices = window.speechSynthesis.getVoices();
		msg.lang = "en-GB";
		voiceSelection = voices.filter(function(voice) { return voice.name == 'Google UK English Male'; })[0];
		

	
		msg.voice = voiceSelection;
		console.log(voiceSelection.name);
	


		msg.pitch = 1.5;
		msg.volume = 1;
		msg.text = val;
		window.speechSynthesis.speak(msg);
	}

	$("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(val);
}

