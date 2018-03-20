$().ready(() => {
  //Issue link click handlers
  $(document).on('click', dbSelectors.bountyLink, event => {
    saveViewedIssueJson(event)
  })

  //Button Click handlers
  $(dbSelectors.btnNewBounty).on('click', event => {
    event.preventDefault()
    showNewBountyModal()
  })
})

function saveViewedIssueJson(event) {
  event.preventDefault()

  let issueId = $(event.currentTarget).data('issue-id');
  let apiUrl = 'https://api.github.com/repos/' + issueId

  $.get(apiUrl, (response) => {
    window.localStorage.setItem(saveVars.issueJson, JSON.stringify(response))

    window.location = $(event.currentTarget).attr('href')
  })
}

function showNewBountyModal() {
  swal({
    background: 'var(--dark)',
    html:
    '<h2 class="text-center text-light bounty-modal-title">Enter bounty information</h2>' +
    '<label for="swal-input1" class="pt-3 text-light d-flex bounty-modal-label">Issue URL</label>' +
    '<input id="swal-input1" class="swal2-input mt-1">' +
    '<label for="swal-input2" class="text-light text-left d-flex bounty-modal-label">Bounty <span class="text-success">&nbsp($)</span>Amount</label>' +
    '<input id="swal-input2" class="swal2-input mt-1">',
    type: 'info',
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: function () {
      return new Promise(function (resolve) {
        resolve([
          $('#swal-input1').val(),
          $('#swal-input2').val()
        ])
      })
    }
  }).then(function (result) {
    swal({
      background: 'var(--dark)',
      html: '<h3 class="text-center text-light">' + JSON.stringify(result) + '</h3>'
    })
  }).catch(swal.noop)
}