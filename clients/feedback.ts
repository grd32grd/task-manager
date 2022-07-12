let feedbackInput: any = document.getElementById('feedbackinput');
let feedbackButton: any = document.getElementById('feedbackbutton');

feedbackButton.onclick = () => {
    let feedback: CommentType = {
        type: 'feedback',
        comment: feedbackInput.value
    }
    let x = new XMLHttpRequest();
    x.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            feedbackInput.value = "";
            alert("Thanks for your feedback!");
        }
    }
    x.open("PUT", "/feedback");
    x.setRequestHeader("Content-Type", "application/json");
    x.send(JSON.stringify(feedback));
}