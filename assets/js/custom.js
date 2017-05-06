
(function($) {

	$(function() {

			// intro.
			var $intro = $('#intro');
			var $nav = $('#nav');

			if ($intro.length > 0) {

				// Links.
					var $intro_a = $intro.find('a');

					$intro_a
						.scrolly({
							speed: 1000,
							offset: function() { return $nav.height(); }
						})
			}
	
			function getMonthName(index){
				var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
				];
				return monthNames[index];
			}

			function apiCall(elementID, url){
				// lang = (typeof lang !== 'undefined') ?  lang : "en-US";				
				// $.ajaxSetup({
				// 	headers: { 'Accept-Language': lang }
				// });
				//http://stackoverflow.com/questions/3350778/modify-http-headers-for-a-jsonp-request
				//https://www.npmjs.com/package/linkedin-public-profile-parser

				$.ajax({
					url: url,
					type: "GET",
					contentType: "application/json",
					headers: {
						"Accept-Language":"en-US"
					},
					dataType: 'jsonp',
					success: function(jsonpData) {
						// var data = prepareData(elementID, jsonpData);
						// setTemplate(elementID, data);

                        switch(elementID){
                            case "linkedin":
                                return setLinkedinData(jsonpData);
                            case "instagram":
                                return setInstagramData(jsonpData);
                            case "github":
                                return setGithubData(jsonpData);
                            case "wordpress":
                                return setWordpressData(jsonpData);
                        }
					},
					error: function() {
						console.log('Failed!');
					},
				});
			}

			//API calls
			var linkedinApiUrl = "https://api.linkedin.com/v1/people/~:(headline,positions,summary)?oauth2_access_token=AQWcqp3LBEemPi2O6C78rO7ZL6As3qSdcV7X-gkjImM9giLTozo9Qbl5Ren9UfTQ7M4wg6VEELT3nXR7_U7-HwCR5kcaPzjI1t1qlNp1NqAGn8GVT5tNF_ZsNfDjFK7G1mX7jGt8OojwQgjFT3LhcnA5As5pNmXCZSDp_n2HJSceUj4QDgM&format=jsonp";
			var instagramApiUrl = "https://api.instagram.com/v1/users/self/media/recent/?access_token=190237791.1677ed0.38d4c12947954ef8a14f49be64f87079";
			var githubApiUrl = "https://api.github.com/user/repos?access_token=f826c3f45618e1a32a8bb9e6dadbdd24d40dbd33";
			var wordpressApiUrl = "https://public-api.wordpress.com/rest/v1.1/sites/gusdev.wordpress.com/posts/?fields=title,URL,date,excerpt";

			//apiCall(linkedinAPI);
			apiCall('linkedin', linkedinApiUrl);
			apiCall('instagram', instagramApiUrl);
			apiCall('github', githubApiUrl);
			apiCall('wordpress', wordpressApiUrl);

			// function prepareData(elementID, jsonpData){
			// 	switch(elementID){
			// 		case "instagram":
			// 			return getInstagramData(jsonpData);
			// 		case "github":
			// 			return getGithubData(jsonpData);
			// 	}
			// }

			function setInstagramData(jsonpData){
				$('#statistics #instagram-amount').html(jsonpData.data.length);
				
                var title, spanID, imgID;
                for(var i = 0; i < 12; i++){
                    spanID = "#pic" + (i+1);
                    imgID = spanID + " img";
                    //img src
                    $(imgID).attr("src", jsonpData.data[i].images.standard_resolution.url);
                    //img title & alt
                    if(jsonpData.data[i].caption){
                        title = jsonpData.data[i].caption.text;
                        $(imgID).attr("title",title);
                        $(imgID).attr("alt",title);
                    }
                    //img link
                    $(spanID).wrap('<a href="' + jsonpData.data[i].link + '" target="_blank"></a>')
                    //comments and likes
                    $(spanID + " .instagram-likes").append(jsonpData.data[i].likes.count);
                    $(spanID + " .instagram-comments").append(jsonpData.data[i].comments.count);
                }                
			}
			
			function setLinkedinData(jsonpData){
                $('#linkedin #summary').append('<div>' + jsonpData.summary + '</div>');
                $('#linkedin #current-position').append('<h4><strong>' + jsonpData.headline + '</strong> (' + jsonpData.positions.values[0].location.name + ') since ' 
					+ getMonthName(jsonpData.positions.values[0].startDate.month) + ' ' + jsonpData.positions.values[0].startDate.year + '</h3>');
                $('#linkedin #current-position').append('<div>' + jsonpData.positions.values[0].summary + '</div>');
            }

			function setGithubData(jsonpData){
				var repoID = '';
				var repos = jsonpData.data.sort(function(a, b){return b.updated_at > a.updated_at ? 1 : 0});

				$('#statistics #github-amount').html(repos.length);
				
				for(var i = 0; i < repos.length; i++){
					repoID = 'r' + i;
					$('#github-repos tbody').append('<tr id="' + repoID + '"></tr>');
					$('#' + repoID).append('<td><strong><a href="' + repos[i].html_url + '" target="_blank">' + repos[i].name + '</a></strong></td>');
					$('#' + repoID).append(
						(repos[i].description != null) ?
							'<td class="hide-small">' + repos[i].description + '</td>' :
							'<td class="hide-small">&nbsp;</td>'
					);
					$('#' + repoID).append(
						(repos[i].homepage != null) ?
							'<td><a href="' + repos[i].homepage + '" target="_blank">Link</a></td>' :
							'<td>&nbsp;</td>'
					)
					$('#' + repoID).append('<td class="hide-small">' + new Date(repos[i].created_at).toLocaleDateString() + '</td>');
					$('#' + repoID).append('<td class="hide-xsmall">' + new Date(repos[i].updated_at).toLocaleDateString() + '</td>');
					$('#' + repoID).append('<td class="hide-small">' + (repos[i].fork ? '&#10003;' : '&nbsp;') + '</td>');
				}
			}
			
			function setWordpressData(jsonpData){
				$('#statistics #wordpress-amount').html(jsonpData.found);
				var post;
				for(var i = 0; i < Math.max(5, jsonpData.found); i++){
					post = jsonpData.posts[i];
					$('#wordpress-posts').append('<h4>' + new Date(post.date).toLocaleDateString() + 
						' : <strong><a href="' + post.URL + '" target="_blank">' + post.title + '</a></strong></h4>');
					$('#wordpress-posts').append('<blockquote>' + post.excerpt + '</blockquote>');
				}
			}

			// function setTemplate(elementID, data){
			// 	var selector = '#' + elementID;
			// 	var template = $(selector).html();
			// 	Mustache.parse(template);   // optional, speeds up future uses
			// 	var rendered = Mustache.render(template, data);
			// 	$(selector).html(rendered);
			// }

			// //mustache: parse templates
			// var data = {
			// 	name: "Sumy"
			// }

			// setTemplate('intro', data);




			
			var instagramParsedData = {
				
			}
			
			// setTemplate('instagram', instagramParsedData);


// 			var myData;
			
			
// 			$.ajax({
// 				url: linkedinAPI,
// 				type: 'GET',
// 				contentType: "application/json",
// 				dataType: 'json',
// 				success: function(data) {
// 					console.log('Data: ' + data);
// 				},
// 				error: function() {
// 					console.log('Failed!');
// 				},
// 			});
// 						$.getJSON( linkedinAPI,{format: "jsonp"}, function() {
// 				console.log( "success" );
// 				})
// 				.done(function( json ) {
// 					console.log( "JSON Data: " + json );
// 				})
// 				.fail(function( jqxhr, textStatus, error ) {
// 					var err = textStatus + ", " + error;
// 					console.log( "Request Failed: " + err );
// 			});



//   $.getJSON( flickerAPI, {
//     tags: "mount rainier",
//     tagmode: "any",
//     format: "json"
//   })
//     .done(function( data ) {
//       $.each( data.items, function( i, item ) {
//         $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images" );
//         if ( i === 3 ) {
//           return false;
//         }
//       });
//     });



// $.ajax({
//   url: linkedinAPI,
//   type: 'GET',
//   contentType: "application/json",
//   dataType: 'jsonp',
//   success: function(data) {
//     console.log('Count: ' + data.count);
//   },
//   error: function() {
//     console.log('Failed!');
//   },
// });


	});

})(jQuery);