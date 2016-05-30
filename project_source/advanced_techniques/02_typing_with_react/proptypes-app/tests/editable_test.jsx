import React from 'react';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithTag,
  Simulate
} from 'react-addons-test-utils';
import assert from 'assert';
import Editable from '../app/components/Editable';

describe('Editable', function() {
  it('renders value', function() {
    const value = 'value';
    const component = new Editable({value});

    assert.equal(component.props.children, value);
  });

  it('triggers onEdit through the DOM', function() {
    let triggered = false;
    const newValue = 'value';
    const onEdit = (val) => {
      triggered = true;
      assert.equal(val, newValue);
    };
    const component = renderIntoDocument(
      <Wrapper>
        <Editable editing={true} value={'value'} onEdit={onEdit} />
      </Wrapper>
    );

    const input = findRenderedDOMComponentWithTag(component, 'input');
    input.value = newValue;

    Simulate.blur(input);

    assert.equal(triggered, true);
  });
});

class Wrapper extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}
