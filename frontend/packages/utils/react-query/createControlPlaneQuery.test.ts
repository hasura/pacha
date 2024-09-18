import { controlPlaneClient } from '@/data/control-plane-client';
import { createControlPlaneQuery } from './createControlPlaneQuery';

describe('createControlPlaneQuery', () => {
  it('can infer the queryKey from a control plane function', () => {
    const query = createControlPlaneQuery({
      inferQueryKey: true,
      fetcher: controlPlaneClient.getBuildById,
    });

    expect(query.getKey()).toEqual(['GET_BUILD_BY_ID']);

    const query2 = createControlPlaneQuery({
      inferQueryKey: true,
      fetcher: controlPlaneClient.setDefaultPaymentMethod,
    });

    expect(query2.getKey()).toEqual(['SET_DEFAULT_PAYMENT_METHOD']);

    const query3 = createControlPlaneQuery({
      inferQueryKey: true,
      fetcher: controlPlaneClient.getCurrentUser,
    });

    expect(query3.getKey()).toEqual(['GET_CURRENT_USER']);
  });

  it('throws an error if inferKeyFromFetcher is true and controlPlaneFetcher is not a control plane function', () => {
    expect(() => {
      createControlPlaneQuery({
        inferQueryKey: true,
        fetcher: () => {},
      });
    })
      .toThrow(`Could not infer queryKey from controlPlaneFetcher. Please provide a queryKey or controlPlaneKey.

Original error:

Error: Function not found on controlPlaneClient:

: ()=>{}`);
  });

  it('can use a controlPlaneKey to create a queryKey', () => {
    const query = createControlPlaneQuery({
      queryKeyFromControlPlaneKey: 'getBuildById',
      fetcher: controlPlaneClient.getBuildById,
    });

    expect(query.getKey()).toEqual(['GET_BUILD_BY_ID']);
  });

  it('can accept a query key', () => {
    const query = createControlPlaneQuery({
      queryKey: ['GET_BUILD_BY_ID'],
      fetcher: controlPlaneClient.getBuildById,
    });

    expect(query.getKey()).toEqual(['GET_BUILD_BY_ID']);
  });
});
