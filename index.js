const axios = require('axios');
const formatNumber = require('format-number');

const format = formatNumber({});

function start() {
  const countFeed = 15;
  const feedList = []

  for (let index = 0; index < countFeed; index++) {
    feedList.push(getVoteContext(index));
  }

  Promise.all(feedList).then((result) => {
    result.forEach((context) => {
      console.log(`================================== ${context.feed} ===============================`)
      console.log(`-- Total vote: `, format(context.totalVoteCount))
      context.result.forEach((candidate) => {
        console.log(`${candidate.candidateName}  -  ${format(candidate.voteCount)}  - ${candidate.votePercentage}`)
      })
      
    })
  })
}

async function getVoteContext(index) {
  const resultUrl = `https://blob-prod-president.abs-cbn.com/feed-${index + 1}/president-00199000-nation-location-1.json`;
  const response = await axios.get(resultUrl, {
    responseType: 'json'
  });

  const data = response.data;
  const result = data.result;
  const voter = data.voter
  const totalVotePercentage = voter.count / voter.total;

  const parsedResult = result.map((candidate) => ({
    candidateName: candidate.candidateName,
    voteCount: candidate.voteCount,
    votePercentage: candidate.voteCount / voter.count * 100
  }));

  return {
    result: parsedResult,
    totalVoteCount: voter.count,
    feed: `Feed ${index + 1}`
  };
}

start()