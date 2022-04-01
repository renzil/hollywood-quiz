const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=1&category=11&difficulty=easy&type=multiple";
const TENOR_API_URL = "https://g.tenor.com/v1/search?q=QUERY&key=FIVJE9C9U2QZ&limit=1";

let level = 1;
let lives_left = 3;
let question = "";
let answer = "";
let answer_options = [];

function fetch_new_question() {
    // get a new question, answer and multiple choice options from TRIVIA_API_URL
    fetch(TRIVIA_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            question = data["results"][0]["question"];
            answer = data["results"][0]["correct_answer"];
            answer_options = data["results"][0]["incorrect_answers"];
            answer_options.splice(Math.random() * 4, 0, answer);

            console.log("Question: " + question);
            console.log("Answer: " + answer);
            console.log("Answer options: " + answer_options);

            document.getElementById("question_text").innerHTML = question;
            document.getElementById("option_1_button").innerHTML = answer_options[0];
            document.getElementById("option_2_button").innerHTML = answer_options[1];
            document.getElementById("option_3_button").innerHTML = answer_options[2];
            document.getElementById("option_4_button").innerHTML = answer_options[3];
            
            fetch(TENOR_API_URL.replace("QUERY", answer))
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    document.getElementById("question_image").setAttribute("src", data["results"][0]["media"][0]["gif"]["url"]);
                })
        });
}

function handle_correct_answer() {
    // display success animation
    level = level + 1;
}

function handle_wrong_answer() {
    // display failure animation
    lives_left = lives_left - 1;
}

function handle_game_over() {
    // display game over state
}

function on_answer_click(clicked_answer) {
    let is_answer_correct = (clicked_answer === answer);

    if (is_answer_correct) {
        handle_correct_answer();
    }
    else {
        handle_wrong_answer();
    }
    
    if (lives_left > 0) {
        fetch_new_question();
    } else {
        handle_game_over();
    }
}

fetch_new_question();