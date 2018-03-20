const dbSelectors = {
  bountyLink: '.bounty-link',
  btnNewBounty: '#btn-new-bounty',
  btnSearchBounties: '#btn-search-bounties'
}

const biSelectors = {
  bountyTitle: '.bounty-title',
  issueIdHeader: '.issue-id-header',
  issueDescription: '.issue-description'
}

const converter = new showdown.Converter()

const database = new firebase.database()