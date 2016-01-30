# ChartLyrics API

## Usage

Requests to the ChartLyrics API require a __base url__ of `http://api.chartlyrics.com/apiv1.asmx/`, followed by the type of query you're looking to make (i.e. `SearchLyric?` or `GetLyric?`). If successful, it will return an XML file containing ChartLyrics's available information for your search. Additional information about the ChartLyrics API can be found [here](http://www.chartlyrics.com/api.aspx).

### Step One: SearchLyric

If I wanted to do a search for the lyrics to Michael Jackson's _Thriller_, I would first perform a SearchLyric query. This will retrieve for us the ChartLyrics-specific identification information for the track we're querying. The necessary parameters for this kind of a search are __artist__ and __song__, where song is, you guessed it, the song name. In this case, the command we'd append to our __base url__ would be `SearchLyric?artist=Michael%20Jackson&song=Thriller`. Bear in mind that in these types of requests, spaces are encoded as `%20`. The returned XML file will contain an __ArrayOfSearchLyricResult__, which is an array of results. Typically, we'll want the __SearchLyricResult__ item at index `0`, since this is most likely the result we are looking for. The __SearchLyricResult__ child elements to record are __LyricChecksum__ and __LyricId__, as we'll need these in the next step.

In this case, the __LyricChecksum__ result is `f0bed6977b0a82c6327e405a01c17d0b`, and the __LyricId__ is `628`.

The full xml results of this query can be found in the `SearchLyricResult.xml` file.

### Step Two: GetLyric

Using the __LyricChecksum__ and __LyricId__ from the last step, we'll now query ChartLyrics again, this time making the search for our lyrics. Based on the results from searching for _Thriller_, the query string to add to our __base url__ should look something like `GetLyric?lyricId=628&lyricCheckSum=f0bed6977b0a82c6327e405a01c17d0b`. This will return another xml result. From here we want to go to the __GetLyricResult__ element, and grab its child __Lyric__. The information contained within the __Lyric__ element should be raw text of the song's lyrics.

The full xml results of this query can be found in the `GetLyricResult.xml` file.
