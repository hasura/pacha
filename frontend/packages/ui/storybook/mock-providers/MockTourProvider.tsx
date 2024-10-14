import { TourContext } from '@console/features/guided-tour/TourContext';

export const MockTourProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <TourContext.Provider
      value={{
        isTourOpen: false,
        openTour: () => {},
        closeTour: () => {},
        activeVisualizationNode: null,
        tourStartedAtLeastOnce: false,
        tourCompleted: false,
        seenTourWelcomeModal: false,
        tourTooltipMessage: '',
        tourClosedCount: 0,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};
