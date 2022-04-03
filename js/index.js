---
---
/* the above dashes are needed for Jekyll to substitute site.baseurl in this file */

window.onload = function() {
    document.getElementById("difficulty_slider").addEventListener("change", function(event) {
        let difficulty = "Easy";
        switch (event.target.value) {
            case "1":
            difficulty = "Medium";
            break;

            case "2":
            difficulty = "Hard";
            break;

            case "0":
            default:
            difficulty = "Easy";
            break;
        }

        document.getElementById("difficulty_text").textContent = difficulty;
        document.getElementById("play_button_link").setAttribute("href", "{{ site.baseurl }}/game.html?difficulty=" + difficulty.toLowerCase());
    });
}
