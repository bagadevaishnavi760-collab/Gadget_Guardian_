# Gadget Guardian

Smart E-Waste Management and Gadget Lifespan Prediction System

Purpose:

The application predicts the remaining useful lifespan of electronic gadgets using a machine learning model and gives recommendations to improve gadget health and reduce e-waste.

Design:

Use a clean eco-tech theme with white, dark green, teal and soft gray colors.

The UI should feel modern, professional and suitable for a college engineering project.

Use cards, icons, progress bars, gauges and clean charts.

Make the website responsive for desktop and mobile.

Pages:

1. Home Page

- Hero section with title:

  "Know Your Gadget. Extend Its Life. Reduce E-Waste."

- Short explanation of how the system works.

- Button: "Analyze My Gadget"

- Cards explaining:

  Predict Lifespan

  Monitor Gadget Health

  Get Maintenance Advice

  Reduce E-Waste

- Add a small sustainability/e-waste statistics section.

- Add "How It Works" with 4 steps:

  Enter Gadget Details → AI Analysis → Health Report → Smart E-Waste Decision.

2. Analyze Gadget Page

Create a professional form containing:

- Gadget Type dropdown: Laptop, Smartphone, Tablet, Smartwatch

- Age in Years

- Daily Usage Hours

- Battery Health Percentage

- Charge Cycles

- Overheating Level from 1 to 5

- Physical Condition from 1 to 5

- Maintenance Frequency from 1 to 5

- Repair Count

- Performance Score from 0 to 100

- Storage Used Percentage

- Software Updated: Yes/No

- Environmental Stress from 1 to 5

- Expected Life in Months

Use sliders where appropriate.

Add validation and explanations for rating scales.

Button: "Analyze Gadget Health"

3. Results Dashboard

Display:

- Gadget Type

- Predicted Remaining Lifespan in months and years

- Gadget Health Score out of 100

- Health Category: Excellent / Good / Moderate / Poor / Critical

- Progress bar or circular gauge

- Risk factor cards

- Maintenance recommendations

- Ways to extend device lifespan

- Final E-Waste Recommendation

Possible e-waste recommendations:

Continue Using

Repair / Maintain

Refurbish / Reuse

Donate / Resell

Reuse for Parts

Authorized E-Waste Recycling

Add a section titled "Why this recommendation?" explaining the main factors responsible for the result.

4. E-Waste Guide Page

Explain:

- Reuse

- Repair

- Refurbish

- Donate

- Resell

- Component Recovery

- Recycling

- Safe disposal

Show the preferred hierarchy:

Reuse → Repair → Refurbish → Recycle → Disposal

5. About Project Page

Include:

- Problem Statement

- Project Objective

- Machine Learning Model: Multiple Linear Regression

- Input Features

- Sustainability Objective

- Technologies Used

6. Optional User Dashboard

- Previous analyzed gadgets

- Date analyzed

- Health score

- Predicted lifespan

- Recommendation

Important:

Create the frontend in React.

Keep API calls in a separate service file.

Create an API function POST /predict that sends the gadget form data as JSON.

For now, use mock prediction data so the interface works.

Do not hardcode the final ML logic into the frontend because the real model will later be connected using a Python Flask or FastAPI backend.

Make the design visually attractive and professional with good spacing, rounded cards, subtle shadows, charts and Lucide icons.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8b91a35e-8529-46cc-8578-f6bdd11aac2e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
