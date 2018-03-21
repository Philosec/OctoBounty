$().ready(() => {
  setupUserAuthentication()



  // //Database listeners
  // var userOpenBountiesRef = database.ref('users').child(ghUsername).child('open_bounties')
  // userOpenBountiesRef.on('child_added', snapshot => {
  //   var hashId = snapshot.key
  //
  //   getIssueIdFromHashId(hashId, appendNewLink)
  // })

  //Issue link click handlers
  $(document).on('click', dbSelectors.bountyLink, event => {
    event.preventDefault()
    gotoBountyDetailPage()
  })

  $(dbSelectors.btnNewBounty).on('click', event => {
    event.preventDefault()
    showNewBountyModal()
  })
})

function setupUserAuthentication() {
  //Authentication
  var activeUser = null

  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      var token = result.credential.accessToken;
      window.localStorage.setItem('ghAuthToken', token)
      var ghUsername = result.additionalUserInfo.username.toLowerCase()
      window.localStorage.setItem('ghUsername', ghUsername)
      writeNewUserData(ghUsername)
    }
  }).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    var email = error.email;
    var credential = error.credential;

    console.log(errorCode + " " + errorMessage + " " + email + " " + credential)
  })

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      activeUser = user
      $('#btn-profile').html('<img src="' + activeUser.photoURL + '" class="rounded-circle">')
    }
  })

  //Profile button handler
  $('#btn-profile').on('click', event => {
    event.preventDefault()

    if (activeUser === null) {
      var provider = new firebase.auth.GithubAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    }
  })
}

function appendNewLink(parentSelector, linkId) {
  var $link = $('<a href="bounty-info.html" class="issue-text bounty-link" data-issue-id=' + linkId + '>')
  var $col = $('<div class="col-12 col-md-6 text-truncate my-auto">')
  var $row = $('<div class="row">')
  $($col).append($link)
  $($row).append($col)
  $(parentSelector).append($row)
}

function gotoBountyDetailPage() {
  let issueId = $(event.currentTarget).data('issue-id');
  window.location = $(event.currentTarget).attr('href') + '?issueId=' + issueId
}

function showNewBountyModal() {
  swal({
    background: 'var(--dark)',
    html:
    '<h2 class="text-center text-light bounty-modal-title">Enter bounty information</h2>' +
    '<label for="issue-url-input" class="pt-3 text-light d-flex bounty-modal-label">Issue URL</label>' +
    '<input id="issue-url-input" class="swal2-input mt-1">' +
    '<label for="bounty-offered-input" class="text-light text-left d-flex bounty-modal-label">Bounty Offered <span class="text-success">&nbsp($)</span></label>' +
    '<input id="bounty-offered-input" class="swal2-input mt-1">',
    type: 'info',
    showCancelButton: true,
    confirmButtonText: 'Submit',
    showLoaderOnConfirm: true,
    focusConfirm: false,
    preConfirm: function () {
      return new Promise((resolve) => {
        var issueId = getIssueIdFromUrl($('#issue-url-input').val())
        var bountyOffered = $('#bounty-offered-input').val()
        var apiUrl = getFullIssueUrlFromId(issueId)

        if (isNaN(bountyOffered) || parseInt(bountyOffered) <= 0) {
          swal.showValidationError('Bounty offered must be greater than $0')
          resolve()
        }
        else {
          setTimeout(() => {
            //Validate and pass the api URL and show message on fail
            $.get(apiUrl, (response) => {
              resolve([issueId, bountyOffered])
            }).fail(() => {
              swal.showValidationError('Issue URL is not valid.')
              resolve()
            })
          }, 2000)
        }
      })
    },
    allowOutsideClick: () => !swal.isLoading()
  }).then(function (result) {
    if (result.value) {
      console.log('here')
      var username = window.localStorage.getItem('ghUsername')
      writeNewBountyData(result.value[0], username, result.value[1], () => {
        swal({
          background: 'var(--dark)',
          html: '<h4 class="text-center text-light">Bounty already exists for that issue.</h4>',
          type: 'error',
          allowOutsideClick: false
        }).then(function (result) {
          showNewBountyModal()
        })
      })
    }
  }).catch(swal.noop)
}