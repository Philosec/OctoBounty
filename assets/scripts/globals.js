const dbSelectors = {
  bountyLink: '.bounty-link',
  btnNewBounty: '#btn-new-bounty',
  btnSearchBounties: '#btn-search-bounties'
}

const biSelectors = {
  bountyTitle: '.bounty-title',
  issueIdHeader: '.issue-id-header',
  issueDescription: '.issue-description',
  curBountyAmount: '.current-bounty-amount'
}

const ghRepoApiUrl = 'https://api.github.com/repos/'

const converter = new showdown.Converter()

const database = new firebase.database()
const auth = new firebase.auth()