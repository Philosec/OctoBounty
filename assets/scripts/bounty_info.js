$().ready(() => {
  setupUserAuthentication()
  let issueId = getParameterByName('issueId')
  let issueApiUrl = getFullIssueUrlFromId(issueId) + getAuthTokenParameter()

  initPageButtons()
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

function initPageButtons () {
  let username = window.localStorage.getItem('ghUsername')
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))

  onBountyActive(issueHashId, () => {
    $('.current-bounty-heading').text('Current Bounty')
    onCheckUserOwnsBounty(username, issueHashId, () => {
      $('.bounty-owned-btn-row').removeClass('d-none')

      onClaimCanBeAwarded(username, issueHashId, (claimerUsername) => {
        $('#btn-approve-claim').removeClass('d-none')
        $('#btn-approve-claim').text('Approve (' + claimerUsername + ') Claim')
      }, () => {
        $('#btn-no-claim').removeClass('d-none')
      })

    }, () => {
      $('.bounty-not-owned-btn-row').removeClass('d-none')

      onCheckUserClaimedBounty(username, issueHashId, () => {
        $('#btn-cancel-claim').removeClass('d-none')
      }, () => {
        $('#btn-claim-bounty').removeClass('d-none')
      })

      onBountyTracked(username, issueHashId, () => {
        $('#btn-untrack-bounty').removeClass('d-none')
      }, () => {
        $('#btn-track-bounty').removeClass('d-none')
      })
    })
  }, () => {
    $('.current-bounty-heading').text('Paid Bounty')
  })
}

function registerButtonCallbacks () {
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

  $('#btn-claim-bounty').on('click', event => {
    claimBounty()
    $('#btn-claim-bounty').addClass('d-none')
    $('#btn-cancel-claim').removeClass('d-none')
  })

  $('#btn-cancel-claim').on('click', event => {
    cancelBountyClaim()
    $('#btn-cancel-claim').addClass('d-none')
    $('#btn-claim-bounty').removeClass('d-none')
  })

  $('#btn-approve-claim').on('click', event => {
    event.preventDefault()
    approveBountyClaim()
    $('.bounty-owned-btn-row').addClass('d-none')
    $('.current-bounty-heading').text('Paid Bounty')
  })
}

function populateIssueDetails (issueJSON, issueId, bountyAmount) {
  let numAnim = new CountUp(document.querySelector(biSelectors.curBountyAmount), 0, bountyAmount, 0, 4, {prefix: '$'})
  if (!numAnim.error) {
    numAnim.start()
  } else {
    console.error(numAnim.error)
  }

  $(biSelectors.bountyTitle).text(issueJSON.title)
  $(biSelectors.issueIdHeader).text(issueId)

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

function trackBounty () {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')
  addTrackBountyToUser(username, issueHashId)
}

function untrackBounty () {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')
  removeTrackBountyFromUser(username, issueHashId)
}

function claimBounty () {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')

  addBountyClaim(username, issueHashId)
}

function cancelBountyClaim () {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')

  removeBountyClaim(username, issueHashId)
}

function approveBountyClaim () {
  let issueHashId = getHashFromIssueId(getParameterByName('issueId'))
  let username = window.localStorage.getItem('ghUsername')

  addClosedBounty(username, issueHashId)
}