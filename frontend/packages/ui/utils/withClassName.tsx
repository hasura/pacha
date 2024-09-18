import React from 'react';
import clsx from 'clsx';

/**
 * Higher-order component that adds a className to a React component and preserves component and prop types while also forwarding refs. Especially useful for applying tailwind classes to third-party library components.
 *
 * @template P - Type of the props of the WrappedComponent. Defaults to `unknown`.
 *
 * @param {React.ComponentType<P & { forwardedRef?: React.Ref<unknown> }>} WrappedComponent - The React component to wrap.
 * @param {string} className - The CSS class name to add to the WrappedComponent.
 *
 * @returns {React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<any>>} - A forward ref React component that has the provided className merged with the original WrappedComponent's className (if any).
 *
 * @example
 * const StyledComponent = withClassName(OriginalComponent, 'fixed top-0 left-0 h-full w-full');
 * <SomeThirdPartyComponent prop1="value1" />
 */

export function withClassName<P = unknown>(
  WrappedComponent: React.ComponentType<
    P & { forwardedRef?: React.Ref<unknown> }
  >,
  className: string
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<any>
> {
  return React.forwardRef<any, P>((props, ref) => {
    const propsClassName =
      props &&
      typeof props === 'object' &&
      'className' in props &&
      typeof props.className === 'string' &&
      props.className;

    return (
      <WrappedComponent
        {...props}
        className={clsx(propsClassName, className)}
        ref={ref}
      />
    );
  });
}
