import { NativeSelect } from '@mantine/core';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash/debounce';
import styled from 'styled-components';
import { getModel } from '../slice/selectors';
import { useChatOptionsSlice } from '../slice';
import { ApiModel } from '../slice/types';

export function PickModel() {
  const [model, setModel] = React.useState(useSelector(getModel));
  const dispatch = useDispatch();
  const { actions } = useChatOptionsSlice();

  const debouncedDispatch = useCallback(
    debounce(model => {
      dispatch(actions.setModel(model));
    }, 250),
    [dispatch],
  );

  useEffect(() => {
    debouncedDispatch(model);
  }, [model, debouncedDispatch]);

  return (
    <Wrapper>
      <NativeSelect
        value={model}
        onChange={event => setModel(event.currentTarget.value as ApiModel)}
        data={['gpt-3.5-turbo-16k-0613', 'gpt-4-0613', 'gpt-4-1106-preview', 'gpt-4-turbo-2024-04-09', 'gpt-4o']}
        label="Select your model"
        description="This allows you to pick the model you want to use. To use GPT-4 your API Key must have access to it."
        variant="default"
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-bottom: 20px;
`;
