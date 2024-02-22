# Node package for converting IPA to valid SSML elements
[![Node.js CI](https://github.com/theresnotime/ipa-to-ssml/actions/workflows/node.js.yml/badge.svg)](https://github.com/theresnotime/ipa-to-ssml/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/theresnotime/ipa-to-ssml/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/theresnotime/ipa-to-ssml/actions/workflows/codeql-analysis.yml)
[![install size](https://packagephobia.com/badge?p=@theresnotime/ipa-to-ssml)](https://packagephobia.com/result?p=@theresnotime/ipa-to-ssml)

Sometimes you just wish there was a Node.js package that did a *thing*, such as convert [IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) to a valid [SSML](https://en.wikipedia.org/wiki/Speech_Synthesis_Markup_Language) element — sometimes you wish it ***so much*** you end up writing it. 😅

## Installing
Go grab it on [npmjs](https://www.npmjs.com/package/@theresnotime/ipa-to-ssml) via `npm i @theresnotime/ipa-to-ssml`

You'll then be all set to `require` it:
```js
const ipaToSSML = require('@theresnotime/ipa-to-ssml');
```
Simples!

## IPA goes in..
We pass the represented `word`, its `ipa` representation, and optionally a `variant` of SSML to generate:

```js
let ssmlResult = await ipaToSSML.convertToSSML('hello', '/həˈləʊ/', 'default');
```

## ..and SSML comes out!
```xml
<?xml version="1.0"?>
<speak version="1.1"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.w3.org/2001/10/synthesis
        http://www.w3.org/TR/speech-synthesis11/synthesis.xsd"
    xml:lang="en-US">
    <phoneme alphabet="ipa" ph="/həˈləʊ/">hello</phoneme>
</speak>
```
*(don't blame **me** for how ugly that looks, blame [the w3c](https://www.w3.org/TR/speech-synthesis11/)...)*

## Variants
 - `default` — this is valid SSML, and *should* be accepted by all (SSML accepting) TTS engines
 - `polly` — for now, just a copy of `default` 🤷‍♀️ works with [Amazon Polly](https://aws.amazon.com/polly/)
 - `larynx` — this larger SSML element is required for getting [rhasspy/larynx](https://github.com/rhasspy/larynx) (a *very* cool TTS engine..) to play ball

## Contributing
This is the first module I've ever published to npmjs, *and* my first foray into Node modules, so there's bound to be things you spot and want to fix — I'd love to get your feedback and PRs!

### Quick steps
 1. [Fork n' clone](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) this repo
 2. Do a `npm install`
 3. Run `npm test` because who knows, maybe its already broken
 4. Hack!

### Tests? For JavaScript!?
In writing this I discovered [Jest](https://jestjs.io/), a *"delightful JavaScript Testing Framework with a focus on simplicity"* — I dunno about that, as I've never written tests for JavaScript, but it was pretty painless :> they live in [tests/](tests/) and the syntax for them is [super simple](https://jestjs.io/docs/getting-started).