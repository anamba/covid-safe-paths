import { createAction } from '@reduxjs/toolkit';
import type { HealthcareAuthority } from '../../types';

type Payload = {
  healthcareAuthorities: HealthcareAuthority[];
  // No custom URLs like toggleSelect action
};

const AUTO_SELECT_HDOH =
  'AUTO_SELECT_HDOH';

const autoSelectHdohAction = createAction(
  AUTO_SELECT_HDOH,
  ({ healthcareAuthorities }: Payload) => ({
    payload: { healthcareAuthorities },
  }),
);

export default autoSelectHdohAction;
