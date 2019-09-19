function togglePoll() {
    var poll = document.querySelector('#problem_difficulty');

    if (poll.classList.contains('poll_hidden')) {
        poll.classList.remove('poll_hidden');
        poll.classList.add('poll_shown');
    } else {
        poll.classList.remove('poll_shown');
        poll.classList.add('poll_hidden');
    }
}

function sendVote(token, problemId) {
    var levelInput = document.querySelector('.difficulty_selector');
    var commentInput = document.querySelector('#problem_comment');

    var level = levelInput.value;
    var comment = commentInput.value;
    var algorithms = algorithmSuggestionInput.value.map((item) => {return item.algorithm_id});

    var params = {
        token: token,
        id: problemId, 
        level: level,
        comment: comment,
        algorithms: algorithms
    };

    var o = new XMLHttpRequest;
    o.open('POST', 'https://api.solved.ac/vote.php', true);
    o.onload = function() {
        console.log(o.responseText)
        if (o.status == 200){
            location.reload()
        } else {
            alert(JSON.parse(o.responseText).error)
        }
    }
    o.send(JSON.stringify(params));
}