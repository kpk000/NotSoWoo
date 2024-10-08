> [!CAUTION]
> NTS has been developed for educational purposes, please do not use it in unauthorized tests.
# Not So Woo
<div style="width:100%; display:flex; justify-content:center;">
<img src="/public/icon.png" style="width:300px; height:auto;"></img></div>

------

## Description
Not So Woo is a browser extension that automatically answers multiple-choice questions on the Wooclap platform.


## Demo
![example](/public/example.gif)

## Limitations
- Currently, it only works with multiple-choice question types.
- Questions with *Latex* commands may fail to parse, and NSW would not detect the answer.
- NTW uses *manifest v2* due to Firefox compatibility, *manifest v2* will no longer receibe support in some browsers such as chrome.



## Features
- Compatible with Chrome,Firefox,Microsoft Edge,Opera,Brave.
- User-friendly and simple
- No UI, just install the extension in the browser, one-step setup

## Installation
- Clone the repository: `git clone https://github.com/kpk000/NotSoWoo`
- ### Firefox
    - Go to `about:debugging`, click on *This Firefox*, then *Load Temporary Add-on*, and select the `manifest.json` file from the project directory.
- ### Chrome
    - Go to the Extensions page, enable Developer Mode, click on *Load unpacked*, and select the `Not So Woo` folder.

## Usage
- When a question is loaded, a checkmark icon will appear next to the validation button for two seconds if the extension knows the correct answer: <br/>
  <img src="/public/check.png" style="height:50px;">
- If the extension doesn’t know the answer, a red X will appear: <br/>
  <img src="/public/cross.png" style="height:50px;">
- When the checkmark is shown, the extension will automatically select the correct answers and click the validation button within a configurable time interval.

## Technical Overview
NSW (Not So Woo) uses a technique known as `Monkey Patching` to override the browser's native APIs (the `window` object) for *fetch* and *XMLHttpRequest*. By doing this, it intercepts HTTP responses received by the platform, acting as a sort of middleware.

NSW captures these responses, as the platform's API provides excessive data for improving UI/UX or something similar. This data is stored and used to answer the questions automatically.

