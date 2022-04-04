const URL_PARAMS = new URLSearchParams(window.location.search);
const DIFFICULTY_SLIDER_MAP = {
    "0": "easy",
    "1": "medium",
    "2": "hard",
};

let audio_enabled = URL_PARAMS.get('audio') === "true" || false;
let difficulty = URL_PARAMS.get('difficulty') || "easy";

function update_window_url() {
    window.history.replaceState({}, document.title, "/?difficulty=" + difficulty + "&audio=" + audio_enabled);
}

function update_audio() {
    document.getElementById("audio_button_text").innerHTML = audio_enabled ? "♫" : "<del>♫</del>";
    document.getElementById("audio_player").muted = !audio_enabled;
    
    update_window_url();
}

function update_difficulty() {
    document.getElementById("difficulty_text").textContent = difficulty.toUpperCase();
    update_window_url();
}

window.onload = function() {
    document.getElementById("audio_button").addEventListener("click", function(event) {
        audio_enabled = !audio_enabled;
        update_audio();
    });

    document.getElementById("play_button_link").addEventListener("click", function(event) {
        event.preventDefault();

        window.location.href = "/game.html?difficulty=" + difficulty + "&audio=" + audio_enabled;
    });

    document.getElementById("difficulty_slider").addEventListener("change", function(event) {
        difficulty = DIFFICULTY_SLIDER_MAP[event.target.value];
        update_difficulty();
    });

    update_audio();
    update_difficulty();
    document.getElementById("difficulty_slider").value = Object.keys(DIFFICULTY_SLIDER_MAP).find(key => DIFFICULTY_SLIDER_MAP[key] === difficulty);
}
