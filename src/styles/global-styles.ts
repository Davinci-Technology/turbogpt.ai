import { createGlobalStyle } from 'styled-components';
import { StyleConstants } from './StyleConstants';
/* istanbul ignore next */
export const GlobalStyle = createGlobalStyle`
          html,
          body {
            height: 100%;
            width: 100%;
            line-height: 1.5;
          }

          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            padding-top: ${StyleConstants.NAV_BAR_HEIGHT};
            background-color: ${p => p.theme.background};
          }

          body.fontLoaded {
            font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }

          p,
          label {
            line-height: 1.5em;
          }

          input, select, button {
            font-family: inherit;
            font-size: inherit;
          }

          .icon {
            width: 1.5rem;
            height: 1.5rem;
          }


          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            border-radius: 6px;
            background-color: ${ p => p.theme.background === 'rgba(255,255,255,1)' ? '#e7e7e7' : '#626262' };
            border: 1px solid ${ p => p.theme.background === 'rgba(255,255,255,1)' ? '#c7c7c7' : '#9a9a9a' };
            box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
          }

          ::-webkit-scrollbar-thumb {
            border-radius: 6px;
            background-color: ${ p => p.theme.background === 'rgba(255,255,255,1)' ? '#a2a2a2' : '#494949' };
          }


    `
;
