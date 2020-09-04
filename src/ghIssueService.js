


function getIssue(octokit, owner, repo, issue_number) {
  return octokit.issues.get({
    owner,
    repo,
    issue_number
  });
}




/**
 *
 * @param octokit github.octokit object
 * @param {Object[]} issues Array of blocking issues
 * @param issues[].owner owner, undefined = get from context
 * @param issues[].repo repo, undefined = get from context
 * @param issues[].issue_number
 **/
function getAllBlockerIssues(octokit, issues) {
  return allSettled(issues.map((issue) => {
    return getIssue(octokit, ...issue)
  })).then((results) => {
    return _.partition(results, (prm) => { return prm.status === 'rejected'} );
  });
}




function postComment(issue, octokit, blockers, owner, repo) {
  if (DEBUG) { debug(`postComment: ${blockers}`)}
  const blocker_str = blockers.map((blocker) => { return `#${blocker.number}` }).join(' ');
  const comment =`This issue cannot be closed at this time, it is dependent on the following issue(s): ${blocker_str}`;

  octokit.issues.update({
    owner,
    repo,
    issue_number:  issue,
    state: 'open',
  });
  octokit.issues.createComment({
    owner,
    repo,
    issue_number:  issue,
    body: comment,
  });
  return comment;
}




module.exports = {
  getIssue,
  getAllBlockerIssues,
  postComment,
}
