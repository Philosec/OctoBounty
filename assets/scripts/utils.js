function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

String.prototype.hashCode = function() {
  var hash = 0;
  if (this.length == 0) {
    return hash;
  }
  for (var i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function getIssueIdFromUrl(issueUrl) {
  return issueUrl.trim().replace('https://github.com/', '')
}

function getFullIssueUrlFromId(issueId) {
  return ghRepoApiUrl + issueId
}

function getHashFromIssueId(issueUrlId) {
  return issueUrlId.hashCode()
}