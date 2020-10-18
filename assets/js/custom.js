
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

			function dateToDMY(date) {
				var d = date.getDate();
				var m = date.getMonth() + 1;
				var y = date.getFullYear();
				return '' + (d <= 9 ? '0' + d : d) + '/' + (m<=9 ? '0' + m : m) + '/'  + y;
			}

			function apiCall(elementID, url){

				$.ajax({
					url: url,
					type: "GET",
					contentType: "application/json",
					dataType: 'jsonp',
					success: function(jsonpData) {
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
			var linkedinApiUrl = "https://api.linkedin.com/v1/people/~:(headline,positions,summary)?oauth2_access_token=xxxxxxxxxxxxxxxxxxx&format=jsonp";
			var instagramApiUrl = "https://api.instagram.com/v1/users/self/media/recent/?access_token=190237791.1677ed0.38d4c12947954ef8a14f49be64f87079";
			var githubApiUrl = "https://ap" + "i.github.co" + "m/user/repos?acces" + "s_token=8132bc9f99e9e488ea40efa" + "6ca8476b775337772";
			var wordpressApiUrl = "https://public-api.wordpress.com/rest/v1.1/sites/gusdev.wordpress.com/posts/?fields=title,URL,date,excerpt";

			//apiCall('linkedin', linkedinApiUrl);
			//apiCall('instagram', instagramApiUrl);
			//apiCall('github', githubApiUrl);
			//apiCall('wordpress', wordpressApiUrl);

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
					$('#' + repoID).append('<td class="hide-small">' + dateToDMY(new Date(repos[i].created_at)) + '</td>');
					$('#' + repoID).append('<td class="hide-xsmall">' + dateToDMY(new Date(repos[i].updated_at)) + '</td>');
					$('#' + repoID).append('<td class="hide-small">' + (repos[i].fork ? '&#10003;' : '&nbsp;') + '</td>');
				}
			}
			
			function setWordpressData(jsonpData){
				$('#statistics #wordpress-amount').html(jsonpData.found);
				var post;
				for(var i = 0; i < Math.min(5, jsonpData.found); i++){
					post = jsonpData.posts[i];
					$('#wordpress-posts').append('<h4>' + dateToDMY(new Date(post.date)) + 
						' : <strong><a href="' + post.URL + '" target="_blank">' + post.title + '</a></strong></h4>');
					$('#wordpress-posts').append('<blockquote>' + post.excerpt + '</blockquote>');
				}
			}

	});

})(jQuery);
