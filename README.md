# Probloom: AI-Powered Practice Problem Generator
## Generating practice problems to help your academic career bloom! :D

Group project for SFU CMPT 276 (4-person team, Scrum).

Originally deployed on Vercel (demo no longer live).

**My role (Julie Wu):** Led the About and Team pages; wrote unit and integration tests
(Jest, Cypress) that ran through CI/CD on every push; fixed a bug where the input
didn't reset after a refresh or restart.

**Impact:** In a timed comparison, cut the time to get a 10-problem set from
~45 minutes manually to under a minute.

## Local Setup Instructions

1. Ensure you meet the following prerequisites:
    1. You've installed the latest version of Node.js
2. Clone the repo
3. Navigate to the project directory
4. Install the dependencies using `npm install`
5. Configure the environment:
    1. Create a `.env.local` file in the root of the project
    2. Add an OpenAI API key to the file using `NEXT_PUBLIC_OPENAI_API_KEY=some_secret_key`
        1. Note: do not commit this file to the repo
    3. Add another variable `NEXT_PUBLIC_HIDE_DEFAULT_QUIZ=1`. This variable hides and shows the quiz section.
6. Run Probloom using `npm run dev`
7. Open a browser and go to `http://localhost:3000`

## Testing Instructions

To run the integration tests:
`npm run cypress -- --e2e`

To run the unit tests:
`npx jest`

## Project Objectives

Create a web app that students can use to generate practice problems from their own course
material (PDF or plain text), with checkable solutions, to make studying more effective.

## Tech Stack

- Front end: HTML, CSS, TypeScript, Next.js
- Back end: TypeScript, Node.js
- APIs: OpenAI, PDF.js
- Testing: Jest, Cypress
- Hosting: Vercel

## Contributors

- Zoe Wong (zswong)
- Lucas De Biasio (LucasDeBiasio)
- Julie Wu (joolzmusic)
- Yan Jin Song (Awesomedonut)
