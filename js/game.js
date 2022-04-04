const TRIVIA_API_URL = "https://opentdb.com/api.php?amount=1&category=11&difficulty=DIFFICULTY&type=multiple";
const TENOR_API_URL = "https://g.tenor.com/v1/search?q=QUERY&key=FIVJE9C9U2QZ&limit=10";
const URL_PARAMS = new URLSearchParams(window.location.search);

let level = 1;
let lives_left = 3;
let question = "";
let answer = "";
let answer_options = [];
let is_game_over = false;
let audio_enabled = URL_PARAMS.get('audio') === "true" || false;
let difficulty = URL_PARAMS.get('difficulty') || "easy";

function loading(enabled) {
    document.getElementById("loading_spinner").style.display = enabled ? "flex" : "none";
}

function fetch_new_question() {
    loading(true);
    enable_buttons(true);
    
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

function playAudio(fileUrl) {
    if (!audio_enabled) {
        return;
    }

    let audio = new Audio(fileUrl);
    audio.play();
}

function handle_correct_answer(clicked_button) {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    playAudio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");

    clicked_button.classList.add("answer_button_correct");

    setTimeout(() => {
        clicked_button.classList.remove("answer_button_correct");
        level = level + 1;
        document.getElementById("level_text").innerHTML = "Level " + level;
        fetch_new_question();
    }, 1000);
}

function handle_wrong_answer(clicked_button) {
    playAudio("https://cdn.pixabay.com/download/audio/2021/08/09/audio_d64d38a0b2.mp3?filename=crash-6711.mp3");

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
    playAudio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_2e8fc4a203.mp3?filename=rock-destroy-6409.mp3");

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
            navigate_home();
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

function update_window_url() {
    window.history.replaceState({}, document.title, "/game.html?difficulty=" + difficulty + "&audio=" + audio_enabled);
}

function update_audio() {
    document.getElementById("audio_button_icon").classList.add(audio_enabled ? "ri-volume-up-fill" : "ri-volume-mute-fill");
    document.getElementById("audio_button_icon").classList.remove(audio_enabled ? "ri-volume-mute-fill" : "ri-volume-up-fill");
    document.getElementById("audio_player").muted = !audio_enabled;
    
    update_window_url();
}

function navigate_home() {
    window.location.href = "/?difficulty=" + difficulty + "&audio=" + audio_enabled;
}

window.onload = function() {
    document.getElementById("audio_button").addEventListener("click", function(event) {
        event.preventDefault();

        audio_enabled = !audio_enabled;
        update_audio();
    });

    document.getElementById("home_button").addEventListener("click", function(event) {
        event.preventDefault();

        navigate_home();
    });

    update_audio();

    fetch_new_question();

    answer_buttons = document.getElementsByClassName("answer_button");
    for (let i = 0; i < answer_buttons.length; ++i) {
        answer_button = answer_buttons[i];
        answer_button.addEventListener("click", on_answer_click);
    }
}

enable_buttons(false);
