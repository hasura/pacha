import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useSelectedArtifacts = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getSelectedArtifacts = useCallback((): string[] => {
    const searchParams = new URLSearchParams(location.search);
    const artifactParam = searchParams.get('artifact');
    return artifactParam ? artifactParam.split(',') : [];
  }, [location.search]);

  const updateSelectedArtifacts = useCallback(
    (newSelection: string[]) => {
      const searchParams = new URLSearchParams(location.search);
      if (newSelection.length > 0) {
        searchParams.set('artifact', newSelection.join(','));
      } else {
        searchParams.delete('artifact');
      }
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      });
    },
    [location.pathname, location.search, navigate]
  );

  const resetSelectedArtifacts = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('artifact');
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  }, [location.pathname, location.search, navigate]);

  const removeSelectedArtifact = useCallback(
    (artifactToRemove: string) => {
      const currentSelection = getSelectedArtifacts();
      const newSelection = currentSelection.filter(
        artifact => artifact !== artifactToRemove
      );
      updateSelectedArtifacts(newSelection);
    },
    [getSelectedArtifacts, updateSelectedArtifacts]
  );

  return {
    selectedArtifacts: getSelectedArtifacts(),
    updateSelectedArtifacts,
    resetSelectedArtifacts,
    removeSelectedArtifact,
  };
};

export default useSelectedArtifacts;
