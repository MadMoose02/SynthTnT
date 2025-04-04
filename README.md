# SynthTnT - Trinidadian Speech Synthesis

## Instructions

### Clone the Repository
To clone the repository, run the following command in your terminal:

```bash
git clone https://github.com/MadMoose02/SynthTnT.git
```

*If you do not have Git installed, you can download it [here](https://git-scm.com/downloads)*

### Configure Server Environment
For this project, we are using the Yarn package manager coupled with Express.js for the backend.
If you do not have Yarn installed, you can follow the instructions [here](https://classic.yarnpkg.com/lang/en/docs/install/). 

Additionally, you can use NPM to install Yarn by entering the following commands in your terminal:

```bash
cd SynthTnT
npm install -g yarn
```

*If you do not have NPM installed, you can follow the instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)*

### Install Dependencies
As listed in [package.json](https://github.com/MadMoose02/SynthTnT/blob/main/package.json), the following dependencies are **required**:

 - `dotenv`
 - `multer`
 - `stream`
 - `express`
 - `googleapis`
 - `ibm-watson`

To install these dependencies, run the following command in your terminal:

```bash
cd SynthTnT
yarn add dotenv multer stream express googleapis ibm-watson
yarn install
```

### Start the Server
To start the server, run the following command in your terminal:

```bash
cd SynthTnT
yarn start
```

### Access the Web Application
To access the web application, open your browser and navigate to `http://localhost:3000/`. Congratulations! You have successfully set up the SynthTnT web application.

## Contributors
 - [Keshan Moosai](https://github.com/MadMoose02)
 - [Shaniah Baldeo](https://github.com/officialshayb)