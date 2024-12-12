import React, { useEffect, useState } from 'react';
import LoadingState from './LoadingState';
import ErrorBoundary from './ErrorBoundary';
import { validateArray } from './utils';

const withDataFetching = (WrappedComponent, options = {}) => {
  const {
    loadingStateType = 'default',
    validateData = (data) => data,
    retryOnError = true,
  } = options;

  return function WithDataFetchingComponent({ fetchData, ...props }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDataSafely = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (typeof fetchData !== 'function') {
          throw new Error('fetchData must be a function');
        }

        const result = await fetchData();
        const validatedData = validateData(result);
        setData(validatedData);
      } catch (err) {
        setError(err);
        console.error('Data fetching error:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDataSafely();
    }, []);

    if (loading) {
      return <LoadingState type={loadingStateType} />;
    }

    if (error) {
      return (
        <ErrorBoundary
          onRetry={retryOnError ? fetchDataSafely : undefined}
        >
          <WrappedComponent {...props} data={data} error={error} />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <WrappedComponent {...props} data={data} />
      </ErrorBoundary>
    );
  };
};

export default withDataFetching;
