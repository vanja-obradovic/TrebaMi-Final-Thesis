import { Button, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import styles from "../styles/stepper.module.scss";

type title = {
  title: string;
  optional?: boolean;
  submitBtn?: React.MutableRefObject<HTMLButtonElement>;
  action?: () => void;
};

interface stepperProps {
  children: React.ReactNode[];
  titles: title[];
  closeDialog?: (state: boolean) => void; //TODO srediti ovo kako treba
  dialogLoading?: boolean;
  canTransition?: boolean;
}

const CustomStepper = (props: stepperProps) => {
  const { titles, closeDialog, dialogLoading, canTransition } = props;
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return titles[step] ? titles[step].optional : false;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const isFinalStep = () => {
    return activeStep === titles.length - 1;
  };

  const isFirstStep = () => {
    return activeStep === 0;
  };

  const handleNext = () => {
    if (titles[activeStep].submitBtn)
      titles[activeStep].submitBtn.current.click();
    else if (titles[activeStep].action) titles[activeStep].action();

    if (canTransition) {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }

      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
    if (isFinalStep()) closeDialog(false);
  };

  const handleBack = () => {
    isFirstStep()
      ? closeDialog(false)
      : setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
    <>
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
      {/* {activeStep === titles.length ? (
        <>
          Oglas kompletiran
          <Box>
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </>
      ) : ( */}
      <>
        {props.children[activeStep]}
        <Box className={styles.actions}>
          <Button onClick={handleBack} variant="outlined">
            {isFirstStep() ? "Otkazi" : "Nazad"}
          </Button>

          {!isFinalStep() && isStepOptional(activeStep) && (
            <Button color="secondary" onClick={handleSkip}>
              Preskoci
            </Button>
          )}

          <Button onClick={handleNext} variant="contained">
            {isFinalStep() ? "Potvrdi" : "Dalje"}
          </Button>
        </Box>
      </>
      {/* )} */}
    </>
  );
};

export default CustomStepper;
