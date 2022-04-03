const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=1&category=11&difficulty=DIFFICULTY&type=multiple";
const TENOR_API_URL = "https://g.tenor.com/v1/search?q=QUERY&key=FIVJE9C9U2QZ&limit=10";

let level = 1;
let lives_left = 3;
let question = "";
let answer = "";
let answer_options = [];
let is_game_over = false;

function loading(enabled) {
    document.getElementById("loading_spinner").style.display = enabled ? "flex" : "none";
}

function fetch_new_question() {
    loading(true);
    enable_buttons(true);

    const urlParams = new URLSearchParams(window.location.search);
    let difficulty = urlParams.get('difficulty') || "easy";
    fetch(TRIVIA_API_URL.replace("DIFFICULTY", difficulty))
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
                    results_length = data["results"].length;
                    const media = data["results"][Math.floor(Math.random() * results_length)]["media"][0];
                    document.getElementById("question_image").addEventListener("load", (event) => {
                        loading(false);
                        event.target.setAttribute("src", media["gif"]["url"]);
                    }, {
                        once: true,
                    });
                    document.getElementById("question_image").setAttribute("src", media["nanogif"]["url"]);
                })
                .catch(err => {
                    throw err;
                });
        })
        .catch(err => {
            console.log(err);
            document.getElementById("question_image").setAttribute("src", "");
        })
        .finally(() => {
            loading(false);
        });
}

function handle_correct_answer(clicked_button) {
    clicked_button.classList.add("answer_button_correct");

    setTimeout(() => {
        clicked_button.classList.remove("answer_button_correct");
        level = level + 1;
        document.getElementById("level_text").innerHTML = "Level " + level;
        fetch_new_question();
    }, 1000);
}

function handle_wrong_answer(clicked_button) {
    clicked_button.classList.add("answer_button_wrong");

    setTimeout(() => {
        clicked_button.classList.remove("answer_button_wrong");
        lives_left = lives_left - 1;

        heart_icons = document.getElementsByClassName("ri-heart-fill");
        last_heart_icon = heart_icons.length - 1;
        heart_icons[last_heart_icon].classList.add("ri-heart-line");
        heart_icons[last_heart_icon].classList.remove("ri-heart-fill");

        if (lives_left > 0) {
            fetch_new_question();
        } else {
            handle_game_over();
        }
    }, 1000);
}

function handle_game_over() {
    is_game_over = true;
    answer_buttons = document.getElementsByClassName("answer_button");
    for(let i = 1; i < answer_buttons.length; ++i){
        answer_buttons[i].style.visibility = "hidden";
    }

    document.getElementById("question_text").innerHTML = "Game Over! You reached Level " + level + ".";

    fetch(TENOR_API_URL.replace("QUERY", "game over"))
        .then(response => response.json())
        .then(data => {
            console.log(data);
            num_results = data["results"].length;
            const media = data["results"][Math.floor(Math.random() * results_length)]["media"][0];
            document.getElementById("question_image").addEventListener("load", (event) => {
                event.target.setAttribute("src", media["gif"]["url"]);
            }, {
                once: true,
            });
            document.getElementById("question_image").setAttribute("src", media["nanogif"]["url"]);
        })
        .catch(err => {
            console.log(err);
        });

    let count = 3;
    document.getElementById("option_1_button").innerHTML = "Restarting in " + count;
    document.getElementById("option_1_button")
    let interval_id = setInterval(function() {
        if (count == 0) {
            clearInterval(interval_id);
            window.location.href = "/";
        } else if (count > 0) {
            count = count - 1;
            document.getElementById("option_1_button").innerHTML = "Restarting in " + count;
        }
    }, 1000);
}

function enable_buttons(enabled) {
    answer_buttons = document.getElementsByClassName("answer_button");
    for (let i = 0; i < answer_buttons.length; ++i) {
        answer_button = answer_buttons[i];
        answer_button.disabled = !enabled;
    }
}

function on_answer_click(event) {
    enable_buttons(false);

    const clicked_button = event.target;
    const clicked_answer = clicked_button.innerHTML;

    console.log("clicked: " + clicked_answer);

    if (is_game_over) {
        return;
    }

    let is_answer_correct = (clicked_answer === answer);

    if (is_answer_correct) {
        handle_correct_answer(clicked_button);
    }
    else {
        handle_wrong_answer(clicked_button);
    }
}

window.onload = function() {
    fetch_new_question();

    answer_buttons = document.getElementsByClassName("answer_button");
    for (let i = 0; i < answer_buttons.length; ++i) {
        answer_button = answer_buttons[i];
        answer_button.addEventListener("click", on_answer_click);
    }
}

enable_buttons(false);
