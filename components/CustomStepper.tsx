import { Button, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import styles from "../styles/stepper.module.scss";

type title = {
  title: string;
  optional?: boolean;
};
interface stepperProps {
  children: React.ReactNode[];
  titles: title[];
}

const CustomStepper = (props: stepperProps) => {
  const { titles } = props;
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return titles[step].optional;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Stepper activeStep={activeStep}>
        {titles.map((title, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Opciono</Typography>
            );
          }

          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={title.title} {...stepProps}>
              <StepLabel {...labelProps}>{title.title}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === titles.length ? (
        <>
          All steps completed - you&apos;re finished
          <Box>
            <Box />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : (
        <>
          {props.children[activeStep]}
          <Box className={styles.actions}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}

            <Button onClick={handleNext}>
              {activeStep === titles.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CustomStepper;
