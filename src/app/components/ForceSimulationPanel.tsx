"use client";

import { useState } from "react";
import { PLANETS } from "../lib/planetData";
import styled from "styled-components";

// Styled components
const PanelContainer = styled.div`
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 10;
`;

const PanelButton = styled.button`
  background-color: rgba(37, 99, 235, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(29, 78, 216, 0.9);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const Panel = styled.div`
  background-color: rgba(17, 24, 39, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  width: 18rem;
  margin-top: 0.5rem;
`;

const PanelTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(75, 85, 99, 1);
  padding-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const FormInput = styled.input`
  width: 100%;
  background-color: rgba(31, 41, 55, 1);
  border: 1px solid rgba(75, 85, 99, 1);
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  color: white;
`;

const FormSelect = styled.select`
  width: 100%;
  background-color: rgba(31, 41, 55, 1);
  border: 1px solid rgba(75, 85, 99, 1);
  border-radius: 0.25rem;
  padding: 0.375rem 0.75rem;
  color: white;
`;

const Grid3Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const Grid2Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
`;

const ApplyButton = styled.button`
  background-color: rgba(22, 163, 74, 1);
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  flex: 1;

  &:hover {
    background-color: rgba(21, 128, 61, 1);
  }
`;

const ResetButton = styled.button`
  background-color: rgba(220, 38, 38, 1);
  color: white;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  flex: 1;

  &:hover {
    background-color: rgba(185, 28, 28, 1);
  }
`;

const SpacedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LabelSmall = styled.label`
  display: block;
  font-size: 0.75rem;
`;

interface ForceSimulationPanelProps {
  onApplyForce: (
    planetName: string,
    forceVector: { x: number; y: number; z: number },
    deltaTime: number,
    duration: number
  ) => void;
  onReset: () => void;
}

export default function ForceSimulationPanel({
  onApplyForce,
  onReset,
}: ForceSimulationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState(Object.keys(PLANETS)[0]);
  const [forceVector, setForceVector] = useState({ x: 0, y: 0, z: 0 });
  const [deltaTime, setDeltaTime] = useState(0.1);
  const [duration, setDuration] = useState(10);

  const handleApplyForce = () => {
    onApplyForce(selectedPlanet, forceVector, deltaTime, duration);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <PanelContainer>
      <PanelButton onClick={() => setIsOpen(!isOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
        Force Simulator
      </PanelButton>

      {isOpen && (
        <Panel>
          <PanelTitle>Force Simulation</PanelTitle>

          <SpacedContainer>
            {/* Planet Selection */}
            <FormGroup>
              <FormLabel>Planet</FormLabel>
              <FormSelect
                value={selectedPlanet}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlanet(e.target.value)}
                title="Select a planet"
                aria-label="Select a planet"
              >
                {Object.keys(PLANETS).map((planetName) => (
                  <option key={planetName} value={planetName}>
                    {planetName.charAt(0).toUpperCase() + planetName.slice(1)}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            {/* Force Vector */}
            <FormGroup>
              <FormLabel>Force Vector (N)</FormLabel>
              <Grid3Columns>
                <div>
                  <LabelSmall>X</LabelSmall>
                  <FormInput
                    type="number"
                    value={forceVector.x}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForceVector({
                        ...forceVector,
                        x: parseFloat(e.target.value) || 0,
                      })
                    }
                    title="X component of force vector"
                    placeholder="X force"
                    aria-label="X component of force vector"
                  />
                </div>
                <div>
                  <LabelSmall>Y</LabelSmall>
                  <FormInput
                    type="number"
                    value={forceVector.y}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForceVector({
                        ...forceVector,
                        y: parseFloat(e.target.value) || 0,
                      })
                    }
                    title="Y component of force vector"
                    placeholder="Y force"
                    aria-label="Y component of force vector"
                  />
                </div>
                <div>
                  <LabelSmall>Z</LabelSmall>
                  <FormInput
                    type="number"
                    value={forceVector.z}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForceVector({
                        ...forceVector,
                        z: parseFloat(e.target.value) || 0,
                      })
                    }
                    title="Z component of force vector"
                    placeholder="Z force"
                    aria-label="Z component of force vector"
                  />
                </div>
              </Grid3Columns>
            </FormGroup>

            {/* Time Parameters */}
            <Grid2Columns>
              <div>
                <FormLabel>Delta Time (s)</FormLabel>
                <FormInput
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={deltaTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeltaTime(parseFloat(e.target.value) || 0.1)}
                  title="Delta time for simulation"
                  placeholder="Delta time"
                  aria-label="Delta time for simulation"
                />
              </div>
              <div>
                <FormLabel>Duration (s)</FormLabel>
                <FormInput
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={duration}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(parseFloat(e.target.value) || 10)}
                  title="Duration of force application"
                  placeholder="Duration"
                  aria-label="Duration of force application"
                />
              </div>
            </Grid2Columns>

            {/* Action Buttons */}
            <ButtonContainer>
              <ApplyButton onClick={handleApplyForce}>
                Apply Force
              </ApplyButton>
              <ResetButton onClick={handleReset}>
                Reset
              </ResetButton>
            </ButtonContainer>
          </SpacedContainer>
        </Panel>
      )}
    </PanelContainer>
  );
}