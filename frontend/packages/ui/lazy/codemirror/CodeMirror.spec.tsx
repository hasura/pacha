/**
 * @jest-environment jsdom
 */

import React, { useEffect, useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { vi } from 'vitest';

// import userEvent from '@testing-library/user-event';
// import '@testing-library/jest-dom';
import {
  default as ReactCodeMirror,
  ReactCodeMirrorRef,
} from './CodeMirror.Base';

it('ReactCodeMirror', async () => {
  const component = renderer.create(<ReactCodeMirror />);
  const tree = component.toJSON();
  if (tree && !Array.isArray(tree)) {
    expect(tree.type).toEqual('div');
    expect(tree.props.className).toEqual('cm-theme-none');
  }
});

it('ReactCodeMirror onChange', async () => {
  const handleChange = vi.fn(value => {
    expect(value).toEqual('# title');
    return Array.isArray(value) ? value.join() : value;
  });
  render(
    <ReactCodeMirror
      value="console.log('Hello world!')"
      onChange={handleChange}
    />
  );
  const input = await screen.findByRole<HTMLInputElement>('textbox'); // findByRole('textbox');
  fireEvent.change(input, { target: { textContent: '# title' } });
  const elm = screen.queryByText('# title');
  expect((elm as any).cmView.dom.innerHTML).toEqual('# title');
});

it('ReactCodeMirror onUpdate', async () => {
  render(
    <ReactCodeMirror
      value="console.log('Hello world!')"
      onUpdate={viewUpdate => {
        expect(viewUpdate.state.doc.length).toEqual(27);
      }}
    />
  );
});

it('ReactCodeMirror ref', async () => {
  function Demo() {
    const ref = useRef<ReactCodeMirrorRef>(null);
    useEffect(() => {
      expect(Object.keys(ref.current!)).toEqual(['editor', 'state', 'view']);
    }, [ref]);

    return <ReactCodeMirror ref={ref} value="console.log('Hello world!')" />;
  }
  render(<Demo />);
});

it('ReactCodeMirror theme', async () => {
  const component = renderer.create(<ReactCodeMirror theme="dark" />);
  const tree = component.toJSON();
  if (tree && !Array.isArray(tree)) {
    expect(tree.type).toEqual('div');
    expect(tree.props.className).toEqual('cm-theme-dark');
  }
});

it('ReactCodeMirror className', async () => {
  const component = renderer.create(<ReactCodeMirror className="test" />);
  const tree = component.toJSON();
  if (tree && !Array.isArray(tree)) {
    expect(tree.type).toEqual('div');
    expect(tree.props.className).toEqual('cm-theme-none test');
  }
});

it('ReactCodeMirror placeholder', async () => {
  render(<ReactCodeMirror placeholder="Hello World" className="test" />);
  const elm = screen.queryByText('Hello World');
  expect(elm!.style['pointerEvents']).toEqual('none');
  expect(elm!.className).toEqual('cm-placeholder');
});

it('ReactCodeMirror editable', async () => {
  render(<ReactCodeMirror editable={false} className="test" />);
  const text = screen.getByRole('textbox');
  expect(text.className).toEqual('cm-content');
  expect(text.tagName).toEqual('DIV');
});

it("ReactCodeMirror doesn't echo changes", async () => {
  const handleChange = vi.fn();
  const { rerender } = render(
    <ReactCodeMirror value="value a" onChange={handleChange} />
  );
  rerender(<ReactCodeMirror value="value b" onChange={handleChange} />);
  expect(handleChange).not.toHaveBeenCalled();
});
