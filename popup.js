document.addEventListener('DOMContentLoaded', function() {
  var historyList = document.getElementById('history-list');
  var deleteAllButton = document.getElementById('delete-all');
  var showBlockedButton = document.getElementById('show-blocked');
  var unblockAllButton = document.getElementById('unblock-all');

  browser.history.search({ text: '', maxResults: 10 }).then(function(results) {
    if (results.length === 0) {
      throw new Error('No search history found.');
    }

    var blockedLinks = getBlockedLinks();
    var filteredResults = results.filter(function(result) {
      return !blockedLinks.includes(result.url);
    });

    filteredResults.forEach(function(result) {
      var li = document.createElement('li');
      var term = document.createElement('span');
      var title = result.title.length > 16 ? result.title.substring(0, 16) + '...' : result.title;
      term.textContent = title;
      var blockButton = document.createElement('button');
      blockButton.textContent = 'Block';
      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';

      blockButton.addEventListener('click', function() {
        blockLink(result.url);
      });

      deleteButton.addEventListener('click', function() {
        browser.history.deleteUrl({ url: result.url });
        li.remove();
      });

      li.appendChild(term);
      li.appendChild(blockButton);
      li.appendChild(deleteButton);
      historyList.appendChild(li);
    });
  }).catch(function(error) {
    console.error(error);
  });

  deleteAllButton.addEventListener('click', function() {
    browser.history.search({ text: '', maxResults: 100 }).then(function(results) {
      results.forEach(function(result) {
        browser.history.deleteUrl({ url: result.url });
      });
      historyList.innerHTML = '';
      deleteAllButton.remove();
    }).catch(function(error) {
      console.error(error);
    });
  });

  showBlockedButton.addEventListener('click', function() {
    var blockedLinks = getBlockedLinks();
    if (blockedLinks.length === 0) {
      console.log('No blocked pages found.');
    } else {
      console.log('Blocked Pages:');
      blockedLinks.forEach(function(url) {
        console.log(url);
      });
    }
  });

  unblockAllButton.addEventListener('click', function() {
    localStorage.removeItem('blockedLinks');
    console.log('All blocked pages unblocked.');
  });

  function blockLink(url) {
    if (isLinkBlocked(url)) {
      console.log('Link is already blocked:', url);
      return;
    }

    var blockedLinks = getBlockedLinks();
    blockedLinks.push(url);
    localStorage.setItem('blockedLinks', JSON.stringify(blockedLinks));

    console.log('Link blocked:', url);

    browser.history.search({ text: url, maxResults: 100 }).then(function(results) {
      results.forEach(function(result) {
        browser.history.deleteUrl({ url: result.url });
      });
    }).catch(function(error) {
      console.error(error);
    });
  }

  function isLinkBlocked(url) {
    var blockedLinks = getBlockedLinks();
    return blockedLinks.includes(url);
  }

  function getBlockedLinks() {
    var blockedLinks = localStorage.getItem('blockedLinks');
    return blockedLinks ? JSON.parse(blockedLinks) : [];
  }
});
