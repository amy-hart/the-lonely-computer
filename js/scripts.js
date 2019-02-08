console.log("JS LOADED");

// Authenticate with api and define variables
var accessToken = "b9852c6b3a48456293da37d0741f75be",
baseUrl = "https://api.api.ai/v1/",
$speechInput,
$recordButton,
recognition,
messageRecording = "Recording...",
messageCouldntHear = "I couldn't hear you, could you say that again?",
messageInternalError = "Oh no, there has been an internal server error",
messageSorry = "I'm sorry, I don't have the answer to that yet.";

// Ask the browser to return a list of voices that it supports - See line 187
voices = window.speechSynthesis.getVoices();

$(document).ready(function() {

	// Define the form field which is used for text input or converted speech
	// This is the box tha users will type their questions into
	$speechInput = $("#speech-input");
	
	// Define the record button	
	$recordButton = $("#record-button");

	// If the user presses the enter key run the 'send' function to send their message to api.ai
	$speechInput.keypress(function(event) {
		// 13 is the ASCII code for carriage return or something, it means the enter key has been pressed
		if (event.which == 13) {
			mooodSwings();
    		event.preventDefault();
    		send();
    	}
  	});

  	// Listen for clicks on the record button 
	$recordButton.on("click", function(event) {
		switchRecognition();
	});

	// Show or hide JSON response for debugging
	$(".debug_button").on("click", function() {
		$(this).next().toggleClass("active");
		return false;
	});

	// Calculate CSS margin for edgar_inner - Vertically center Edgar according to window size
	// Note to self - Try and write this using less lines of code if there's time 
	function verticallyAlignEdgar() {
		var outerHeight = $("#edgar_outer").height();
		var innerHeight = $("#edgar_inner").height();
		var difference = (outerHeight - innerHeight);
		var edgarInnerMargin = (difference / 2);
		$(edgar_inner).css("margin-top", edgarInnerMargin);
		$(edgar_inner).css("margin-bottom", edgarInnerMargin);
	};	

	verticallyAlignEdgar();

	// Re-calculate the CSS margin if the window is resized
	window.onresize = function() {
    	verticallyAlignEdgar();
	};

}); // End $(document).ready

// Mood Swings

	function mooodSwings() {

		var speechValue = $speechInput.val().toLowerCase();
		$screen = $("#edgar_outer #screen");	

		if (/sad|upset|grumpy|miserable|unhappy|depressed/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("sad");
		} 	
		else if (/angry|cross|annoyed|displeased|irritated/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("angry");
		}
		else if (/happy|pleased|cheery|cheerful|cheer|jolly|delighted|content|joy/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("happy");
		} 	
		else if (/excited|enthusiastic|thrilled/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("excited");
		} 	
		else if (/sleepy|tired|bored|exhausted|worn out|fed up/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("tired");
		} 	
		else if (/love/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("love");
		} 
		else if (/human software|emergency hours|sustain hours|balance|request/.test(speechValue))
		{
		  $screen.removeClass();
		  $screen.addClass("human");
		} 
		else
		{
			$screen.removeClass();
		  	$screen.addClass("default");
		}
		console.log('function ran');

	};

// HTML5 Speech Recognition 

function startRecognition() {
	recognition = new webkitSpeechRecognition();
	recognition.continuous = false;
	recognition.interimResults = false;

	// Runs when recording from the user's microphone begins    
	recognition.onstart = function(event) {
		// Displays a message to the user, lets them know that Edgar is listening to them
		respond(messageRecording);
		// Add class 'now_recording' to the record button
		$recordButton.addClass("now_recording");
		// updateRec() switches the text on the record button from "Stop" to "Speak" 
		updateRec();
	};

	// Runs when we have received a valid result from the voice recognition
	// Passes the result to the speech input field via setInput() - This function adds the text to the input field and then runs the send() function
	recognition.onresult = function(event) {
		recognition.onend = null;

		var text = "";
		  for (var i = event.resultIndex; i < event.results.length; ++i) {
		    text += event.results[i][0].transcript;
		  }
		setInput(text);
		stopRecognition();
		mooodSwings();
		console.log('inside recognition.onresult');
		$recordButton.removeClass("now_recording");
	};

	// Runs when the voice recognition ends
	// Is set to null in recognition.onresult to prevent it running if we have recieved a successful result 
	// If recognition.onend runs we now know the voice recognition API has not understood the user's speech
	recognition.onend = function() {
		// Tells the user that we couldn't hear them if no response is received or if their speech couldn't be interpreted 
		respond(messageCouldntHear);
		stopRecognition();
		$recordButton.removeClass("now_recording");
	};
	// Sets the language to English
	recognition.lang = "en-GB";
	// Starts the voice recognition
	recognition.start();
}
  
// Stops our recognition and sets it to null
function stopRecognition() {
	if (recognition) {
		recognition.stop();
		recognition = null;
	}
	// Updates the record button to show that Edgar has stopped listening  
	updateRec();
}

// Toggles between recording and not recording
function switchRecognition() {
	if (recognition) {
		stopRecognition();
	} else {
		startRecognition();
	}
}

// Passes result received from speech recognition to our speech text input
function setInput(text) {
	$speechInput.val(text);
	send();
}

// Shows the correct message on our record button
function updateRec() {
	$recordButton.text(recognition ? "Stop" : "Speak");
}

// Sends question or message to api.ai 
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
		// Create a new speech message
		var msg = new SpeechSynthesisUtterance();
		// Ask the browser to return a list of supported voices
		voices = window.speechSynthesis.getVoices();
		// Set the language to English
		msg.lang = "en-GB";
		// We know that we're using Chrome and that Google's Male voice will be returned, filter through the list of supported voices until the Male voice is found.
		// Set voiceSelection to Google UK English Male
		// On the first loop voiceSelection gets set to undefined, it only works on the second go around - Asking the browser for voices ouside of this function fixes this - See line 13
		voiceSelection = voices.filter(function(voice) { return voice.name == 'Google UK English Male'; })[0];
		// Set the voice to the one defined by voiceSelection which is Google UK Male
		msg.voice = voiceSelection;
		// Let us see if the voiceSelection has been set to Google Male as desired
		console.log(voiceSelection.name);
		// Make pitch of voice higher for comedic effect
		msg.pitch = 1.5;
		msg.volume = 1;
		msg.text = val;
		window.speechSynthesis.speak(msg);
	}

	$("#spokenResponse").addClass("active").find(".spoken-response_text").html(val);
}

