var express = require('express');
var router = express.Router();
var request = require('request');
let Twitter = require('twitter')


date = new Date()
today = (date.getDate() +"/"+ (date.getMonth()+1) + "/"+ date.getFullYear())


let twitterClient = new Twitter({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token_key: process.env.access_token_key,
  access_token_secret: process.env.access_token_secret
});

let requestTwitterTrends = async() => {
  twitterTrends = []
  return new Promise((resolve,reject) => {
    twitterClient.get('https://api.twitter.com/1.1/trends/place.json?id=1',(err,res,body) => {
      if (err) {
        reject(err)
        console.log(err)
      }
      else {
        twitterTrends=res[0].trends
        resolve(twitterTrends)
      }
    })
  })
}

requestTwitterTrends().then((twitterTrends) => {
  console.log("twitter resolved")
}).catch((err)=> {
  console.log(err)
})



let requestIPinfo = async() => {
  IPinfo = []
  let IPlink ="http://ipinfo.io/json?token=" +process.env.IP_token
  return new Promise((resolve,reject) => {
    request(IPlink,(err,res,body) => {
      if (err) {
        reject(err)
        console.log(err)
      }
      else {
        
        IPinfo = {
          ip :JSON.parse(body).ip,
          city:JSON.parse(body).city,
          country:JSON.parse(body).country,
        }
        resolve(IPinfo)
      }
    })
  })
}





/// google
let Gtrends = []
const googleTrends = require('google-trends-api')
let requestGoogleTrends = () => {
    requestIPinfo().then(() => {
      console.log("IP resolved")
      country = IPinfo.country
      console.log(IPinfo)
      googleTrends.realTimeTrends({geo: country}).then(
        (result) => {
          for (i=0;i<JSON.parse(result).storySummaries.trendingStories.length;i++) {
            
            Gtrends.push( {
              city: IPinfo.city,
              articleTitle: JSON.parse(result).storySummaries.trendingStories[i].articles[0].articleTitle,
              url: JSON.parse(result).storySummaries.trendingStories[i].articles[0].url,
              source: JSON.parse(result).storySummaries.trendingStories[i].articles[0].source,
              time: JSON.parse(result).storySummaries.trendingStories[i].articles[0].time,
              snippet: JSON.parse(result).storySummaries.trendingStories[i].articles[0].snippet,
            })
          }
          console.log("google resolved")
          return(Gtrends)
          
    
        }).catch((err) => {      
          console.log("an error occured")
          console.log(err)
          googleTrends.realTimeTrends({geo: "US"}).then(
            (result) => {
              for (i=0;i<JSON.parse(result).storySummaries.trendingStories.length;i++) {
                
                Gtrends.push( {
                  city: IPinfo.city,

                  articleTitle: JSON.parse(result).storySummaries.trendingStories[i].articles[0].articleTitle,
                  url: JSON.parse(result).storySummaries.trendingStories[i].articles[0].url,
                  source: JSON.parse(result).storySummaries.trendingStories[i].articles[0].source,
                  time: JSON.parse(result).storySummaries.trendingStories[i].articles[0].time,
                  snippet: JSON.parse(result).storySummaries.trendingStories[i].articles[0].snippet,
                })
              }
              console.log("google resolved")
              return(Gtrends)
            })  
        })  
    }).catch((err)=> {
      console.log(err)
    })
}


requestGoogleTrends()




//youtube
let requestYoutubeTrends = async() => {
  ytbTrends = []
  let YTBlink = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&regionCode=TN&key="+process.env.YTB_token
  return new Promise((resolve,reject) => {
    request(YTBlink,(err,res,body) => {
      if (err) {
        reject(err)
        console.log(err)
      }
      else {c
        for (i=0;i<JSON.parse(body).items.length;i++) {
          ytbTrends.push(
            {
              publishedAt: JSON.parse(body).items[i].snippet.publishedAt,
              thumbnail: JSON.parse(body).items[i].snippet.thumbnails.medium.url,
              title: JSON.parse(body).items[i].snippet.title,
              description: JSON.parse(body).items[i].snippet.description,
              channelTitle: JSON.parse(body).items[i].snippet.channelTitle,
              tags: JSON.parse(body).items[i].snippet.tags,
              statistics:JSON.parse(body).items[i].statistics.viewCount
            }
          )
        }
        resolve(ytbTrends)
      }
    })
  })
}

requestYoutubeTrends().then((ytbTrends) => {
  console.log("youtube resolved")
}).catch((err)=> {
  console.log(err)
})


// reddit 
let requestRedditTrends = async () => {
  redditTrends = []
   return new Promise((resolve, reject) => {
    request('https://www.reddit.com/r/all/top.json?/', (err, res, body) => {
      if (err) {
        reject(err);
      }
      else {
        numberTrends = JSON.parse(body).data.children.length-10;
        for (i = 0; i < numberTrends; i++) {

          redditTrends.push({
            subreddit: (JSON.parse(body).data.children[i].data.subreddit),
            url: (JSON.parse(body).data.children[i].data.url),
            thumbnail: (JSON.parse(body).data.children[i].data.thumbnail),
            title: (JSON.parse(body).data.children[i].data.title),
            ups: (JSON.parse(body).data.children[i].data.ups)
          });
        }
        resolve(redditTrends);
      }
    })
  }) 
}

requestRedditTrends().then((redditTrends) =>
  console.log("reddit resolved")
).catch((err)=> {
  console.log(err)
})

router.get('/', (req, res, next) => {
  requestRedditTrends().then(reddit => {
    let redditTrends = reddit
    return redditTrends
  }).then((redditTrends) => {
    requestTwitterTrends().then(twitter => {
      let twitterTrends = twitter
      return {twitterTrends,redditTrends}
    }).then((twitterAndReddit) => {
      requestYoutubeTrends().then((ytb) => {
        let YTBTrends = ytb
        let twitterTrends = twitterAndReddit.twitterTrends
        let redditTrends =twitterAndReddit.redditTrends
        res.render('main', { today:today,  Gtrends: Gtrends, 
          redditTrends:redditTrends , YTBTrends:YTBTrends , twitterTrends:twitterTrends})
      })
    })

  })
});

module.exports = router;