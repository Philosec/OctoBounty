$().ready(() => {
  setupUserAuthentication()
  let username = window.localStorage.getItem('ghUsername')

  populateInputFields(username)

  $('#btn-save-profile').on('click', event => {
    event.preventDefault()
    swal({
      background: 'var(--dark)',
      html: '<h4 class="text-center text-light mt-0">Information Updated</h4>',
      type: 'info'
    }).then(() => {
      addUserInformation(username)
    })
  })
})

function addUserInformation(username) {
  addProfileKeyValue(username, 'first_name', $('#inputFirstName').val())
  addProfileKeyValue(username, 'last_name', $('#inputLastName').val())
  addProfileKeyValue(username, 'street_address', $('#input-street-address').val())
  addProfileKeyValue(username, 'apt_suite', $('#input-apt-suite').val())
  addProfileKeyValue(username, 'city', $('#inputCity').val())
  addProfileKeyValue(username, 'state', $('#inputState').val())
  addProfileKeyValue(username, 'zip', $('#inputZip').val())
  addCardInfoKeyValue(username, 'name_on_card', $('#inputNameOnCard').val())
  addCardInfoKeyValue(username, 'card_number', $('#inputCardNumber').val())
  addCardInfoKeyValue(username, 'exp_month', $('#inputExpMonth').val())
  addCardInfoKeyValue(username, 'exp_year', $('#inputExpYear').val())
  addCardInfoKeyValue(username, 'csv', $('#inputCsv').val())
}

function populateInputFields(username) {
  getUserPersonalInfo(username, (response) => {
    //Personal Info
    $('#inputFirstName').val(response.first_name)
    $('#inputLastName').val(response.last_name)
    $('#input-street-address').val(response.street_address)
    $('#input-apt-suite').val(response.apt_suite)
    $('#inputCity').val(response.city)
    $('#inputState').val(response.state)
    $('#inputZip').val(response.zip)
  })

  getUserCardInfo(username, (response) => {
    //Card Info
    $('#inputNameOnCard').val(response.name_on_card)
    $('#inputCardNumber').val(response.card_number)
    $('#inputExpMonth').val(response.exp_month)
    $('#inputExpYear').val(response.exp_year)
    $('#inputCsv').val(response.csv)
  })
}