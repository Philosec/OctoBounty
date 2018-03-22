$().ready(() => {
  let issueId = getParameterByName('issueId')
  let issueApiUrl = getFullIssueUrlFromId(issueId) + getAuthTokenParameter()

  initTrackingButtons()
  registerButtonCallbacks()

  $.get(issueApiUrl, (response) => {
    let bountyRef = database.ref('bounties')
    bountyRef.once('value')
      .then(bountiesSnapshot => {
        let hashId = getHashFromIssueId(issueId)
        let bountyAmount = bountiesSnapshot.child(hashId).val().bounty_amount_posted
        populateIssueDetails(response, issueId, bountyAmount)
      })
  })
})

function initTrackingButtons() {
  let username = window.localStorage.getItem('ghUsername')
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))

  ifBountyTracked(username, issueHashId, () => {
    $('#btn-untrack-bounty').removeClass('d-none')
  }, () => {
    $('#btn-track-bounty').removeClass('d-none')
  })
}

function registerButtonCallbacks() {
  $('#btn-track-bounty').on('click', event => {
    trackBounty()
    $(event.currentTarget).addClass('d-none')
    $('#btn-untrack-bounty').removeClass('d-none')
  })

  $('#btn-untrack-bounty').on('click', event => {
    untrackBounty()
    $(event.currentTarget).addClass('d-none')
    $('#btn-track-bounty').removeClass('d-none')
  })
}

function populateIssueDetails(issueJSON, issueId, bountyAmount) {
  $(biSelectors.bountyTitle).text(issueJSON.title)
  $(biSelectors.issueIdHeader).text(issueId)
  $(biSelectors.curBountyAmount).text('$' + bountyAmount)

  let descriptionHTML = converter.makeHtml(issueJSON.body)
  $(biSelectors.issueDescription).html(descriptionHTML)

  let commentsApiUrl = issueJSON.comments_url + getAuthTokenParameter()
  $.get(commentsApiUrl, (response) => {
    $.each(response, (index, value) => {
      let $img = $('<img src="' + value.user.avatar_url + '">')
      let $mediaBody = $('<div class="media-body container">')
      let $mediaHeader = $('<div class="media-heading">').text(value.user.login + ' commented on ' + value.updated_at)
      let $mediaBodyContent = converter.makeHtml(value.body)
      $mediaBody.append($mediaHeader)
      $mediaBody.append($mediaBodyContent)
      let $commentHTML = $('<div class="media">')
      $commentHTML.append($img)
      $commentHTML.append($mediaBody)
      $('.comment-container').append($commentHTML)
    })
  })
}

function trackBounty() {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')
  addTrackBountyToUser(username, issueHashId)
}

function untrackBounty() {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')
  removeTrackBountyToUser(username, issueHashId)
}