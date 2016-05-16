// Sanitizer function to protect the data to be inserted in the HTML 
function escapeText(t){
	return document.createTextNode(t).textContent;
}


// Parser function to process the JSON document retrieved by AJAX
function myMovieParser(data){
	
	// Create the results box
	var myHTML = "<div class='row'>";
	myHTML += "<div class='col s12'>";
	myHTML += "<div class='card indigo accent-2'>";
	myHTML += "<div class='card-content white-text'>";
	myHTML += "<span class='card-title'><b><center>RESULTS</center></b></span>";	
	
	// For each movie retrieved, we parse the information and we create a card inside the box to display it
	for(i = 0; i<data.movies.length; i++){

		// Selecting the information wanted
		var title = escapeText(data.movies[i].title);
		var year = escapeText(data.movies[i].year);
		var synopsis = escapeText(data.movies[i].synopsis);
		
		// Inserting new row in the corresponding collection for each result of the feed displaying the previous information	
		myHTML += "<ul class='collection' id='movie" + i + "'>";
		myHTML += "<li class='collection-item indigo-text text-accent-2'><b>" + title + "</b>"+ " (" + year + ")";
		if (synopsis != ""){
			myHTML += "<br>" + synopsis;
		}
		myHTML += "</li>";	
		myHTML += "</ul>";	
		
		// Issuing a call to search a book matching the current retrieved movie
		search_book(title, i);
	}
	
	myHTML += "</div>";
	myHTML += "</div>";
	myHTML += "</div>";
	myHTML += "</div>";
	$("#search_results").html(myHTML);	
}


// Error function for AJAX calls
function myBadLoadFunction(XMLHttpRequest,errorMessage,errorThrown) {
	alert("Load failed: " + errorMessage + " : " + errorThrown);
}


// API_key = "9htuhtcb4ymusd73d4z6jxcj"; TRIAL ONE
var API_key = "7v9da42c8kst8wjgrrdn3d2k";


// Function to search a movie in the Rotten Tomatoes database
function search_movie(){
	var  search_param = document.getElementById("query").value;
	
	var URI_param = encodeURI(search_param);
	
	// AJAX call for the Rotten Tomatoes feed, in JSON
	$.ajax({
		url: "//students.ics.uci.edu/~garciad7/myProxy.php?http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=" + URI_param + "&page_limit=10&page=1&apikey=" + API_key,
		dataType: "json",
		success: myMovieParser,
		error: myBadLoadFunction,
	});
}


// Function to search a book in the Google Books database and include the results with the corresponding movie
function search_book(title, num){

	/*var title_length = title.length;
	var title_length_min = Math.ceil(title_length * 0.8);
	var title_comp = title.substr(0, title_length_min);*/

	var URI_param = encodeURI(title);
	
	// AJAX call for the Google Books feed, in JSON
	$.ajax({
		url: "https://www.googleapis.com/books/v1/volumes?q=" + URI_param + "&maxResults=40",
		dataType: "json",
		success: function(data){
		
			// Look for books matching the movie
			var match_index = -1;
			for(i=0; data.totalItems > 0 && i<data.items.length && match_index==-1; i++){
				var book_title = data.items[i].volumeInfo.title;
				if(title.indexOf(book_title)>=0){
					match_index = i;
				}
			}
			
			// Including the book information in the correct movie result tab, if any matches found
			var myBookHTML = "";
			if(match_index >= 0){
				myBookHTML += "<li class='collection-item indigo-text text-accent-2'>This movie could be based (or has a connection with) this book: " + "<b>" + data.items[match_index].volumeInfo.title + "</b>" + " (" + data.items[match_index].volumeInfo.publishedDate + ") by "; 
				for(j=0; data.items[match_index].volumeInfo.authors.length!= undefined && j<data.items[match_index].volumeInfo.authors.length; j++){
					myBookHTML+= data.items[match_index].volumeInfo.authors[j];
					if(j != data.items[match_index].volumeInfo.authors.length - 1){
						myBookHTML += ", ";
					}
				}
				myBookHTML += "</li>";
			} else {
				myBookHTML += "<li class='collection-item indigo-text text-accent-2'>There are no books related to this movie!</li>";
			}

			$("#movie" + num).append(myBookHTML);	
		},
		error: myBadLoadFunction,
	});
}