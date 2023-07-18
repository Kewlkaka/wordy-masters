const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = ''; //acting as a buffer
    let currentRow = 0;
    let isLoading = true;


    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    console.log(word);
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;
    //console.log(word);

    //Secondly lets Handle the input

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            //Replace the last letter.
            //if 5 letters are complete, replace the 5th with the new letter.

            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length != ANSWER_LENGTH) {
            //do nothing
            return;
        }

        //TODO: validate the word.
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        //Shortcut for above two lines: const { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }

        //TODO: do all the marking as correct, close, wrong

        const guessParts = currentGuess.split(""); //splits the word like "I", "V", "O". "R", "Y"
        const map = makeMap(wordParts); //keep track of character marking
        console.log(map);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            //mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--; //decrement the letters appearance in the object returned by makeMap(array), this way you can be sure that all characters have been marked.
            }
        }

        for (let j = 0; j < ANSWER_LENGTH; j++) {
            if (guessParts[j] === wordParts[j]) {
                //do nothing
            } else if (wordParts.includes(guessParts[j]) && map[guessParts[j]] > 0) {
                //mark as close. If wordPart includes the letter, we see if that letter can be marked as close if it wasnt correct above. However lets say O appears once in your word of the day and twice in a users guess. After the O has been marked correct, we dont wish for it to be marked close. So we use map[guessParts[i]]-- to decrement its occurence or in other words mark it visited by its decrementation in the initial for loop. Then we use the condition like we have as so: && map[guessParts[j]] > 0 , to only mark it as close in this pass if an occurence or unmarked O still exists else skip it and in turn it will be marked "Wrong" by the last else. If not then mark it close and decrement its occurence again which will make it 0.
                letters[currentRow * ANSWER_LENGTH + j].classList.add("close");
                map[guessParts[j]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + j].classList.add("wrong");
            }
        }

        currentRow++; //new row if length for first word has been complete.

        if (currentGuess === word) {        //TODO: did you win?
            //win
            document.querySelector('.brand').classList.add("winner");
            setTimeout(function () {
                alert('you win');
            }, 22);
            done = true;
            return;
        } else if (currentRow === ROUNDS) { //TODO: did you lose?
            setTimeout(function () {
                alert(`You lose, the word was ${word}`);
            }, 10);
            done = true;
        }

        currentGuess = ''; //new guess for new row so far is blank
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        //alert('Not a valid word Mr.Ijju');
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
            }, 10)
        }
    }
    //Lets first construct Event Listener

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (done || isLoading) {
            //do nothing
            return;
        }

        const action = event.key //handling user typing. All keys.

        //console.log(action);

        if (action === 'Enter') {
            commit(); //user is trying to commit/finalize a guess
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            //do nothing
        }

    });
}


function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}
//Thirdly we will handle the loading state.
function setLoading(isLoading) {
    loadingDiv.classList.toggle('hidden', !isLoading); //if loading is true it will remove it, if loading is false it will remove it. Easier than if else.
}

//Keep track of character marking
function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}

init();