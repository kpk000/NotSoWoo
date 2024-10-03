console.log("Script de contenido cargado");
// Monkey patching fetch and XHR
const injectedScript =
  "(" +
  function () {
    const interceptRequests = () => {
      const originalFetch = window.fetch;
      window.fetch = function () {
        return originalFetch.apply(this, arguments).then((response) => {
          response
            .clone()
            .json()
            .then((data) => {
              window.postMessage({ type: "FETCH_RESPONSE", data: data }, "*");
            });
          return response;
        });
      };

      const originalXHROpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function () {
          const responseBody = this.responseText;
          window.postMessage({ type: "XHR_RESPONSE", data: responseBody }, "*");
        });
        return originalXHROpen.apply(this, arguments);
      };
    };

    interceptRequests();
  } +
  ")();";

const script = document.createElement("script");
script.textContent = injectedScript;
(document.head || document.documentElement).appendChild(script);
script.remove();

//CONSTANTS
const MIN_DELAY = 1000;
const MAX_DELAY = 3000;
const H1_SELECTOR = "h1[data-test-id]";
const BUTTON_DIV_SELECTOR = "button[data-test-id='Participant.Submit']";
const BUTTON_VALIDATE_SELECTOR = "button[data-test-id='Participant.Submit']";
const TEST_CHOICE_SELECTOR = "button[data-idx]";
const questions = [];

// Actions variables
const processedH1s = new Set();
let currentQuestionText = null;
let currentTimeout = null;

// General async func
const startSolving = async (question) => {
  try {
    if (currentQuestionText !== question) {
      currentQuestionText = question;
      if (currentTimeout) {
        console.log("Clearing timeout"); //Debug
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
    }

    if (questions.some((q) => q.title === question)) {
      const answer = questions.find((q) => q.title === question);
      console.log("Answer found:", answer); //Debug
      if (!answer) {
        throw new Error("No answer found");
      }
      toastAnswerFound(true);
      // See if is a test
      if (answer.choices && answer.choices.length > 0) {
        let correctChoices = answer.choices.filter((c) => c.isCorrect);
        console.log(correctChoices); //Debug
        for (let correctChoice of correctChoices) {
          let answerText = correctChoice.choice;
          await solveTest(answerText);
        }
        await validateAnswer();
      }
    } else {
      toastAnswerFound(false);
    }
  } catch (e) {
    console.log("Error:", e);
    toastAnswerFound(false);
    console.log("No answer found");
  }
};
// Generate random delay
const randomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
// Random delay
const delay = (ms = randomDelay(MIN_DELAY, MAX_DELAY)) =>
  new Promise((resolve) => {
    currentTimeout = setTimeout(resolve, ms);
  });

// Validation function
const validateAnswer = async () => {
  await delay(1000);
  const button = document.querySelector(BUTTON_VALIDATE_SELECTOR);
  if (button) {
    button.click();
  }
};

// Notification function
const toastAnswerFound = (found) => {
  const button_div_parent = document.querySelector(BUTTON_DIV_SELECTOR);
  if (found) {
    if (button_div_parent) {
      button_div_parent.style = "position:relative;";
      button_div_parent.innerHTML += `<p id="checkText" style="color: #06c909; position:absolute;right:-20px;"> ✓</p>`;
      const checkTextNode = document.getElementById("checkText");
      setTimeout(() => {
        if (checkTextNode) {
          checkTextNode.remove();
        }
      }, 2000);
    }
  } else {
    if (button_div_parent) {
      button_div_parent.style = "position:relative;";
      button_div_parent.innerHTML += `<p id="checkText" style="color: #f00; position:absolute;right:-20px;"> X</p>`;
      const checkTextNode = document.getElementById("checkText");
      setTimeout(() => {
        if (checkTextNode) {
          checkTextNode.remove();
        }
      }, 2000);
    }
  }
};
//Solving functions
const solveTest = async (answerText) => {
  if (answerText === undefined) {
    console.log("No answerText found in answer");
    return;
  }
  const choices = document.querySelectorAll(TEST_CHOICE_SELECTOR);
  if (!choices) {
    console.log("No choices found");
    return;
  }
  const correctChoiceBtn = Array.from(choices).findIndex(
    (choice) => choice.textContent === answerText
  );
  if (correctChoiceBtn !== -1) {
    await delay(randomDelay(MIN_DELAY, MAX_DELAY));
    choices[correctChoiceBtn].click();
  }
};
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      const h1Element = document.querySelector(H1_SELECTOR);

      if (h1Element && !processedH1s.has(h1Element.textContent)) {
        // Agregar el h1 al conjunto de procesados
        processedH1s.add(h1Element.textContent);

        console.log("Se ha detectado un nuevo H1:", h1Element.textContent); // Debug
        startSolving(h1Element.textContent);
      }
    }
  });
});

const config = { childList: true, subtree: true };

window.addEventListener("message", function (event) {
  if (event.source !== window) return;
  if (
    event.data.type &&
    (event.data.type === "FETCH_RESPONSE" || event.data.type === "XHR_RESPONSE")
  ) {
    const data = JSON.parse(event.data.data);
    if (data.questions) {
      questions.push(...data.questions);
      console.log(questions);
      const h1Element = document.querySelector(H1_SELECTOR);
      if (h1Element && !processedH1s.has(h1Element.textContent)) {
        processedH1s.add(h1Element.textContent);

        startSolving(h1Element.textContent);
      }
      console.log("Start observing body"); // Debug
      observer.observe(document.body, config); // Start observing the body
    }
  }
});
