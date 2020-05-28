import React, { useEffect } from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import SplashScreen from 'react-native-splash-screen';

import { Theme } from './app/constants/themes';
import { Entry } from './app/Entry';
import { FlagsProvider } from './app/helpers/Flags';
import { PermissionsProvider } from './app/PermissionsContext';
import VersionCheckService from './app/services/VersionCheckService';

enableScreens();

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    VersionCheckService.start();
  }, []);

  return (
    <FlagsProvider>
      <MenuProvider>
        <SafeAreaProvider>
          <Theme use='default'>
            <PermissionsProvider>
              <Entry />
            </PermissionsProvider>
          </Theme>
        </SafeAreaProvider>
      </MenuProvider>
    </FlagsProvider>
  );
};

export default App;
