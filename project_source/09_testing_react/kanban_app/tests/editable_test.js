import React from 'react/addons';
import assert from 'assert';

import Editable from 'app/components/Editable.jsx';

const {
  renderIntoDocument,
  findRenderedDOMComponentWithClass,
  findRenderedDOMComponentWithTag,
  Simulate
} = React.addons.TestUtils;

describe('Editable', () => {
  it('renders value', () => {
    const value = 'value';
    const component = renderIntoDocument(
      <Editable value={value} />
    );

    const valueComponent = findRenderedDOMComponentWithClass(component, 'value');

    assert.equal(valueComponent.getDOMNode().textContent, value);
  });

  it('enters edit mode', () => {
    const value = 'value';
    const component = renderIntoDocument(
      <Editable value={value} />
    );

    const valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    Simulate.click(valueComponent);

    const input = findRenderedDOMComponentWithTag(component, 'input');

    assert.equal(input.getDOMNode().value, value);
  });

  it('triggers onEdit', () => {
    const newValue = 'value';
    const onEdit = (val) => {
      assert.equal(val, newValue);
    };
    const component = renderIntoDocument(
      <Editable value={'value'} onEdit={onEdit} />
    );

    let valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    Simulate.click(valueComponent);

    const input = findRenderedDOMComponentWithTag(component, 'input');
    input.value = newValue;

    Simulate.blur(input);
  });

  it('allows editing', () => {
    const newValue = 'value';
    const component = renderIntoDocument(
      <Editable value={'value'} onEdit={() => {}} />
    );

    let valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    Simulate.click(valueComponent);

    const input = findRenderedDOMComponentWithTag(component, 'input');
    input.value = newValue;

    Simulate.blur(input);

    valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    assert.equal(valueComponent.getDOMNode().textContent, newValue);
  });

  it('allows deletion', () => {
    let deleted = false;
    const onDelete = () => {
      deleted = true;
    }
    const component = renderIntoDocument(
      <Editable value={'value'} onDelete={onDelete} />
    );

    let deleteComponent = findRenderedDOMComponentWithClass(component, 'delete');
    Simulate.click(deleteComponent);

    assert.equal(deleted, true);
  });
});
